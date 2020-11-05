const TokenService = require('../services/TokenService')
const Error = require('../models/ErrorResponse.js')

const tokenService = new TokenService()

const accessTokenAuthMiddleware = function (req, res, next) {

    //Check integrity and expiry of the accessToken
    const payload = tokenService.verifyAccessToken(req.accessToken)

    if (payload == null) {
        res.status(401).json(Error.unAuthorised());
        return;
    }

    next()
}

module.exports = accessTokenAuthMiddleware;