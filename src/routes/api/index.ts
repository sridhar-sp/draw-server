import express from 'express';
const accessTokenValidator = require('../../validators/accessTokenValidator.js')
const accessTokenAuthMiddleware = require('../../middlewares/accessTokenAuthMiddleware.js');

const router = express.Router();

router.use(require('./token'))

router.use(accessTokenValidator)
router.use(accessTokenAuthMiddleware)

router.use(require('./room'))

module.exports = router;