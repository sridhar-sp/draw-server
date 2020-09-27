
const config = require('./src/config/index.js')
const util = require('util');
const express = require('express');
const bodyParser = require('body-parser');
const SoketServer = require('socket.io');

const app = express()

const httpServer = app.listen(config.port, () => {
    console.log(`Listening on PORT ${config.port}`)
});

const socketIOServer = SoketServer(httpServer)

socketIOServer.use((socket, next) => {
    console.log("Socket middleware *** ")
    // console.log(`Handshake ${util.inspect(socket.handshake,false,null,true)}`)
    // console.log("Handshake query"+util.inspect(socket.handshake.query,false,null,true))
    // console.log("*** Socket middleware")
    next()
})

socketIOServer.on("connection", socket => {
    console.log(`Socket connected ${socket.id}`)

    socket.on("global_channel", data => {
        console.log(`global_channel ${socket.id} ${data}`)

        socket.broadcast.emit("global_channel", data)

        console.log("Room details acccess from main "+getObjInfo(socketIOServer.adapter.rooms))

        socketIOServer.to("play_area").emit("global_channel", "Data emitted for room"+data)

        // if (data.indexOf('1') != -1) {
        //     socket.broadcast.emit("global_channel", `broadcasting from ${socket.id} msg is ${data}`)
        // } else if (data.indexOf('2') != -1) {
        //     socket.emit("global_channel", "Sending data to onlt the specific socket")
        // } else {
        //     server.emit("global_channel", `Server sending to all ${data}`)
        // }

    })
})

var middleware = function (req, res, next) {
    console.log("Middle ware is called")
    next()
}

var secondMiddleware = (req, res, next) => {
    console.log("Second Middle ware is called")
    next()
}

app.use(bodyParser.json());

app.use(middleware)
app.use(secondMiddleware)

// app.use('/api',require('./src/routes/api/routeOne.js'))
app.use('/api', require('./src/routes/api'))

var i = 0;

app.get('/', (req, res) => {
    i++;
    res.send("Welcome " + i+" "+config.port)
});

app.post('/post',(req,res)=>{

    console.log("POST method :"+req.body.a)
    res.send(getObjInfo(req.body))
});

function getObjInfo(obj){
    return util.inspect(obj,false,null,true);
}