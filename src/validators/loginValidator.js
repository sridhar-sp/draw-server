const firebaseAdmin = require('../firebase/firebase.js')
const Error = require('../models/Error.js');

const loginValidator = function (req, res, next) {
    console.log("Login validator")
    const userToken = req.body.userToken
    
    if (!userToken) {
        res.status(422).json(Error.createErrorResponse(422, "Missing user token"))
        return;
    }

    firebaseAdmin.auth().verifyIdToken(userToken)
        .then(function (decodedToken) {
            let uid = decodedToken.uid;
            req.uid = uid;
            next()
        }).catch(function (error) {
            res.status(422).json(Error.unAuthorised())
        });

}


module.exports = loginValidator;