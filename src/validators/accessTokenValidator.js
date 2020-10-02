const Error = require('../models/ErrorResponse.js')

const accessTokenValidator = function (req, res, next) {
    const authorization = req.headers.authorization;
    
    const accessToken = extractToken(authorization)
    if (!accessToken) {
        res.status(401).json(Error.unAuthorised())
        return;
    }

    req.accessToken = accessToken;

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

module.exports = accessTokenValidator

