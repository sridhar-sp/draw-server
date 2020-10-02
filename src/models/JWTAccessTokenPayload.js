class JWTAccessTokenPayload {
    constructor(userId) {
        this.userId = userId;
    }

    static create(userId) {
        return new JWTAccessTokenPayload(userId);
    }

    toJson() {
        return JSON.parse(JSON.stringify(this));
    }

}

module.exports = JWTAccessTokenPayload