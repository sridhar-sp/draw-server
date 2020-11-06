const firebaseAdmin = require('../firebase/firebase.js')
import ErrorResponse from '../models/ErrorResponse';

const firebaseAuthMiddleware = function (req, res, next) {

    firebaseAdmin.auth().verifyIdToken(req.body.userToken)
        .then(function (decodedToken) {
            let uid = decodedToken.uid;
            req.uid = uid;
            next()
        }).catch(function (error) {
            res.status(422).json(ErrorResponse.unAuthorised())
        });
}


module.exports = firebaseAuthMiddleware;