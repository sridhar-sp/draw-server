class TokenResponse {
    token: string

    constructor(token: string) {
        this.token = token;
    }

    static create(token: string) {
        return new TokenResponse(token);
    }
}

export default TokenResponse