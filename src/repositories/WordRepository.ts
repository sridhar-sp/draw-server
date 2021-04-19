import { MongoClient } from "mongodb";
import config from "../config"

class WordRepository {

  static create(): WordRepository {
    return new WordRepository();
  }

  private mongoClient: MongoClient

  constructor() {
    this.mongoClient = new MongoClient(config.mongoDBConnectionEndPoint)
    this.mongoClient.connect() // async call
  }

  getRandomWords(maxNoOfResults: number): Promise<Array<string>> {
    return new Promise((resolve: (questions: Array<string>) => void, reject: (error: Error) => void) => {

      if (!this.mongoClient.isConnected()) {
        reject(new Error("Mongo db is not connected"))
        return
      }

      const database = this.mongoClient.db(config.mongoDatabaseName)
      const collection = database.collection(config.mongoQuestionCollectionName)

      collection.aggregate([{ "$sample": { size: maxNoOfResults } }])
        .map<string>(document => document.word)
        .toArray()
        .then(results => results.filter(result => result != null))
        .then(words => resolve(words))
        .catch(error => reject(error))

    })
  }
}

export default WordRepository;
