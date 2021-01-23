import { json } from 'body-parser'
import BaseResponse from './BaseResponse'

class Error extends BaseResponse {

    static createErrorResponse(code: number, message: string) {
        return new Error(code, message)
    }

    static unAuthorized() {
        return Error.createErrorResponse(401, "Unauthorized")
    }

    toJson() {
        return JSON.stringify(this)
    }
}

export default Error