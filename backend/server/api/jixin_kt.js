'use strict';

import PythonShell from 'python-shell';
import utils from './utils';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

let couchdb = utils.getDb();
const KNOWLEDGETAGGING_JIXIN_SCRIPT_DIR = process.env.KNOWLEDGETAGGING_JIXIN_SCRIPT_DIR || '/root/Jixin_kt_deploy';

let kt = (req, res) => {
    console.log('jixin_kt');
    let db = couchdb.use('roy-config');
    let folder_name = 'kt_jixin_image_' + req.headers['verified-token'].email + '-' + new Date().getTime(),
        default_folder = path.join('/tmp', folder_name),
        input_path = path.join(default_folder, 'input.txt'),
        output_dir = default_folder + '/',
        output_path = path.join(default_folder, 'output.json'),
        questions = req.body.questions || '',
        script_dir = KNOWLEDGETAGGING_JIXIN_SCRIPT_DIR,
        script_path = path.join(script_dir, 'deploy_0412.py'),
        // param_modeldir = path.join(script_dir, 'result/'),
        // param_vocab = path.join(script_dir, 'data/vocab.txt'),
        // param_hidden = 200,
        // param_labeltree = path.join(script_dir, 'data/labelname.csv'),
        // param_coefficient = 1,
        err_msg = '';

    if (!fs.existsSync(default_folder)) {
        fs.mkdirSync(default_folder);
    }
    fs.writeFile(input_path, questions, 'utf8', (err) => {
        if (err) {
            console.log('write file:', err);
            res.status(500).send(err);
            return;
        } else {
            let execPythonScript = spawn('python3.6', [script_path,
                '-i', input_path,
                '-o', output_path]);

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
                // if(code === 0) {
                fs.readFile(output_path, (err, data) => {
                    if (err) {
                        res.status(200).send({ code: code, questions: questions, output: [], err: err });
                    } else {
                        var result = data.toString('utf-8'), re = { code: code, questions: questions, output: '', err: '' };
                        try {
                            result = JSON.parse(result);
                            re.questions = result.Problem || questions;
                            re.output = result.Path || [];
                            re.err = result.Error || '';
                        } catch (e) {

                        }
                        saveKTJX(req.headers['verified-token'].email, db, folder_name, result, questions, () => {
                            console.log(folder_name, 'saved');
                        })
                        res.status(200).send(re);
                    }
                })
                // } else {
                //     res.status(200).send({code: code, err: err_msg});
                // }
            })

        }
    })
}

let saveKTJX = (email, db, folder_name, output, question, cb) => {
    let entry = {
        doc_type: 'kt_jixin',
        folder_name: folder_name,
        question: question,
        output: output,
        user: email,
        created_date: new Date().getTime()
    }
    db.insert(entry, (err, body) => {
        if (err) {
            console.log(err.statusCode, err.reason);
        }
        if (cb)
            cb();
    })
}

export default {
    kt_jx: kt
}
