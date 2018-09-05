import express from 'express';
import http from 'http';
import socketIO from 'socket.io';
import path from 'path';
import bodyParser from 'body-parser';
import cors from 'cors';
import api from './api';
import routes from './routes';

// const PORT = process.env.PORT || 2978;
const PORT = 2978;

let app = express();
let server = http.createServer(app);
let io = socketIO(server);

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

app.use('/download', express.static('/tmp'));

app.use('/api', routes.apiRoute);

server.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
})
