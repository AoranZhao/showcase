'use strict';

import pythonShell from 'python-shell';
import utils from './utils';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

import formidable from 'formidable';
import { spawn, fork } from 'child_process';

import archiver from 'archiver';

let couchdb = utils.getDb();
const VIDEO_SCRIPT_PATH = process.env.VIDEO_SCRIPT_PATH || '/home/jieming/Learnable-Edu-Vision-Product/VisionOne/demo.py';
const DIR_PATH_GL = '/tmp/';

let handlevideo = (req, res) => {
    console.log('handlevideo');
    let db = couchdb.use('roy-config');
    // let attachs = [], new_files = [], check = 0, readCheck = 0, outputs = {}, received_files = [];
    let default_folder = 'video_' + req.headers['verified-token'].email + '-' + new Date().getTime(),
        dir_path = DIR_PATH_GL,
        input_dir = path.join(dir_path, default_folder, 'input'),
        output_dir = path.join(dir_path, default_folder, 'output'),
        openpose_path_student = path.join(dir_path, default_folder, 'openpose_path_student'),
        openpose_path_teacher = path.join(dir_path, default_folder, 'openpose_path_teacher'),
        cb_url = req.headers.origin || 'localhost:2978',
        api_path = req.body.cb_api || '/api/callbackvd',
        uuid = req.body.uuid || '';
    // cb_url = path.join(cb_url, api_path);
    res.status(200).send('video upload is done, prepare manipulate');
    res.end();

    // only one file, here is object. It's array only if more than one file
    console.log('input_dir:', input_dir);
    fs.mkdirSync(path.join(dir_path, default_folder));
    fs.mkdirSync(input_dir);
    fs.mkdirSync(output_dir);
    let input_paths = {},
        input_map = {};
    Object.keys(req.files).forEach(key => {
        input_paths[key] = path.join(input_dir, req.files[key].originalFilename);
        input_map[key] = req.files[key].originalFilename;
        fs.rename(req.files[key].path, path.join(input_dir, req.files[key].originalFilename))
    })
    let input_student_path = (typeof input_paths.student === 'undefined') ? '' : input_paths.student,
        input_teacher_path = (typeof input_paths.teacher === 'undefined') ? '' : input_paths.teacher;
    let execPythonScript = spawn('python3', [VIDEO_SCRIPT_PATH, '-s', input_student_path, '-t', input_teacher_path, '-o', output_dir, '-d', openpose_path_student, '-c', openpose_path_teacher]);

    let data_log = '',
        err_log = '';

    execPythonScript.stdout.on('data', data => {
        data_log += '[stdout] ' + data.toString('utf-8');
        console.log('[stdout] ' + data.toString('utf-8'));
    })

    execPythonScript.stderr.on('data', data => {
        err_log += '[stderr] ' + data.toString('utf-8');
        console.log('[stderr] ' + data.toString('utf-8'));
    })

    execPythonScript.on('close', code => {
        console.log(`child process exited with code ${code}`);
        saveResult(path.join(dir_path, default_folder), input_map, data_log, err_log, default_folder, req.headers['verified-token'].email, (id) => {
            sendOutput(cb_url, api_path, 'success', id, uuid).then(response => {
                console.log(response.data);
            }).catch(err => {
                console.log(err.data);
            })
        })
    })
}

let saveResult = (dir_path, input_map, data_log, err_log, default_folder, account, cb) => {
    let db = couchdb.use('roy-config');
    let output_dir = path.join(dir_path, 'output'),
        input_dir = path.join(dir_path, 'input');
    let files_forsave = [],
        output_maps = [];
    fs.readdir(output_dir, (err, files) => {
        if (err) {
            console.log(err);
            return;
        }
        files.forEach(file => {
            output_maps.push(`output_${file}`);
            files_forsave.push({
                name: `output_${file}`,
                data: fs.readFileSync(path.join(output_dir, file)),
                content_type: (!!file.match(/\.mp4/)) ? 'video/mp4' : 'application/pdf'
            })
        })

        fs.readdir(input_dir, (err, files) => {
            if (err) {
                console.log(err);
                return;
            }

            files.forEach(file => {
                files_forsave.push({
                    name: file,
                    data: fs.readFileSync(path.join(input_dir, file)),
                    content_type: 'video/mp4'
                })
            })

            let document = {
                doc_type: 'video',
                created_time: new Date().toISOString(),
                account: account,
                path: default_folder,
                data_log: data_log,
                err_log: err_log,
                input: input_map,
                output: output_maps
            }

            db.insert(document, (err, body) => {
                if (err) {
                    console.log(err);
                    return;
                }
                db.get(body.id, (err, doc) => {
                    if (err) {
                        console.log(err);
                        return;
                    }

                    db.multipart.insert(doc, files_forsave, doc._id, (err, body) => {
                        if (err) {
                            console.log(err);
                            return;
                        }
                        cb(`http://18.219.27.220:2978/api/video/${doc._id}`);
                    })
                })
            })
        })
    })
}

let filterErr = (msg) => {
    var regex_keys = [], result = true;
    regex_keys.forEach(k => {
        var regex = new RegExp(k, 'gi');
        if (msg.match(regex)) {
            result = false;
            return true;
        }
    })
    return true;
}

let sendOutput = (baseURL, url, status, output, uuid) => {
    return axios({
        method: 'post',
        baseURL: baseURL,
        url: url,
        data: {
            status: status,
            output: output,
            uuid: uuid
        }
    })
}

let fetchResult = (req, res) => {
    let doc_id = req.params.id;
    let db = couchdb.use('roy-config');
    db.get(doc_id, (err, doc) => {
        if (err) {
            res.status(err.statusCode, err.reason);
            return;
        }
        let output_list = doc.output;
        let zip_path = path.join(DIR_PATH_GL, doc.path, `${doc_id}.zip`);
        let zip_output = fs.createWriteStream(zip_path),
            archive = archiver('zip');
        zip_output.on('close', () => {
            let stats = fs.statSync(zip_path);
            res.writeHead(200, {
                'Content-Type': 'application/octet-stream',
                'COntent-Disposition': `attachment; filename=${doc_id}.zip`
            })
            fs.createReadStream(zip_path).pipe(res);
        })
        zip_output.on('end', () => {

        })
        archive.on('warning', (err) => {
            console.log(err);
        })
        archive.on('error', (err) => {
            console.log(err);
        })
        archive.pipe(zip_output);
        let check = 0;
        output_list.forEach(attachname => {
            check++;
            db.attachment.get(doc_id, attachname, (err, body) => {
                if (err) {
                    res.status(err.statusCode).send(err);
                    return;
                }
                archive.append(body, { name: attachname });
                if (--check === 0) {
                    archive.finalize();
                }
            })
        })
    })
}

export default {
    handlevideo: handlevideo,
    fetchResult: fetchResult
}
