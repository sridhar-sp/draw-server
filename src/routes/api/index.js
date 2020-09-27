const express = require('express');
const authValidator = require('../../validators/authMiddleware.js');

const router = express.Router();

router.use(require('./login.js'))

router.use(authValidator) // use this middleware for all the routes except login
router.use(require('./token.js'))

module.exports = router;