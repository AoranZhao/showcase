'use strict';
import utils from './utils';

let couchdb = utils.getDb();

let getUsers = (req, res) => {
    let db = couchdb.use('roy-config');
    db.view('config', 'user', {include_docs: true}, (err, body) => {
        if(err) {
            res.status(err.statusCode).send(err.reason);
            return;
        }
        res.status(200).send(body.rows.map(u => u.doc));
        return;
    })
}

let getUser = (req, res) => {
    let db = couchdb.use('roy-config');
    db.view('config', 'user', {key: req.params.id, include_docs: true}, (err, body) => {
        if(err) {
            res.status(err.statuscode).send(err.reason);
            return;
        }
        res.status(200).send(body.rows.map(u => u.doc));
        return;
    })
}

let addUser = (req, res) => {
    let db = couchdb.use('roy-config');
    var user = get_template_user(req.body.email, req.body.password);
    db.insert(user, (err, body) => {
        if(err) {
            res.status(err.statusCode).send(err.reason);
            return;
        }
        res.status(200).send('add user successfully');
    })
}

var get_template_user = (email, password) => {
    var template_user = {
        email: email || '',
        password: password || '',
        expire: new Date(Math.floor(new Date().getTime() / (24 * 60 * 60 * 1000)) * (24 * 60 * 60 * 1000) + (13 + 30 * 24) * 60 * 60 * 1000).getTime(),
        type: 'user',
        disable: false,
        doc_type: 'user'
    }
    return template_user;
}

let updateUser = (req, res) => {
    let db = couchdb.use('roy-config');
    db.get(req.params.id, (err, doc) => {
        if(err) {
            res.status(err.statusCode).send(err.reason);
            return;
        }
        doc.password = req.body.password || doc.password;
        doc.expire = req.body.expire || doc.expire;
        doc.type = req.body.type || doc.type;
        doc.disable = req.body.disable || doc.disable;

        db.insert(doc, (err, body) => {
            if(err) {
                res.status(err.sratusCode).send(err.reason);
                return;
            }
            db.get(req.params.id, (err, doc) => {
                if(err) {
                    res.status(err.statusCode).send(err.reason);
                    return;
                }
                res.status(200).send(doc);
            })
        })
    })
}

let deleteUser = (req, res) => {
    let db = couchdb.use('roy-config');
    db.get(req.params.id, (err, doc) => {
        if(err) {
            res.status(err.statusCode).send(err.reason);
            return;
        }
        doc._deleted = true;
        db.insert(doc, (err, body) => {
            if(err) {
                res.status(err.statusCode).send(err.reason);
                return;
            }
            res.status(200).send({_id: req.params.id, statusText: 'delete user successfully'});
        })
    })
}

export default {
    getUsers: getUsers,
    getUser: getUser,
    addUser: addUser,
    updateUser: updateUser,
    deleteUser: deleteUser
}