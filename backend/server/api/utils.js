import nano from 'nano';
import path from 'path';

let getDb = function () {
    return nano(process.env.COUCHDB_URL || 'http://couchdb.zhaoaoran.ca')
}

const views = {
    config: 'config',
    user: 'user'
}

const getStaticPath = (req) => {
    return path.join(req.headers.host, 'download');
}

let redis = () => {
    let o = {
        port: 6379,
        host: 'localhost',
        retryStrategy: function (times) {
            return null; // no retry
        }
    }
    return require('ioredis')(o)
}

let emitter_io = () => {
    return require('socket.io-emitter')(redis())
}

export default {
    getDb: getDb,
    views: views,
    getStaticPath: getStaticPath,
    redis: redis,
    emitter_io: emitter_io
}
