import express from 'express';

const router = express.Router();

router.post('/createRoom', (re: express.Request, res: express.Response) => {
    res.status(200).send("Room created")
})

module.exports = router;