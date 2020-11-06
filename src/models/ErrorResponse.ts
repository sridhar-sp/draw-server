import BaseResponse from './BaseResponse'

class Error extends BaseResponse {

    static createErrorResponse(code: number, message: string) {
        return new Error(code, message)
    }

    static unAuthorised() {
        return Error.createErrorResponse(401, "Unauthorized")
    }
}

export default Error