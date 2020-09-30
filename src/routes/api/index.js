const express = require('express');
const accessTokenValidator = require('../../validators/accessTokenValidator.js')
const accessTokenAuthMiddleware = require('../../middlewares/accessTokenAuthMiddleware.js');

const router = express.Router();

router.use(require('./token.js'))

router.use(accessTokenValidator)
router.use(accessTokenAuthMiddleware)

router.use(require('./room.js'))

module.exports = router;