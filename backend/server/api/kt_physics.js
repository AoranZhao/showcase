'use strict';

import utils from './utils';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

let couchdb = utils.getDb();
const KNOWLEDGETAGGING_SCRIPT = '/home/ubuntu/Learnable_knowledge_tagging_physics_NS/main.py';

let kt = (req, res) => {
    console.log('knowledge tagging for physics');
    let db = couchdb.use('roy-config');
    let folder_name = 'kt_physics_' + req.headers['verified-token'].email + '-' + new Date().getTime(),
        default_folder = path.join('/tmp', folder_name),
        input_file = path.join(default_folder, 'input.txt'),
        output_file = path.join(default_folder, 'output.txt'),
        question = req.body.question || '',
        err_msg = '';

    if (!fs.existsSync(default_folder)) {
        fs.mkdirSync(default_folder);
    }
    fs.writeFile(input_file, question, 'utf8', (err) => {
        if (err) {
            console.log('write files: ', err);
            res.status(500).send(err);
            return;
        } else {
            let execPythonScript = spawn('python3', [KNOWLEDGETAGGING_SCRIPT, '-i', input_file, '-o', output_file]);

            execPythonScript.stdout.on('data', (data) => {
                console.log('========================');
                console.log('stdout data:', data.toString('utf-8'));
                err_msg += 'stdout data:' + data.toString('utf-8') + '\n';
            })

            execPythonScript.stderr.on('data', (data) => {
                console.log('==============================');
                console.log('stderr data:', data.toString('utf-8'));
                err_msg += 'stderr data:' + data.toString('utf-8');
            })

            execPythonScript.on('close', (code) => {
                console.log(`child process exited with code ${code}`);
                fs.readFile(output_file, (err, data) => {
                    if (err) {
                        console.log('err:', err);
                        let re = { code: code, question: question, output: [], err: err }
                        saveKT(req.headers['verified-token'].email, db, folder_name, [], question, err_msg, () => {
                            console.log(folder_name, 'saved');
                        })
                        res.status(200).send(re)
                    } else {
                        var result = data.toString('utf-8'), re = { code: code, question: question, output: {}, err: '' };
                        var output_obj = JSON.parse(result);
                        console.log(output_obj);
                        re.output = output_obj;
                        saveKT(req.headers['verified-token'].email, db, folder_name, output_obj, question, err_msg, () => {
                            console.log(folder_name, 'saved');
                        })
                        res.status(200).send(re);
                    }
                })
            })
        }
    })
}

let saveKT = (email, db, folder_name, output, question, log, cb) => {
    let entry = {
        doc_type: 'kt_physics',
        folder_name: folder_name,
        question: question,
        output: output,
        user: email,
        log: log,
        created_date: new Date().getTime()
    }
    db.insert(entry, (err, body) => {
        if (err) {
            console.log(err.statusCode, err.reason);
        }
        if (cb) {
            cb();
        }
    })
}

export default {
    kt_physics: kt
}