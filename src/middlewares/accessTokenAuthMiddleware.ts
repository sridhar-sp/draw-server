import { NextFunction, Response } from 'express';
import TokenService from '../services/TokenService'
import ErrorResponse from '../models/ErrorResponse'

const tokenService = new TokenService()

const accessTokenAuthMiddleware = function (req: any, res: Response, next: NextFunction) {

    //Check integrity and expiry of the accessToken
    const payload = tokenService.verifyAccessToken(req.accessToken)

    if (payload == null) {
        res.status(401).json(ErrorResponse.unAuthorised());
        return;
    }

    next()
}

export default accessTokenAuthMiddleware;