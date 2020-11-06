import BaseResponse from './BaseResponse'

class Success extends BaseResponse {

    data: any

    constructor(code: number, message: string, data: any) {
        super(code, message)
        this.data = data
    }

    static createSuccessResponse(data: any) {
        return new Success(200, "Success", data)
    }
}

export default Success