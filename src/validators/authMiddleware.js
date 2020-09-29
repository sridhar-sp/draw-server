const tokenService = require('../services/TokenService.js')
const Error = require('../models/Error')

const authValidator = function (req, res, next) {
    const authorization = req.headers.authorization;

    console.log("Auth validator " + authorization)
    
    const accessToken = extractToken(authorization)
    if (!accessToken) {
        res.status(401).json(Error.unAuthorised())
        return;
    }

    const payload = tokenService.verifyAccessToken(accessToken)
    console.log("Payload "+payload)
    if (payload == null) {
        res.status(401).json(Error.unAuthorised());
        return;
    }    
    
    next()
}

const extractToken = function (authorizationValue) {
    if (!authorizationValue || !authorizationValue instanceof String || authorizationValue.trim() === '')
        return null

    const authFields = authorizationValue.split(' ')

    if (!authFields || authFields.length != 2 || authFields[0] !== 'Bearer')
        return null

    return authFields[1]
}

module.exports = authValidator;