'use strict';

import utils from './utils';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import sizeOf from 'image-size';

import formidable from 'formidable';
import { spawn } from 'child_process';

let couchdb = utils.getDb();
const ZF_SCRIPT_PATH = '/home/ubuntu/Learnable_ZF_web/seg_form_no_known_struct.py';
const ZF_CUSTOM_SCRIPT_PATH = '/home/ubuntu/Learnable_ZF_web/custome_box_recog.py';

let getMissions = (req, res) => {
    console.log('getMissions');
    let db = couchdb.use('roy-config');
    let query = { descending: true },
        design = 'zf',
        view = '';
    if (req.query.admin === 'yes' && req.headers['verified-token'].type === 'admin') {
        view = 'zf_mission_admin';
    } else {
        view = 'zf_mission';
        query.startkey = [req.headers['verified-token'].email, 'ZZ'];
        query.endkey = [req.headers['verified-token'].email];
    }
    db.view(design, view, query, (err, body) => {
        if (err) {
            res.status(err.statusCode).send(err.reason);
            return;
        } else {
            res.status(200).send(body.rows.reduce((arr, obj) => {
                if (typeof obj.value.image !== 'undefined') {
                    obj.value.image_url = `http://couchdb1.learnable.ai/roy-config/${obj.value.id}/${obj.value.image}`
                    delete obj.value.image;
                }
                arr.push(obj.value);
                return arr;
            }, []));
        }
    })
}

let getMission = (req, res) => {
    console.log('getMission');
    let db = couchdb.use('roy-config');
    let mission_id = req.params.mission_id;
    db.get(mission_id, (err, doc) => {
        if (err) {
            res.status(err.statusCode).send(err.reason);
            return;
        } else {
            if ((req.query.admin === 'yes' && req.headers['verified-token'].type === 'admin') || req.headers['verified-token'].email === doc.account) {
                res.status(200).send(doc);
            } else {
                res.status(400).send(`not found mission \<${mission_id}\> in account ${req.headers['verified-token'].email}.`);
            }
        }
    })
}

let addMission = (req, res) => {
    console.log('addMission');
    let db = couchdb.use('roy-config');
    let received_file = {};
    let default_folder = `zf_images_${req.headers['verified-token'].email}-${new Date().getTime()}`,
        dir_path = '/tmp/',
        script_path = ZF_SCRIPT_PATH,
        cords = [],
        temp_cords = [],
        img_file = 'out_im.jpg',
        txt_file = 'out_text.txt';
    if (typeof req.body.cords !== 'undefined' && Array.isArray(req.body.cords)) {
        req.body.cords.forEach(c => {
            temp_cords.push(JSON.parse(c))
        })
    } else if (typeof req.body.cords !== 'undefined') {
        temp_cords.push(JSON.parse(req.body.cords))
    }
    console.log(temp_cords);
    if (temp_cords.length > 0) {
        script_path = ZF_CUSTOM_SCRIPT_PATH;
        img_file = 'custom_seg.jpg';
        txt_file = 'custome_seg_out.txt';
    }
    if (!Array.isArray(req.files.images)) {
        received_file = req.files.images;
    } else {
        received_file = req.files.images[0];
    }
    if (typeof received_file === 'undefined') {
        res.status(400).send('not received image file.');
        return;
    }
    if (temp_cords.length > 0) {
        let dimensions = sizeOf(received_file.path);
        temp_cords.forEach(temp_cord => {
            let cord = {
                left: (dimensions.width || 0) * temp_cord.x / 100,
                up: (dimensions.height || 0) * temp_cord.y / 100,
                right: (dimensions.width || 0) * (temp_cord.x + temp_cord.width) / 100,
                down: (dimensions.height || 0) * (temp_cord.y + temp_cord.height) / 100
            }
            cord.left = isNaN(cord.left) ? 0 : Math.round(cord.left);
            cord.up = isNaN(cord.up) ? 0 : Math.round(cord.up);
            cord.right = isNaN(cord.right) ? 0 : Math.round(cord.right);
            cord.down = isNaN(cord.down) ? 0 : Math.round(cord.down);
            cords.push(cord);
        })
    }

    if (!fs.existsSync(dir_path + default_folder)) {
        fs.mkdirSync(dir_path + default_folder);
    }

    let file_path = dir_path + default_folder + '/' + received_file.originalFilename,
        output_dir = dir_path + default_folder + '/output';
    fs.renameSync(received_file.path, file_path);
    if (!fs.existsSync(output_dir)) {
        fs.mkdirSync(output_dir);
    }

    let mission_id = default_folder,
        docs = [],
        sol_ids = [];
    if (cords.length > 0) {
        cords.forEach((cord, index) => {
            let solution_doc = {
                _id: `${mission_id}-solution-${new Date().getTime()}-${index}`,
                mission: mission_id,
                output_dir: output_dir + `/${index}`,
                solution: '',
                image: '',
                created_date: new Date().toISOString(),
                cord: cord,
                doc_type: 'zf_solution',
                isFinish: false,
                isSuccess: false,
                log: {}
            }
            sol_ids.push(solution_doc._id);
            docs.push(solution_doc);
        })
    } else {
        let solution_id = `${mission_id}-solution-${new Date().getTime()}`;
        let solution_doc = {
            _id: solution_id,
            mission: mission_id,
            output_dir: output_dir,
            solution: '',
            image: '',
            created_date: new Date().toISOString(),
            doc_type: 'zf_solution',
            isFinish: false,
            isSuccess: false,
            log: {}
        }
        sol_ids.push(solution_doc._id);
        docs.push(solution_doc);
    }

    db.bulk({ docs: docs }, (err, body) => {
        if (err) {
            console.log(err);
            res.status(err.statusCode).send(err.reason);
            return;
        } else {
            let mission_doc = {
                account: req.headers['verified-token'].email,
                created_date: new Date().toISOString(),
                image: received_file.originalFilename,
                dir_path: dir_path + default_folder,
                check: false,
                doc_type: 'zf_mission'
            }
            let attaches = []
            attaches.push({ name: received_file.originalFilename, data: fs.readFileSync(file_path), content_type: received_file.type });
            db.multipart.insert(mission_doc, attaches, mission_id, (err, body) => {
                if (err) {
                    console.log(err);
                    res.status(err.statusCode).send(err.reason);
                    return;
                } else {
                    res.status(200).send('mission has been submit.');
                    execute_bulk(default_folder, script_path, file_path, sol_ids, img_file, txt_file);
                }
            })
        }
    })
}

let updateMission = (req, res) => {
    console.log('updateMission');
    let db = couchdb.use('roy-config');
    let check = req.body.check,
        mission_id = req.params.mission_id;
    db.get(mission_id, (err, doc) => {
        if (err) {
            res.status(err.statusCode).send(err.reason);
            return;
        } else {
            if ((req.query.admin === 'yes' && req.headers['verified-token'].type === 'admin') || req.headers['verified-token'].email === doc.account) {
                doc.check = check;
                db.insert(doc, (err, body) => {
                    if (err) {
                        res.status(err.statusCode).send(err.reason);
                        return;
                    } else {
                        res.status(200).send(`mission \<${mission_id}\> updated.`);
                    }
                })
            } else {
                res.status(400).send(`not found mission \<${mission_id}\> in account ${req.headers['verified-token'].email}.`);
            }
        }
    })
}

let removeMission = (req, res) => {
    console.log('removeMission');
    let db = couchdb.user('roy-config');

}

let execute_bulk = (mission_id, script_path, input_file, sol_ids, img_file, txt_file) => {
    let index = 0;
    func_execute(mission_id, script_path, input_file, sol_ids, index, img_file, txt_file, () => {
        console.log(`${mission_id} solution is done.`);
    });
}

let func_execute = (mission_id, script_path, input_file, sol_ids, index, img_file, txt_file, cb) => {
    execute(mission_id, script_path, input_file, sol_ids[index], img_file, txt_file, () => {
        if (++index >= sol_ids.length) {
            cb();
        } else {
            func_execute(mission_id, script_path, input_file, sol_ids, index, img_file, txt_file, cb);
        }
    })
}

let execute = (mission_id, script_path, input_file, sol_id, img_file, txt_file, cb) => {
    console.log('execute zf,', mission_id, sol_id, input_file);
    let db = couchdb.use('roy-config');
    let solution = {},
        stdout = '',
        stderr = '';

    db.get(sol_id, (err, doc) => {
        if (err) {
            console.log(err.statusCode, err.reason);
            cb();
        } else {
            solution = doc;
            let execPythonScript,
                output_dir = solution.output_dir;
            if (typeof solution.cord === 'undefined') {
                execPythonScript = spawn('python3', [script_path, '-i', input_file, '-o', solution.output_dir]);
            } else {
                let cord = solution.cord;
                execPythonScript = spawn('python3', [script_path, '-i', input_file, '-o', solution.output_dir, '-l', cord.left, '-u', cord.up, '-r', cord.right, '-d', cord.down]);
            }

            execPythonScript.stdout.on('data', (data) => {
                console.log('=======================');
                console.log('stdout data:', data.toString('utf-8'));
                stdout += `[stdout] ${data.toString('utf-8')}`;
            })

            execPythonScript.stderr.on('data', (data) => {
                console.log('=======================');
                console.log('stderr data:', data.toString('utf-8'));
                stderr += `[stderr] ${data.toString('utf-8')}`;
            })

            execPythonScript.on('close', (code) => {
                console.log(`[${sol_id}] child process exited with code ${code}`);

                if (fs.existsSync(output_dir)) {
                    let text_data = '',
                        text_map = {},
                        image_data,
                        images_data = [],
                        image_data_filename = '',
                        image_data_mime = '';
                    if (fs.existsSync(path.join(output_dir, txt_file))) {
                        text_data = fs.readFileSync(path.join(output_dir, txt_file)).toString('utf-8');
                        let split_text_arr_by_newline = [],
                            store_values_in_arr = [];
                        if (typeof solution.cord === 'undefined') {
                            split_text_arr_by_newline = text_data.split(/\r?\n/);
                            for (var i = 0; i < split_text_arr_by_newline.length; i++) {
                                let line = split_text_arr_by_newline[i];
                                if (!!line) {
                                    if (!!line.match(/^\s*\d+\:/)) {
                                        let line_arr = line.split(':');
                                        let key = line_arr.shift(),
                                            value = line_arr.join(':').replace(/^\s*/, '').replace(/\s*$/, '');
                                        store_values_in_arr.push({
                                            index: key,
                                            value: value
                                        })
                                    } else {
                                        line = line.replace(/^\s*/, '').replace(/\s*$/, '');
                                        if (store_values_in_arr.length > 0
                                            && typeof store_values_in_arr[store_values_in_arr.length - 1] !== 'undefined'
                                            && typeof store_values_in_arr[store_values_in_arr.length - 1].value !== 'undefined') {
                                            store_values_in_arr[store_values_in_arr.length - 1].value += `\n${line}`;
                                        }
                                    }
                                }
                            }
                        } else {
                            split_text_arr_by_newline = text_data.split(/\r?\n\r?\n/);
                            for (var i = 0; i < split_text_arr_by_newline.length; i++) {
                                let line = split_text_arr_by_newline[i].replace(/^\s*/, '').replace(/\s*$/, '');
                                if (i + 1 === split_text_arr_by_newline.length && !line) {

                                } else {
                                    store_values_in_arr.push({
                                        index: i,
                                        value: line
                                    })
                                }
                            }
                        }
                        text_map = store_values_in_arr.reduce((obj, val) => {
                            obj[val.index] = val.value;
                            return obj;
                        }, {});
                    }
                    let images_content_data = Object.keys(text_map).reduce((arr, key) => {
                        let obj = {
                            index: key,
                            value: text_map[key]
                        }
                        let imagefile_path = path.join(output_dir, `images/im_${key}.jpg`);
                        if (fs.existsSync(imagefile_path)) {
                            obj.image_file = `im_${key}.jpg`;
                            images_data.push({
                                name: `im_${key}.jpg`,
                                data: fs.readFileSync(imagefile_path),
                                content_type: 'image/jpg'
                            })
                        }
                        arr.push(obj);
                        return arr;
                    }, [])
                    // out_im.jpg || custom_seg.jpg
                    if (fs.existsSync(path.join(output_dir, img_file))) {
                        image_data = fs.readFileSync(path.join(output_dir, img_file));
                        image_data_filename = img_file;
                        image_data_mime = 'image/jgp';
                        images_data.push({
                            name: image_data_filename,
                            data: image_data,
                            content_type: image_data_mime
                        })
                    }

                    db.get(sol_id, (err, doc) => {
                        if (err) {
                            console.log(err.statusCode, err.reason);
                            return;
                        } else {
                            doc.solution = images_content_data;
                            doc.image = image_data_filename;
                            doc.isSuccess = true;
                            doc.isFinish = true;
                            doc.log = {
                                stdout: stdout,
                                stderr: stderr,
                                code: code
                            }

                            if (images_data.length > 0) {
                                db.multipart.insert(doc, images_data, doc._id, (err, body) => {
                                    if (err) {
                                        console.log(err.statusCode, err.reason);
                                        return;
                                    } else {
                                        console.log(`solution \<${doc._id}\> for mission \<${mission_id}\> has been added.`);
                                    }
                                })
                            } else {
                                db.insert(doc, (err, body) => {
                                    if (err) {
                                        console.log(err.statusCode).send(err.reason);
                                        return;
                                    } else {
                                        console.log(`solution \<${doc._id}\> for mission \<${mission_id}\> has been added.`);
                                    }
                                })
                            }
                        }
                    })
                } else {
                    db.get(sol_id, (err, doc) => {
                        if (err) {
                            console.log(err.statusCode).send(err.reason);
                        } else {
                            doc.solution = [];
                            doc.log = {
                                stdout: stdout,
                                stderr: stderr,
                                code: code
                            }
                            doc.isFinish = true;
                            db.insert(solution, (err, body) => {
                                if (err) {
                                    console.log(err.statusCode).send(err.reason);
                                    return;
                                } else {
                                    console.log(`solution \<${body._id}\> for mission \<${mission_id}\> has been added.`);
                                }
                            })
                        }
                    })
                }
                cb();
            })
        }
    })

    // execPythonScript.on('close', (code) => {
    //     console.log(`child process exeited with code ${code}`);

    //     if (fs.existsSync(output_dir)) {
    //         let text_data = '',
    //             text_map = {},
    //             image_data,
    //             images_data = [],
    //             image_data_filename = '',
    //             image_data_mime = '';
    //         // out_text.txt || custome_seg_out.txt
    //         if (fs.existsSync(path.join(output_dir, txt_file))) {
    //             text_data = fs.readFileSync(path.join(output_dir, txt_file)).toString('utf-8');
    //             let split_text_arr_by_newline = [],
    //                 store_values_in_arr = [];
    //             if (typeof cord === 'undefined') {
    //                 split_text_arr_by_newline = text_data.split(/\r?\n/);
    //                 for (var i = 0; i < split_text_arr_by_newline.length; i++) {
    //                     let line = split_text_arr_by_newline[i];
    //                     if (!!line) {
    //                         if (!!line.match(/^\s*\d+\:/)) {
    //                             let line_arr = line.split(':');
    //                             let key = line_arr.shift(),
    //                                 value = line_arr.join(':').replace(/^\s*/, '').replace(/\s*$/, '');
    //                             store_values_in_arr.push({
    //                                 index: key,
    //                                 value: value
    //                             })
    //                         } else {
    //                             line = line.replace(/^\s*/, '').replace(/\s*$/, '');
    //                             if (store_values_in_arr.length > 0
    //                                 && typeof store_values_in_arr[store_values_in_arr.length - 1] !== 'undefined'
    //                                 && typeof store_values_in_arr[store_values_in_arr.length - 1].value !== 'undefined') {
    //                                 store_values_in_arr[store_values_in_arr.length - 1].value += `\n${line}`;
    //                             }
    //                         }
    //                     }
    //                 }
    //             } else {
    //                 split_text_arr_by_newline = text_data.split(/\r?\n\r?\n/);
    //                 for (var i = 0; i < split_text_arr_by_newline.length; i++) {
    //                     let line = split_text_arr_by_newline[i].replace(/^\s*/, '').replace(/\s*$/, '');
    //                     if (i + 1 === split_text_arr_by_newline.length && !line) {

    //                     } else {
    //                         store_values_in_arr.push({
    //                             index: i,
    //                             value: line
    //                         })
    //                     }
    //                 }
    //             }
    //             text_map = store_values_in_arr.reduce((obj, val) => {
    //                 obj[val.index] = val.value;
    //                 return obj;
    //             }, {});
    //         }
    //         let images_content_data = Object.keys(text_map).reduce((arr, key) => {
    //             let obj = {
    //                 index: key,
    //                 value: text_map[key]
    //             }
    //             let imagefile_path = path.join(output_dir, `images/im_${key}.jpg`);
    //             if (fs.existsSync(imagefile_path)) {
    //                 obj.image_file = `im_${key}.jpg`;
    //                 images_data.push({
    //                     name: `im_${key}.jpg`,
    //                     data: fs.readFileSync(imagefile_path),
    //                     content_type: 'image/jpg'
    //                 })
    //             }
    //             arr.push(obj);
    //             return arr;
    //         }, [])
    //         // out_im.jpg || custom_seg.jpg
    //         if (fs.existsSync(path.join(output_dir, img_file))) {
    //             image_data = fs.readFileSync(path.join(output_dir, img_file));
    //             image_data_filename = img_file;
    //             image_data_mime = 'image/jgp';
    //             images_data.push({
    //                 name: image_data_filename,
    //                 data: image_data,
    //                 content_type: image_data_mime
    //             })
    //         }

    //         solution = {
    //             mission: mission_id,
    //             solution: images_content_data,
    //             image: image_data_filename,
    //             created_date: new Date().toISOString(),
    //             doc_type: 'zf_solution',
    //             isSuccess: true,
    //             log: {
    //                 stdout: stdout,
    //                 stderr: stderr,
    //                 code: code
    //             }
    //         }
    //         let solution_id = `${solution.mission}-solution-${new Date().getTime()}`;

    //         if (images_data.length > 0) {
    //             db.multipart.insert(solution, images_data, solution_id, (err, body) => {
    //                 if (err) {
    //                     console.log(err.statusCode, err.reason);
    //                     return;
    //                 } else {
    //                     console.log(`solution \<${solution_id}\> for mission \<${mission_id}\> has been added.`);
    //                 }
    //             })
    //         } else {
    //             solution._id = solution_id;
    //             db.insert(solution, (err, body) => {
    //                 if (err) {
    //                     console.log(err.statusCode).send(err.reason);
    //                     return;
    //                 } else {
    //                     console.log(`solution \<${solution_id}\> for mission \<${mission_id}\> has been added.`);
    //                 }
    //             })
    //         }
    //     } else {
    //         solution = {
    //             mission: mission_id,
    //             solution: [],
    //             image: '',
    //             created_date: new Date().toISOString(),
    //             doc_type: 'zf_solution',
    //             isSuccess: false,
    //             log: {
    //                 stdout: stdout,
    //                 stderr: stderr,
    //                 code: code
    //             }
    //         }

    //         db.insert(solution, (err, body) => {
    //             if (err) {
    //                 console.log(err.statusCode).send(err.reason);
    //                 return;
    //             } else {
    //                 console.log(`solution \<${body._id}\> for mission \<${mission_id}\> has been added.`);
    //             }
    //         })
    //     }
    // })
}

let getSolutions = (req, res) => {
    console.log('getSolutions');
    let db = couchdb.use(`roy-config`);
    let mission_id = req.params.mission_id;
    let query = { descending: true, startkey: [mission_id, 'ZZ'], endkey: [mission_id] },
        design = 'zf',
        view = 'zf_solution';
    db.view(design, view, query, (err, body) => {
        if (err) {
            res.status(err.statusCode).send(err.reason);
            return;
        } else {
            res.status(200).send(body.rows.reduce((arr, obj) => {
                if (Array.isArray(obj.value.solution)) {
                    obj.value.solution = obj.value.solution.reduce((arr2, sol) => {
                        if (typeof sol.image_file === 'undefined') {
                            arr2.push(sol);
                        } else {
                            arr2.push({
                                index: sol.index,
                                value: sol.value,
                                image_url: `http://couchdb1.learnable.ai/roy-config/${obj.value.id}/${sol.image_file}`
                            })
                        }
                        return arr2;
                    }, []);
                }
                if (typeof obj.value.image !== 'undefined') {
                    obj.value.image = `http://couchdb1.learnable.ai/roy-config/${obj.value.id}/${obj.value.image}`;
                }
                arr.push(obj.value);
                return arr;
            }, []));
        }
    })
}

// let getSolution = (req, res) => {
//     console.log('getSolution');
//     let db = couchdb.use(`roy-config`);
//     let mission_id = req.params.mission_id,
//         solution_id = req.params.solution_id;
//     db.get(solution_id, (err, doc) => {
//         if (err) {
//             res.status(err.statusCode).send(err.reason);
//             return;
//         } else {
//             res.status(200).send(doc);
//         }
//     })
// }

let updateSolution = (req, res) => {
    console.log('updateSolution');
    let db = couchdb.use(`roy-config`);
    let solution_id = req.params.solution_id;
    let solution = req.body.solution;
    let solution_temp = solution.reduce((obj, val) => {
        obj[val.index] = val.value;
        return obj;
    }, {})
    db.get(solution_id, (err, doc) => {
        if (err) {
            res.status(err.statusCode).send(err.reason);
            return;
        } else {
            if (Array.isArray(doc.solution) && doc.solution.length > 0) {
                doc.solution = doc.solution.reduce((arr, val) => {
                    val.value = solution_temp[val.index];
                    arr.push(val);
                    return arr;
                }, []);
            } else {
                doc.solution = Object.keys(solution_temp).reduce((arr, key) => {
                    arr.push({
                        index: key,
                        value: solution_temp[key]
                    })
                    return arr;
                }, []);
            }
            db.insert(doc, (err, body) => {
                if (err) {
                    res.status(err.statusCode).send(err.reason);
                    return;
                } else {
                    res.status(200).send(`solution \<${solution_id}\> has been updated.`);
                }
            })
        }
    })
}

export default {
    getMissions: getMissions,
    getMission: getMission,
    addZFMission: addMission,
    updateMission: updateMission,
    getSolutions: getSolutions,
    updateSolution: updateSolution
}
