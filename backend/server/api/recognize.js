'use strict';

import pythonShell from 'python-shell';
import utils from './utils';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

import formidable from 'formidable';
import { spawn, fork } from 'child_process';

let couchdb = utils.getDb();
const OCR_SCRIPT_PATH = process.env.OCR_SCRIPT_PATH || '/root/line_read_test/mix_ocr/main_v2.py',
    FORMULA_SCRIPT_PATH = process.env.FORMULA_SCRIPT_PATH || '/root/formula_read_separate/main_formula.py',
    TEX2PIC_SCRIPT_PATH = process.env.TEX2PIC_SCRIPT_PATH || '/root/tex2pic/main.py',
    TEX2PIC_TEMPLATE_DIR = process.env.TEX2PIC_TEMPLATE_DIR || '/root/tex2pic/template/';

let recognizeImages = (req, res) => {
    console.log('recognizeImages');
    let db = couchdb.use('roy-config');
    let attachs = [], new_files = [], check = 0, readCheck = 0, outputs = {}, received_files = [];
    let default_folder = 'aoran_image_' + req.headers['verified-token'].email + '-' + new Date().getTime(),
        dir_path = '/tmp/',
        file_name = 'output.txt',
        cb_url = req.headers.origin || 'localhost:2978',
        api_path = req.body.cb_api || '/api/callback',
        uuid = req.body.uuid || '';
    // cb_url = path.join(cb_url, api_path);
    res.status(200).send('images upload is done, prepare recognize');
    res.end();
    
    // only one file, here is object. It's array only if more than one file
    if (!Array.isArray(req.files.images)) {
        received_files.push(req.files.images);
    } else {
        received_files = req.files.images;
    }
    
    if (!Array.isArray(received_files) || received_files.length === 0) {
        // unvalid images
    } else {	
        fs.closeSync(fs.openSync(received_files[0].path.split('/').slice(0, received_files[0].path.split('/').length - 1).join('/') + '/' + file_name, 'w'));
    }
    console.log('received_files:', received_files);
    received_files.forEach(file => {
        check++;
        dir_path = (typeof dir_path === 'undefined') ? file.path.split('/').slice(0, file.path.split('/').length - 1).join('/') + '/' : dir_path;
        let full_file_name = file.path.split('/').splice(-1, 1)[0],
            pure_file_name = full_file_name.split('.').splice(0, full_file_name.split('.').length - 1).join('.');
            // file_name = pure_file_name + '.txt';
        if(!fs.existsSync(dir_path + default_folder)) {
            fs.mkdirSync(dir_path + default_folder);
        }
        // move to specific folder
        new_files.push({path: dir_path + default_folder + '/' + file.originalFilename, type: file.type});
        fs.rename(file.path, dir_path + default_folder + '/' + file.originalFilename, (err) => {
            if(err) {
                // res.status(500).send(err);
                console.log(err);
                return;
            }

            if(--check === 0) {
                // run python script
                let script_start_time = new Date().getTime();
                
                const execPythonScript = spawn('python', [OCR_SCRIPT_PATH, '-i', '', '-d', dir_path + default_folder + '/', '-o', dir_path + default_folder + '/' + file_name]);
                execPythonScript.stdout.on('data', (data) => {
                    console.log('==========================================');
                    console.log('stdout data:', data.toString('utf-8'));
                })
                execPythonScript.stderr.on('data', (data) => {
                    let end_time = new Date().getTime(), msg = data.toString('utf-8');
                    console.log('stderr data:', msg);
                    
                    if(filterErr(msg)) {
                        sendOutput(cb_url, api_path, 500, data.toString('utf-8'), end_time - script_start_time, uuid, 0).then((response) => {
                            console.log(response.data);
                        }).catch(err => {
                            console.log(err);
                        })
                    }
                })
                execPythonScript.on('close', (code) => {
                    console.log(`child process exited with code ${code}`);

                    let output = "This server currently does not support image recognize function page. Please visit our AWS Server, http://35.163.36.225:2979";
		    try {
			    output = fs.readFileSync(dir_path + default_folder + '/' + file_name, 'utf-8');
		    } catch(e) { }
                    // read images from new location
                    new_files.forEach(new_file => {
                        console.log('read file from path:', new_file.path);
                        readCheck++;
                        fs.readFile(new_file.path, (err, data) => {
                            if(err) {
                                // res.status(500).send(err);
                                console.log(err);
                                return;
                            }
                            //
                            attachs.push({name: new_file.path.split('/').splice(-1, 1), data: data, content_type: new_file.type});
                            if(--readCheck === 0) {
                                console.log('return response');
                                let end_time = new Date().getTime();
                                // res.status(200).send({output: output, script_dur: end_time - script_start_time});
                                // res.end();
                                sendOutput(cb_url, api_path, 200, output, end_time - script_start_time, uuid, attachs.length).then((response) => {
                                    console.log(response.data);
                                }).catch((err) => {
                                    console.log(err.data);
                                });
                                //
                                var doc_name = 'IMAGE-(' + req.headers['verified-token'].email + ')-' + new Date().getTime();
                                db.multipart.insert({email: req.headers['verified-token'].email, output: output, output_dir: default_folder, created_data: new Date().getTime(), doc_type: 'recognize'}, attachs, doc_name, (err, body) => {
                                    if(err) {
                                        console.log(err);
                                    }
                                    return;
                                })
                            }
                        })
                    })
                })
                
            }
        })
    })
}

let filterErr = (msg) => {
    var regex_keys = ['Building prefix dict from the default dictionary', 'Loading model from cache', 'Loading model cost', 'Prefix dict has been built succesfully'], result = true;
    regex_keys.forEach(k => {
        var regex = new RegExp(k, 'gi');
        if(msg.match(regex)) {
            result = false;
            return true;
        }
    })
    return result;
}

let sendOutput = (baseURL, url, status, output, script_dur, uuid, file_quantity) => {
    return axios({
        method: 'post',
        baseURL: baseURL,
        url: url,
        data: {
            status: status,
            output: output, 
            script_dur: script_dur,
            uuid: uuid,
            length: file_quantity
        }
    })
}

/**
 * formula ocr
*/
let formulaocr = (req, res) => {
    console.log('formulaOcr');
    let db = couchdb.use('roy-config');
    let attachs = [], new_files = [], check = 0, readCheck = 0, outputs = {}, received_files = [];
    let default_folder = 'formulaocr_image_' + req.headers['verified-token'].email + '-' + new Date().getTime(),
        dir_path = '/tmp/',
        file_name = 'output.txt',
        cb_url = req.headers.origin || 'localhost:2978',
        api_path = req.body.cb_api || '/api/callbackfo',
        uuid = req.body.uuid || '';
    // cb_url = path.join(cb_url, api_path);
    res.status(200).send('images upload is done, prepare recognize');
    res.end();
    
    // only one file, here is object. It's array only if more than one file
    console.log(req.files);
    if (!Array.isArray(req.files.images)) {
        received_files.push(req.files.images);
    } else {
        received_files = req.files.images;
    }
    
    if (!Array.isArray(received_files) || received_files.length === 0) {
        // unvalid images
    } else {	
        fs.closeSync(fs.openSync(received_files[0].path.split('/').slice(0, received_files[0].path.split('/').length - 1).join('/') + '/' + file_name, 'w'));
    }
    console.log('received_files:', received_files);
    var file = received_files[0];
    dir_path = (typeof dir_path === 'undefined') ? file.path.split('/').slice(0, file.path.split('/').length - 1).join('/') + '/' : dir_path;
    let full_file_name = file.path.split('/').splice(-1, 1)[0],
        pure_file_name = full_file_name.split('.').splice(0, full_file_name.split('.').length - 1).join('.');
        // file_name = pure_file_name + '.txt';
    if(!fs.existsSync(dir_path + default_folder)) {
        fs.mkdirSync(dir_path + default_folder);
    }
    // move to specific folder
    new_files.push({path: dir_path + default_folder + '/' + file.originalFilename, type: file.type});
    fs.rename(file.path, dir_path + default_folder + '/' + file.originalFilename, (err) => {
        if(err) {
            // res.status(500).send(err);
            console.log(err);
            return;
        }

        // run python script
        let script_start_time = new Date().getTime();
        
        const execPythonScript = spawn('python', [FORMULA_SCRIPT_PATH, '-i', dir_path + default_folder + '/' + file.originalFilename, '-o', dir_path + default_folder + '/' + file_name]);
        execPythonScript.stdout.on('data', (data) => {
            console.log('==========================================');
            console.log('stdout data:', data.toString('utf-8'));
        })
        execPythonScript.stderr.on('data', (data) => {
                let end_time = new Date().getTime(), msg = data.toString('utf-8');
                console.log('stderr data:', msg);
                
                if(filterErr(msg)) {
                    sendOutput(cb_url, api_path, 500, data.toString('utf-8'), end_time - script_start_time, uuid, 0).then((response) => {
                        console.log(response.data);
                    }).catch(err => {
                        console.log(err);
                    })
                }
        })
        execPythonScript.on('close', (code) => {
                console.log(`child process exited with code ${code}`);
                let output = "This server currently does not support image recognize function page. Please visit our AWS Server, http://35.163.36.225:2979";
	            try {
		            output = fs.readFileSync(dir_path + default_folder + '/' + file_name, 'utf-8');
	            } catch(e) { }
                // read images from new location
                new_files.forEach(new_file => {
                    console.log('read file from path:', new_file.path);
                    readCheck++;
                    fs.readFile(new_file.path, (err, data) => {
                        if(err) {
                            // res.status(500).send(err);
                            console.log(err);
                            return;
                        }
                        //
                        attachs.push({name: new_file.path.split('/').splice(-1, 1), data: data, content_type: new_file.type});
                        if(--readCheck === 0) {
                            console.log('return response');
                            let end_time = new Date().getTime();
                            // res.status(200).send({output: output, script_dur: end_time - script_start_time});
                            // res.end();
                            sendOutput(cb_url, api_path, 200, output, end_time - script_start_time, uuid, attachs.length).then((response) => {
                                console.log(response.data);
                            }).catch((err) => {
                                console.log(err.data);
                            });
                            //
                            var doc_name = 'IMAGE-(' + req.headers['verified-token'].email + ')-' + new Date().getTime();
                            db.multipart.insert({email: req.headers['verified-token'].email, output: output, output_dir: default_folder, created_data: new Date().getTime(), doc_type: 'recognize'}, attachs, doc_name, (err, body) => {
                                if(err) {
                                    console.log(err);
                                }
                                return;
                            })
                        }
                    })
                })
        })
        
    })
}


/**
 * @api {post} /api/tex2pic Transform Text To Image
 * @apiName Tex2Pic
 * @apiGroup Generator
 * 
 * @apiHeader {String} Content-Type='application/json' Content Type
 * @apiHeader {String} x-token Account Token, Get From Signin API
 * 
 * @apiParam {String[]} text Array of Text
 * 
 * @apiParamExample Request-Example
 *      {
 *          "text": ["\\frac{a}{b}", "\\sqrt{\\frac{ax+by}{ced}}"]
 *      }
 * 
 * @apiSuccess {String[]} [anonymity] Image Links
 * 
 * @apiSuccessExample {String[]} Success-Response
 *      HTTP/1.1 200 OK
 *      [
 *          "47.94.99.252:2978/download/jeremiah_image_aoran_zhao@yahoo.ca-1508986513223/output/1.png",
 *          "47.94.99.252:2978/download/jeremiah_image_aoran_zhao@yahoo.ca-1508986513223/output/2.png"
 *      ]     
 * 
*/
let tex2pic = (req, res) => {
    let email = req.headers['verified-token'].email,
        db = couchdb.use('roy-config');

    db.view('config', 'user', {key: email, include_docs: true}, (err, body) => {
        if(err) {
            res.status(err.statusCode).send(err.reason);
            return;
        }
        let user = body.rows[0].doc;
        if(typeof user.count !== 'undefined' && user.count <= 0) {
            res.status(400).send('up to test usage limitation: 200 times');
        } else {
            let folder_name = 'jeremiah_image_' + email + '-' + new Date().getTime(),
                dir_path = '/tmp/' + folder_name,
                text_arr = req.body.text || [],
                input_path = path.join(dir_path, 'input.txt'),
                output_dir = path.join(dir_path, 'output'),
                template_dir = TEX2PIC_TEMPLATE_DIR,
                err_msg = '';
            
            if(!fs.exists(dir_path)) {
                fs.mkdirSync(dir_path);
            }
            if(!fs.exists(output_dir)) {
                fs.mkdirSync(output_dir);
            }
            var text = '';
            text_arr.forEach(t => {
                text += t + '\n';
            })
            fs.writeFile(input_path, text, 'utf8', (err) => {
                if(err) {
                    console.log('write file:', err);
                    res.status(500).send(err);
                    return;
                } else {
                    const execPythonScript = spawn('python', [TEX2PIC_SCRIPT_PATH, '-i', input_path, '-o', output_dir + '/', '-d', 300, '-t', template_dir + '/']);
                    
                    execPythonScript.stdout.on('data', (data) => {
                        console.log('==========================================');
                        console.log('stdout data:', data.toString('utf-8'));
                        err_msg += 'stdout data:' + data.toString('utf-8') + '\n';
                    })
        
                    execPythonScript.stderr.on('data', (data) => {
                        console.log('=====================================')
                        console.log('stderr data:', data.toString('utf-8'));
                    })
        
                    execPythonScript.on('close', (code) => {
                        console.log(`child process exited with code ${code}`);
                        if(code === 0) {
                            fs.readdir(output_dir, (err, items) => {
                                if(err) {
                                    res.status(200).send(err);
                                } else {
                                    items = items.map(file => path.join(utils.getStaticPath(req), folder_name, 'output', file));
                                    db.view('config', 'user', {key: email, include_docs: true}, (err, body) => {
                                        if(!err && body.rows.length > 0 && typeof body.rows[0].doc.count !== 'undefined') {
                                            var count = body.rows[0].doc.count;
                                            try {
                                                count = parseInt(count);
                                                count--;
                                                body.rows[0].doc.count = count;
                                                db.insert(body.rows[0].doc, (err, body) => {
                                                    if(err) {
                                                        console.log('err - decrease count -', err.reason);
                                                        return;
                                                    } else {
                                                        console.log('err - decrease count - success');
                                                    }
                                                })
                                            } catch(e) {
                                                console.log('err - count -', e);
                                            }
                                        }
                                    })
                                    res.status(200).send(items);
                                }
                            })
                        } else {
                            res.status(200).send({code: code, data: err_msg});
                        }
                    })
                }
            })
        }
    })
}

let testUploadImages = (req, res) => {
    let form = new formidable.IncomingForm();

    form.parse(req, function(err, fields, files) {
        console.log(JSON.stringify({fields: fields, files: files}));
        res.status(200).send("done");
    })
}

export default {
    recognizeImages: recognizeImages,
    testUploadImages: testUploadImages,
    tex2pic: tex2pic,
    formulaocr: formulaocr
}
