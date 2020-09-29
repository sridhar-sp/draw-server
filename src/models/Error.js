const BaseResponse = require('./BaseResponse.js')

class Error extends BaseResponse {

    static createErrorResponse(code, message){
        return new Error(code,message)
    }

    static unAuthorised() {
        return Error.createErrorResponse(401,"Unauthorized")
    }
}

module.exports = Error