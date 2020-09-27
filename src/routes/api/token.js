const express = require('express');

const router = express.Router();

router.post('/regenerateToken', (req, res) => {
    console.log("Regenerate token")
    res.status(200).json("Success")
})

module.exports = router;