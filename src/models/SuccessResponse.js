const BaseResponse = require('./BaseResponse.js')

class Success extends BaseResponse {

    constructor(code, message, data) {
        super(code, message)
        this.data = data
    }

    static createSuccessResponse(data) {
        return new Success(200, "Success", data)
    }
}

module.exports = Success