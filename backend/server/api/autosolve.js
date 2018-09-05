'use strict';

import pythonShell from 'python-shell';
import utils from './utils';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

import formidable from 'formidable';
import { spawn, fork } from 'child_process';

let couchdb = utils.getDb();
const AUTOSOLVE_SCRIPT_PATH = process.env.AUTOSOLVE_SCRIPT_PATH || '/root/autosolve_formula/alg_calc/run_solver.py';

let autosolve = (req, res) => {
   console.log('autosolve');
   let db = couchdb.use('roy-config');
   let attachs = [], new_files = [], check = 0, readCheck = 0, outputs = {}, received_files = [];
   let default_folder = 'autosolve_image_' + req.headers['verified-token'].email + '-' + new Date().getTime(),
       dir_path = '/tmp/',
       file_name = 'output.txt',
       cb_url = req.headers.origin || 'localhost:2978',
       api_path = req.body.cb_api || '/api/callbackau',
       question_type = req.body.question_type,
       uuid = req.body.uuid || '';
   // cb_url = path.join(cb_url, api_path);
   res.status(200).send('images upload is done, prepare autosolve');
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
        let isSend = false;
        
        let execPythonScript;
        if(typeof question_type !== 'undefined') {
            console.log('find question', question_type);
            execPythonScript = spawn('python', [AUTOSOLVE_SCRIPT_PATH, '-i', dir_path + default_folder + '/' + file.originalFilename, '-o', dir_path + default_folder + '/' + file_name, '-q', question_type]);
        } else {
            console.log('not find question');
            execPythonScript = spawn('python', [AUTOSOLVE_SCRIPT_PATH, '-i', dir_path + default_folder + '/' + file.originalFilename, '-o', dir_path + default_folder + '/' + file_name]);
        }
        execPythonScript.stdout.on('data', (data) => {
            console.log('==========================================');
            console.log('stdout data:', data.toString('utf-8'));
        })
        execPythonScript.stderr.on('data', (data) => {
            let end_time = new Date().getTime(), msg = data.toString('utf-8');
            console.log('stderr data:', msg);
            
            if(filterErr(msg)) {
                isSend = true;
                sendOutput(cb_url, api_path, 500, data.toString('utf-8'), end_time - script_start_time, uuid, 0).then((response) => {
                    console.log(response.data);
                }).catch(err => {
                    console.log(err);
                })
            }
        })
        execPythonScript.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
            let output = "This server currently does not support autosolve function page. Please contact with us";
            try {
                output = fs.readFileSync(dir_path + default_folder + '/' + file_name, 'utf-8');
            } catch(e) { }
            if(!isSend) {
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
                            var doc_name = 'AUTO-(' + req.headers['verified-token'].email + ')-' + new Date().getTime();
                            db.multipart.insert({email: req.headers['verified-token'].email, output: output, output_dir: default_folder, created_data: new Date().getTime(), doc_type: 'autosolve'}, attachs, doc_name, (err, body) => {
                                if(err) {
                                    console.log(err);
                                }
                                return;
                            })
                        }
                    })
                })
            }
        })
        
    })
}

let filterErr = (msg) => {
    var regex_keys = [], result = true;
    regex_keys.forEach(k => {
        var regex = new RegExp(k, 'gi');
        if(msg.match(regex)) {
            result = false;
            return true;
        }
    })
    return true;
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
    
export default {
    autosolve: autosolve
}
