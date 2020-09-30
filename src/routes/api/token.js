const jwt = require('jsonwebtoken')
const express = require('express');
const tokenValidator = require('../../validators/firebaseTokenValidator.js')
const firebaseAuthMiddleware = require('../../middlewares/firebaseAuthMiddleware.js')
const accessTokenValidator = require('../../validators/accessTokenValidator.js')
const config = require('../../config/index.js')
const Success = require('../../models/Success.js')
const TokenResponse = require('../../models/TokenResponse.js')

const router = express.Router()

router.post('/token', tokenValidator, firebaseAuthMiddleware, (req, res) => {

    const payload = { "userId": req.body.uid }

    const token = jwt.sign(payload, config.accessToken.secret)

    res.status(200).json(Success.createSuccessResponse(TokenResponse.create(token)))
})

router.post('/refreshToken', accessTokenValidator, (req, res) => {
    console.log("Regenerate token")
    res.status(200).json("Success")
})

module.exports = router;