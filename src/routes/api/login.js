const jwt = require('jsonwebtoken')
const express = require('express');
const loginValidator = require('../../validators/loginValidator.js')
const config = require('../../config/index.js')
const Success = require('../../models/Success.js')
const TokenResponse = require('../../models/TokenResponse.js')

const router = express.Router()


router.post('/token', loginValidator, (req, res) => {

    const payload = { "userId": req.body.uid }

    const token = jwt.sign(payload, config.accessToken.secret)

    res.status(200).json(Success.createSuccessResponse(TokenResponse.create(token)))
})

module.exports = router;
