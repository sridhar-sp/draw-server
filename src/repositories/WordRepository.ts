import { MongoClient } from "mongodb";
import config from "../config"
import logger from "../logger/logger"

class WordRepository {

  private static TAG = "WordRepository"

  private static FALLBACK_DRAWING_WORDS = ["Android", "Harry Potter"]
  private static MAXIMUM_WAIT_TIME_IN_MILLISECONDS = 3000

  static create(): WordRepository {
    return new WordRepository();
  }

  private mongoClient: MongoClient

  constructor() {
    this.mongoClient = new MongoClient(config.mongoDBConnectionEndPoint)
    this.mongoClient.connect() // async call
  }

  getRandomWords(maxNoOfResults: number): Promise<Array<string>> {
    return Promise.race(
      [
        this.getRandomWordsFromDatabase(maxNoOfResults),
        new Promise((resolve: (words: Array<string>) => void, reject) => {
          setTimeout(() => resolve(WordRepository.FALLBACK_DRAWING_WORDS), WordRepository.MAXIMUM_WAIT_TIME_IN_MILLISECONDS)
        }),
      ]
    )
  }

  getRandomWordsFromDatabase(maxNoOfResults: number): Promise<Array<string>> {
    return new Promise((resolve: (questions: Array<string>) => void, reject: (error: Error) => void) => {

      if (!this.mongoClient.isConnected()) {
        logger.logError(WordRepository.TAG, "Mongo db is not connected, returning default values")

        resolve(WordRepository.FALLBACK_DRAWING_WORDS)
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
