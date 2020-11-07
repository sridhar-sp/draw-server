const firebaseAdmin = require('../firebase/firebase.js')
import TokenService from '../services/TokenService'
import { Socket } from 'socket.io'
import JWTAccessTokenPayload from '../models/JWTAccessTokenPayload'
import SimpleUserRecord from '../models/SimpleUserRecord'

const tokenService = new TokenService()

const socketAccessTokenMiddleware = function (socket: Socket, next: Function) {

    const accessToken = socket.handshake.query.token
    const gameKey = socket.handshake.query.gameKey

    if (accessToken === null || accessToken === '' || gameKey == null || gameKey === '') {
        next(new Error("Unauthorized"))
        setTimeout(function () { socket.disconnect() }, 1500)
        return
    }

    verifyAccessToken(accessToken)
        .then(payload => fetchUserDetails(payload.userId))
        .then(userRecord => {
            socket.request.userRecord = userRecord
            next()
        }).catch(error => {
            next(new Error("Unauthorized"))
            setTimeout(function () { socket.disconnect() }, 3000)
        })
}

const verifyAccessToken = function (accessToken: string) {
    return new Promise((resolve: (jwtAccessTokenPayload: JWTAccessTokenPayload) => void, reject: () => void) => {
        const payload = tokenService.verifyAccessToken(accessToken)
        if (payload != null)
            resolve(payload)
        else
            reject()
    })
}

const fetchUserDetails = function (userId: string) {
    return new Promise((resolve: (userRecord: SimpleUserRecord) => void, reject: (error: Error) => void) => {
        firebaseAdmin.auth().getUser(userId)
            .then(function (userRecord: any) {
                resolve(SimpleUserRecord.fromFirebaseUserRecord(userRecord.toJSON()))
            })
            .catch(function (error: Error) {
                console.log('Error fetching user data:', error);
                reject(error)
            });
    })
}

export default socketAccessTokenMiddleware