const jwt = require('jsonwebtoken')
import express from 'express';
import firebaseTokenValidator from '../../validators/firebaseTokenValidator'
const firebaseAuthMiddleware = require('../../middlewares/firebaseAuthMiddleware.js')
import accessTokenValidator from '../../validators/accessTokenValidator'
import LoginService from '../../services/LoginService'
const config = require('../../config/index.js')
import SuccessResponse from '../../models/SuccessResponse'
import TokenResponse from '../../models/TokenResponse'


const router = express.Router()
const loginService = new LoginService()

router.post('/token', firebaseTokenValidator, firebaseAuthMiddleware, async (req: any, res: express.Response) => {

    const token = await loginService.authenticateUser(req.uid)

    res.status(200).json(SuccessResponse.createSuccessResponse(TokenResponse.create(token)))
})

router.post('/refreshToken', accessTokenValidator, async (req: any, res: express.Response) => {
    console.log("Refresh token")
    const response = await loginService.authenticateUserBasedOnRefreshToken(req.accessToken)
    res.status(response.code).json(response)
})

module.exports = router;