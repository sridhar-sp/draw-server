const jwt = require('jsonwebtoken')
const express = require('express');
const firebaseTokenValidator = require('../../validators/firebaseTokenValidator.js')
const firebaseAuthMiddleware = require('../../middlewares/firebaseAuthMiddleware.js')
const accessTokenValidator = require('../../validators/accessTokenValidator.js')
import LoginService from '../../services/LoginService'
const config = require('../../config/index.js')
import SuccessResponse from '../../models/SuccessResponse'
import TokenResponse from '../../models/TokenResponse'


const router = express.Router()
const loginService = new LoginService()

router.post('/token', firebaseTokenValidator, firebaseAuthMiddleware, async (req, res) => {

    const token = await loginService.authenticateUser(req.uid)

    res.status(200).json(SuccessResponse.createSuccessResponse(TokenResponse.create(token)))
})

router.post('/refreshToken', accessTokenValidator, async (req, res) => {
    console.log("Refresh token")
    const response = await loginService.authenticateUserBasedOnRefreshToken(req.accessToken)
    res.status(response.code).json(response)
})

module.exports = router;