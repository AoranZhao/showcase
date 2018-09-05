import codes from '../codes';

let initial = (req, res) => {
    res.status(200).send({
        pModel: codes.pModel
    });
}

export default {
    initial: initial
}