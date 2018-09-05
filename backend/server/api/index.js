import utils from './utils';
import jwt from 'jsonwebtoken';

let couchdb = utils.getDb();
let jwt_secret = 'livdz98ewhsdvyjj22';

import initial from './initial';
import func from './func';
import user from './user';
import recognize from './recognize';
import sentenceCnn from './sentenceCnn';
import autosolve from './autosolve';
import kt_jx from './jixin_kt';
import kt_yc from './yichen_kt';
import video from './video';
import zf from './zf';
import kt_phy from './kt_physics';

let signup = (req, res) => {
    let db = couchdb.use('roy-config');
    if (!req.body.email || typeof req.body.email !== 'string') {
        res.status(400).send('invalid email');
        return;
    }
    if (!req.body.password || typeof req.body.password !== 'string') {
        res.status(400).send('invalid password');
        return;
    }
    var new_user = {
        email: req.body.email,
        password: req.body.password,
        expire: new Date().getTime(),
        doc_type: 'user',
        type: 'user'
    }

    db.view(utils.views.config, utils.views.user, { key: new_user.email, include_docs: true }, (err, body) => {
        if (err) {
            console.log(JSON.stringify(err))
            res.status(err.statusCode).send(err.reason);
            return;
        }
        if (body.rows.length > 0) {
            res.status(400).send('this email has been used.');
            return;
        } else {
            db.insert(new_user, (err, body) => {
                if (err) {
                    res.status(err.statusCode).send(err.reason);
                    return;
                }
                res.status(200).send(body);
                return;
            })
        }
    })
}

/**
 * @api {post} /api/signin Sign In As An User
 * @apiName SignIn
 * @apiGroup Auth
 * 
 * @apiHeader {String} Content-Type='application/json' Content Type
 * 
 * @apiParam {String} email User Email
 * @apiParam {String} password User Password
 * 
 * @apiParamExample Request-Example
 *      {
 *          "email": "xuehai",
 *          "password": "xuehaitest"
 *      }
 * 
 * @apiSuccess {String} email User Email
 * @apiSuccess {Number} expire Account Expire Time
 * @apiSuccess {String} type Account Type, user or admin
 * @apiSuccess {Boolean} disable Account disability
 * @apiSuccess {String} token Account Token, used for other API
 * 
 * @apiSuccessExample {json} Success-Response
 *      HTTP/1.1 200 OK
 *      {
 *          "email": "xuehai",
 *          "expire": 1509282000000,
 *          "type": "user",
 *          "disable": false,
 *          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Inh1ZWhhaSIsImV4cGlyZSI6MTUwOTI4MjAwMDAwMCwidHlwZSI6InVzZXIiLCJkaXNhYmxlIjpmYWxzZSwiaWF0IjoxNTA5MDY2NjEzLCJleHAiOjE1MDkxNTMwMTN9.r6yZdBIUb9oxfwqUiZB7uTzWkuYWEhgzgnk_-wBsxxY"
 *      }
*/
let auth = (req, res) => {
    let db = couchdb.use('roy-config');
    if (!req.body.email || typeof req.body.email !== 'string') {
        res.status(400).send('invalid email');
        return;
    }
    if (!req.body.password || typeof req.body.password !== 'string') {
        res.status(400).send('invalid email');
        return;
    }
    var login_info = {
        email: req.body.email || '',
        password: req.body.password || ''
    }

    db.view(utils.views.config, utils.views.user, { key: login_info.email, include_docs: true }, (err, body) => {
        if (err) {
            res.status(err.statusCode).send(err.reason);
            return;
        }
        if (body.rows.length === 0) {
            res.status(404).send('not found user');
            return;
        } else {
            if (body.rows.length > 1)
                console.log('find more than one user');
            var user = body.rows[0].value;
            if (user.password === login_info.password) {
                delete user.password;
                user.token = jwt.sign(user, jwt_secret, {
                    expiresIn: '1440m'
                })
                res.status(200).send(user);
            } else {
                res.status(401).send('auth fail');
            }
        }
    })
}

let verify = (req, res, next) => {
    let db = couchdb.use('roy-config');
    if (!req.headers['x-token']) {
        res.status(400).send('not found token');
        return;
    }
    var token = req.headers['x-token'];
    jwt.verify(token, jwt_secret, (err, decoded) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                decoded = jwt.decode(token);
                var user = {
                    email: decoded.email,
                    password: decoded.password,
                    expire: decoded.expire,
                    type: decoded.type,
                    disable: decoded.disable
                }

                user.token = jwt.sign(user, jwt_secret, {
                    expiresIn: '1440m'
                })
                res.setHeader('x-token', user.token);
                // res.headers['x-token'] = user.token;
                req.headers['verified-token'] = user;
                next();
                return;
            }
            res.status(401).send('auth fail');
            return;
        }
        db.view(utils.views.config, utils.views.user, { key: decoded.email || '', include_docs: true }, (err, body) => {
            if (err || body.rows.length === 0) {
                res.status(401).send('auth fail');
                return;
            }
            req.headers['verified-token'] = decoded;
            next();
        })
    })
}

let isDisable = (req, res, next) => {
    if (!req.headers['verified-token']) {
        res.status(401).send('no auth info');
        return;
    }
    let verified_token = req.headers['verified-token'];
    if (verified_token.disable) {
        res.status(401).send('account disabled');
        return;
    } else {
        next();
    }
}

let isExpire = (req, res, next) => {
    if (!req.headers['verified-token']) {
        res.status(401).send('no auth info');
        return;
    }
    let verified_token = req.headers['verified-token'];
    if (verified_token.expire < new Date().getTime()) {
        res.status(401).send('account expired');
        return;
    } else {
        next();
    }
}

let isAdmin = (req, res, next) => {
    if (!req.headers['verified-token']) {
        res.status(401).send('no auth info');
        return;
    }
    let verified_token = req.headers['verified-token'];
    if (verified_token.type !== 'admin') {
        res.status(401).send('no permission');
        return;
    } else {
        next();
    }
}

let heartbeat = (req, res) => {
    if (!req.headers['x-token']) {
        res.status(200).send({ status: true, statusCode: 0, reason: 'no token', ptime: 0 });
        return;
    }
    var token = req.headers['x-token'];
    jwt.verify(token, jwt_secret, (err, decoded) => {
        if (err) {
            res.status(200).send({ status: true, statusCode: 0, reason: 'invalid token', ptime: 0 });
            return;
        }
        console.log('decoded:', decoded);
        let db = couchdb.use('roy-config');
        db.view('config', 'user', { key: decoded.email, include_docs: false }, (err, body) => {
            if (err) {
                res.status(200).send({ status: true, statusCode: 0, reason: err.reason, ptime: 0 });
                return;
            }
            var expire = body.rows[0].value.expire,
                ptime = expire - new Date().getTime();
            ptime = (ptime < 0) ? 0 : ptime;
            res.status(200).send({ status: true, statusCode: 1, reason: 'success', ptime: ptime });
        })
    })
}

let ping = (req, res) => {
    res.status(200).send('pong');
}

let signout = (req, res) => {

}

export default {
    signup: signup,
    auth: auth,
    verify: verify,
    isDisable: isDisable,
    isExpire: isExpire,
    isAdmin: isAdmin,
    signout: signout,
    heartbeat: heartbeat,
    ping: ping,

    initial: initial.initial,
    detect: func.detect,
    groupRectangles: func.groupRectangles,

    getUsers: user.getUsers,
    getUser: user.getUser,
    addUser: user.addUser,
    updateUser: user.updateUser,
    deleteUser: user.deleteUser,

    recognizeImages: recognize.recognizeImages,
    testUploadImages: recognize.testUploadImages,
    tex2pic: recognize.tex2pic,
    formulaocr: recognize.formulaocr,

    nnin: sentenceCnn.nnin,

    autosolve: autosolve.autosolve,

    knowledgetagging_jixin: kt_jx.kt_jx,
    knowledgetagging_yichen: kt_yc.kt_yc,

    handlevideo: video.handlevideo,
    videoFetchResult: video.fetchResult,

    getZFMissions: zf.getMissions,
    getZFMission: zf.getMission,
    addZFMission: zf.addZFMission,
    updateZFMission: zf.updateMission,
    getZFSolutions: zf.getSolutions,
    updateZFSolution: zf.updateSolution,

    knowledgetagging_physics: kt_phy.kt_physics
}
