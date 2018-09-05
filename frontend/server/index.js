import express from 'express';
import http from 'http';
import socketIO from 'socket.io';
import path from 'path';
import cors from 'cors';
import bodyParser from 'body-parser';
import ioRedis from 'ioredis';
import socketIOEmitter from 'socket.io-emitter';
import socketIORedis from 'socket.io-redis';
import rds from 'redis';

let app = express();
let server = http.createServer(app);
// let io = socketIO(server);
// const PORT = process.env.PORT || 2979;
const PORT = 2979;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || 'Gelenk0408',
    REDIS_PORT = process.env.REDIS_PORT || 9851,
    REDIS_HOST = process.env.REDIS_HOST || 'localhost';

// let redis = () => {
//     return ioRedis({
//         port: REDIS_PORT,
//         host: REDIS_HOST,
//         password: REDIS_PASSWORD,
//         retryStrategy: function (times) {
//             return null; // no retry
//         }
//     })
// }
// let io_redis = () => {
//     return socketIORedis({
//         pubClient: rds.createClient(REDIS_PORT, REDIS_HOST, { auth_pass: REDIS_PASSWORD }),
//         subClient: rds.createClient(REDIS_PORT, REDIS_HOST, { auth_pass: REDIS_PASSWORD })
//     })
// }
// let emitter = () => {
//     return socketIOEmitter(rds.createClient(REDIS_PORT, REDIS_HOST, { auth_pass: REDIS_PASSWORD }))
// }
// let emitter_io = emitter(),
//     io_Redis = redis();
const EXPIRE_TIME = 60 * 60 * 24;

// io.adapter(io_redis());

app.use(express.static(path.join(__dirname, '../../client/dist')));
app.use(bodyParser.json({
    type: 'application/json'
}))
app.use(bodyParser.urlencoded({
    type: 'application/x-www-form-urlencoded',
    extended: true
}))
app.use(cors())

app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-App-Key, X-Account, X-Auth-Token, X-Token, Verified-Token')
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS')
    next()
})

app.post('/api/callback', (req, res) => {
    // body: {output: output, script_dur: end_time - script_start_time}
    console.log('callback');
    let uuid = req.body.uuid;
    console.log('uuid:', uuid);
    console.log('req.body:', req.body);
    var data = {
        output: req.body.output,
        script_dur: req.body.script_dur,
        status: req.body.status,
        length: req.body.length
    }
    io_Redis.get(uuid, (err, result) => {
        if (!err && result) {
            console.log(result);
            emitter_io.to(result).emit('message', data);
            res.status(200).send('ok');
        }
    })
    // emitter_io.to(socket_id).emit('message', data);
    // res.status(200).send('ok');
})

app.post('/api/callbackfo', (req, res) => {
    // body: {output: output, script_dur: end_time - script_start_time}
    console.log('callbackfo');
    let uuid = req.body.uuid;
    console.log('uuid:', uuid);
    console.log('req.body:', req.body);
    var data = {
        output: req.body.output,
        script_dur: req.body.script_dur,
        status: req.body.status,
        length: req.body.length
    }
    io_Redis.get(uuid, (err, result) => {
        if (!err && result) {
            console.log(result);
            emitter_io.to(result).emit('messagefo', data);
            res.status(200).send('ok');
        }
    })
    // emitter_io.to(socket_id).emit('message', data);
    // res.status(200).send('ok');
})

app.post('/api/callbackvd', (req, res) => {
    // body: {output: output, script_dur: end_time - script_start_time}
    console.log('callbackvd');
    let uuid = req.body.uuid;
    console.log('uuid:', uuid);
    console.log('req.body:', req.body);
    var data = {
        status: req.body.status,
        output: req.body.output,
        uuid: req.body.uuid
    }
    io_Redis.get(uuid, (err, result) => {
        if (!err && result) {
            console.log(result);
            emitter_io.to(result).emit('messagevd', data);
            res.status(200).send('ok');
        }
    })
    // emitter_io.to(socket_id).emit('message', data);
    // res.status(200).send('ok');
})

app.post('/api/callbackau', (req, res) => {
    // body: {output: output, script_dur: end_time - script_start_time}
    console.log('callbackau');
    let uuid = req.body.uuid;
    console.log('uuid:', uuid);
    console.log('req.body:', req.body);
    var data = {
        output: req.body.output,
        script_dur: req.body.script_dur,
        status: req.body.status,
        length: req.body.length
    }
    io_Redis.get(uuid, (err, result) => {
        if (!err && result) {
            console.log(result);
            emitter_io.to(result).emit('messageau', data);
            res.status(200).send('ok');
        }
    })
    // emitter_io.to(socket_id).emit('message', data);
    // res.status(200).send('ok');
})

app.post('/api/callbackktjx', (req, res) => {
    // body: {output: output, script_dur: end_time - script_start_time}
    console.log('callbackktjx');
    let uuid = req.body.uuid;
    console.log('uuid:', uuid);
    console.log('req.body:', req.body);
    var data = {
        output: req.body.output,
        script_dur: req.body.script_dur,
        status: req.body.status,
        length: req.body.length
    }
    io_Redis.get(uuid, (err, result) => {
        if (!err && result) {
            console.log(result);
            emitter_io.to(result).emit('messagekt_jx', data);
            res.status(200).send('ok');
        }
    })
    // emitter_io.to(socket_id).emit('message', data);
    // res.status(200).send('ok');
})

app.get(/\/[0-9a-zA-Z\/]*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../../client', 'index.html'));
})

server.listen(PORT, () => {
    console.log(`listening on port ${PORT}.....`);
})

// io.on('connection', (socket) => {
//     console.log('connection:', socket.id);
//     socket.on('initial', (data) => {
//         console.log('data:', data);
//         let uuid = data.uuid,
//             socket_id = data.socket_id;
//         // set socket id in redis
//         io_Redis.set(uuid, socket_id, 'ex', EXPIRE_TIME);
//     })
// })
