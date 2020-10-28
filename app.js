
const config = require('./src/config/index.js')
const express = require('express');
const bodyParser = require('body-parser');
const SocketIOServer = require('./src/socket/SocketIOServer.js')

const app = express()

app.use(bodyParser.json());

app.use('/api', require('./src/routes/api'))

app.get('/', (req, res) => {
    res.send("Welcome to Draw & Guess, Port :: " + config.port)
});

const httpServer = app.listen(config.port, () => {
    console.log(`Listening on PORT ${config.port}`)
});

SocketIOServer.bind(httpServer).build()
