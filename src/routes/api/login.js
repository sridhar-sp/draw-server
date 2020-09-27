const express = require('express');
const loginValidator = require('../../validators/loginValidator.js')

const router = express.Router()

router.post('/login', loginValidator, (req, res) => {
    console.log("Login succes")
    res.status(200).json("Success")
})

module.exports = router;
