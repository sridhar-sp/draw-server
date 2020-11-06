class JWTAccessTokenPayload {

    userId: string

    constructor(userId: string) {
        this.userId = userId;
    }

    static create(userId: string) {
        return new JWTAccessTokenPayload(userId);
    }

    toJson() {
        return JSON.parse(JSON.stringify(this));
    }

}

export default JWTAccessTokenPayload