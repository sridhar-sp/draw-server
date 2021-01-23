import { NextFunction, Response } from 'express';
import firebaseAdmin from '../firebase/firebase'
import ErrorResponse from '../models/ErrorResponse';

const firebaseAuthMiddleware = function (req: any, res: Response, next: NextFunction) {

    firebaseAdmin.auth().verifyIdToken(req.body.userToken)
        .then(function (decodedToken) {
            let uid = decodedToken.uid;
            req.uid = uid;
            next()
        }).catch(function (error) {
            res.status(422).json(ErrorResponse.unAuthorized())
        });
}


export default firebaseAuthMiddleware;