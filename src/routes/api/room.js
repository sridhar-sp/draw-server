const express = require('express')

const router = express.Router();

router.post('/createRoom',(req,res)=>{
    res.status(200).send("Room created")
})

module.exports = router;