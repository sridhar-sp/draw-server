
class SimpleUserRecord {

    constructor(firebaseUserRecord) {
        this.uid = firebaseUserRecord.uid
        this.email = firebaseUserRecord.email
        this.displayName = firebaseUserRecord.displayName
        this.photoURL = firebaseUserRecord.photoURL
    }

    static fromFirebaseUserRecord(firebaseUserRecord) {
        return new SimpleUserRecord(firebaseUserRecord)
    }
}

module.exports = SimpleUserRecord