const firebaseAdmin = require('../firebase/firebase.js')
const TokenService = require('../services/TokenService.js')
const SimpleUserRecord = require('../models/SimpleUserRecord.js')

const tokenService = new TokenService()

const socketAccessTokenMiddleware = function (socket, next) {

    const accessToken = socket.handshake.query.token
    const gameKey = socket.handshake.query.gameKey

    if (accessToken === null || accessToken === '' || gameKey == null || gameKey === '') {
        next(new Error("Unauthorized"))
        setTimeout(function () { socket.disconnect() }, 1500)
        return
    }

    socket.accessToken = accessToken
    socket.gameKey = gameKey

    verifyAccessToken(accessToken)
        .then(payload => fetchUserDetails(payload.userId))
        .then(userRecord => {
            socket.userRecord = userRecord
            next()
        }).catch(error => {
            next(new Error("Unauthorized"))
            setTimeout(function () { socket.disconnect() }, 3000)
        })
}

const verifyAccessToken = function (accessToken) {
    return new Promise((resolve, reject) => {
        const payload = tokenService.verifyAccessToken(accessToken)
        if (payload != null)
            resolve(payload)
        else
            reject()
    })
}

const fetchUserDetails = function (userId) {
    return new Promise((resolve, reject) => {
        firebaseAdmin.auth().getUser(userId)
            .then(function (userRecord) {
                resolve(SimpleUserRecord.fromFirebaseUserRecord(userRecord.toJSON()))
            })
            .catch(function (error) {
                console.log('Error fetching user data:', error);
                reject(error)
            });
    })
}

module.exports = socketAccessTokenMiddleware