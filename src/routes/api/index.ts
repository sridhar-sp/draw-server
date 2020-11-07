import express from 'express';
import accessTokenValidator from '../../validators/accessTokenValidator'
const accessTokenAuthMiddleware = require('../../middlewares/accessTokenAuthMiddleware.js');

const router = express.Router();

router.use(require('./token'))

router.use(accessTokenValidator)
router.use(accessTokenAuthMiddleware)

router.use(require('./room'))

module.exports = router;