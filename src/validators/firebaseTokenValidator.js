const firebaseAdmin = require('../firebase/firebase.js')
const Error = require('../models/ErrorResponse.js');

const firebaseTokenValidator = function (req, res, next) {

    const userToken = req.body.userToken

    if (!userToken) {
        res.status(422).json(Error.createErrorResponse(422, "Missing user token"))
        return;
    }
    next()
}


module.exports = firebaseTokenValidator;