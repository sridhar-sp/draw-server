const firebaseAdmin = require('../firebase/firebase.js')
const Error = require('../models/ErrorResponse.js');

const firebaseAuthMiddleware = function (req, res, next) {
    
    firebaseAdmin.auth().verifyIdToken(req.body.userToken)
        .then(function (decodedToken) {
            let uid = decodedToken.uid;
            req.uid = uid;
            next()
        }).catch(function (error) {
            res.status(422).json(Error.unAuthorised())
        });
}


module.exports = firebaseAuthMiddleware;