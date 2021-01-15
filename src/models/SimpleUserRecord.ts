class SimpleUserRecord {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;

  constructor(firebaseUserRecord: any) {
    this.uid = firebaseUserRecord.uid;
    this.email = firebaseUserRecord.email;
    this.displayName = firebaseUserRecord.displayName;
    this.photoURL = firebaseUserRecord.photoURL;
  }

  static fromFirebaseUserRecord(firebaseUserRecord: any) {
    return new SimpleUserRecord(firebaseUserRecord);
  }

  toJson(): string {
    return JSON.stringify(this);
  }
}

export default SimpleUserRecord;
