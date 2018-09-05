import express from 'express';
import api from '../api';
import connectMultiparty from 'connect-multiparty';

let multiParty = connectMultiparty();
let apiRoute = express.Router();

apiRoute.post('/signup', (req, res) => {
    api.signup(req, res);
})

apiRoute.post('/signin', (req, res) => {
    api.auth(req, res);
})

apiRoute.get('/heartbeat', (req, res) => {
    api.heartbeat(req, res);
})

apiRoute.get('/ping', (req, res) => {
    api.ping(req, res);
})

apiRoute.get('/video/:id', (req, res) => {
    api.videoFetchResult(req, res);
})

apiRoute.use(api.verify);
apiRoute.use(api.isDisable);
apiRoute.use(api.isExpire);

apiRoute.get('/initial', (req, res) => {
    api.initial(req, res);
})

apiRoute.post('/detect', (req, res) => {
    api.detect(req, res);
})

apiRoute.post('/grouprectangles', (req, res) => {
    api.groupRectangles(req, res);
})

apiRoute.post('/recognize', multiParty, (req, res) => {
    console.log('api recognize');
    api.recognizeImages(req, res);
})

apiRoute.post('/tex2pic', (req, res) => {
    api.tex2pic(req, res);
})

apiRoute.post('/nnin', (req, res) => {
    api.nnin(req, res);
})

apiRoute.post('/formulaocr', multiParty, (req, res) => {
    api.formulaocr(req, res);
})

apiRoute.post('/autosolve', multiParty, (req, res) => {
    api.autosolve(req, res);
})

apiRoute.post('/video', multiParty, (req, res) => {
    api.handlevideo(req, res);
})

// dep 
// apiRoute.post('/kt/jixin', multiParty, (req, res) => {
//     api.knowledgetagging_jixin(req, res);
// })

apiRoute.post('/kt/jixin', (req, res) => {
    api.knowledgetagging_jixin(req, res);
})

apiRoute.post('/kt/yichen', (req, res) => {
    api.knowledgetagging_yichen(req, res);
})

// test formidable
apiRoute.post('/upload', multiParty, (req, res) => {
    api.testUploadImages(req, res);
})
//

apiRoute.get('/zf/missions', (req, res) => {
    api.getZFMissions(req, res);
})

apiRoute.get('/zf/mission/:mission_id', (req, res) => {
    api.getZFMission(req, res);
})

apiRoute.post('/zf/mission', multiParty, (req, res) => {
    api.addZFMission(req, res);
})

apiRoute.put('/zf/mission/:mission_id', (req, res) => {
    api.updateZFMission(req, res);
})

apiRoute.get('/zf/mission/:mission_id/solutions', (req, res) => {
    api.getZFSolutions(req, res);
})

apiRoute.put('/zf/solution/:solution_id', (req, res) => {
    api.updateZFSolution(req, res);
})

// kt for physics
apiRoute.post('/kt/physics', (req, res) => {
    api.knowledgetagging_physics(req, res);
})

apiRoute.use(api.isAdmin);

apiRoute.get('/users', (req, res) => {
    api.getUsers(req, res);
})

apiRoute.get('/user/:id', (req, res) => {
    api.getUser(req, res);
})

apiRoute.post('/user', (req, res) => {
    api.addUser(req, res);
})

apiRoute.put('/user/:id', (req, res) => {
    api.updateUser(req, res);
})

apiRoute.delete('/user/:id', (req, res) => {
    api.deleteUser(req, res);
})

export default {
    apiRoute: apiRoute
}
