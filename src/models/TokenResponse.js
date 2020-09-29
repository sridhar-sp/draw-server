class TokenResponse {
    constructor(token) {
        this.token = token;
    }

    static create(token) {
        return new TokenResponse(token);
    }
}

module.exports = TokenResponse