const SoketServer = require('socket.io')

const PORT = 3000;

const server = SoketServer(PORT)

server.on("connection",socket=>{
    console.log("Socket connected ${socket.id}")
})
