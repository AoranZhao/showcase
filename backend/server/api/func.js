import codes from '../codes';

let detect = (req, res) => {
    if(req.body.sat && req.body.rsat && req.body.ssat && req.body.cannySat && req.body.width && req.body.height && req.body.step && req.body.classifier) {
        var sat = req.body.sat,
            rsat = req.body.rsat,
            ssat = req.body.ssat,
            cannySat = req.body.cannySat,
            width = req.body.width,
            height = req.body.height,
            step = req.body.step,
            classifier = req.body.classifier;
        
        var rects = codes.detect(sat, rsat, ssat, cannySat, width, height, step, classifier);
        res.status(200).send({data: rects});
    } else {
        res.status(500).send({location: 'detect', reason: 'body parameters miss'})
    }
}

let groupRectangles = (req, res) => {
    if(req.body.rects && req.body.minNeighbors && req.body.confluence) {
        var rects = req.body.rects,
            minNeighbors = req.body.minNeighbors,
            confluence = req.body.confluence;

        var filteredGroups = codes.groupRectangles(rects, minNeighbors, confluence);
        res.status(200).send({data: filteredGroups});
    } else {
        res.status(500).send({location: 'groupRectangles', reason: 'body parameters miss'})
    }
}

export default {
    detect: detect,
    groupRectangles: groupRectangles
}