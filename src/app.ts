
const config = require('./config/index.js')
import express, { Request, Response } from 'express';
const bodyParser = require('body-parser');
const SocketIOServer = require('./socket/SocketIOServer.js')

const app: express.Application = express()

app.use(bodyParser.json());

app.use('/api', require('./routes/api'))

app.get('/', (req: Request, res: Response) => {
    res.send("Welcome to Draw & Guess, Port :: " + config.port)
});

const httpServer = app.listen(config.port, () => {
    console.log(`Listening on PORT ${config.port}`)
});

SocketIOServer.bind(httpServer).build()
