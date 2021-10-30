import { MongoClient } from "mongodb";

import config from "../config"
import logger from "../logger/logger"
import { AutoId } from "../firebase/firebaseUtils"
import firebase from '../firebase/firebase'
import { firestore } from "firebase-admin";
import WordSelectionSource from "../models/WordSelectionSource";


type WordDocumentData = { word: string };
class WordRepository {

  private static TAG = "WordRepository"

  private static FALLBACK_DRAWING_WORDS = ["Android", "Wifi", "Robot", "Bluetooth", "Door"]
  private static MAXIMUM_WAIT_TIME_IN_MILLISECONDS = 300000

  private static ROOT_COLLECTION_NAME = "words_repo_temp"
  private static WORDS_COLLECTION_NAME = "words_list"

  static create(): WordRepository {
    return new WordRepository();
  }

  private mongoClient: MongoClient

  constructor() {
    this.mongoClient = new MongoClient(config.mongoDBConnectionEndPoint, { useUnifiedTopology: true })
    this.mongoClient.connect() // async call
    logger.logDebug(WordRepository.TAG, "Initalizing WordRepository")
  }

  getRandomWords(organiserUid: string, wordSelectionSource: number, maxNoOfResults: number): Promise<Array<string>> {
    logger.logDebug(WordRepository.TAG, `getRandomWords organiserUid = ${organiserUid} wordSelectionSource = ${wordSelectionSource} maxNoOfResults = ${maxNoOfResults}`)
    return Promise.race(
      [
        this.getRandomWordsFromRespectiveDataSource(organiserUid, wordSelectionSource, maxNoOfResults).then(this.appendFallbackDrawingWordsIfRequired),
        new Promise((resolve: (words: Array<string>) => void, _) => {
          setTimeout(() => {
            logger.logDebug(WordRepository.TAG, "Unabe to fetch words from data source within the max time, sending fallback words.")
            resolve(WordRepository.FALLBACK_DRAWING_WORDS)
          }, WordRepository.MAXIMUM_WAIT_TIME_IN_MILLISECONDS)
        }),
      ]
    )
  }

  private getRandomWordsFromRespectiveDataSource(organiserUid: string, wordSelectionSource: number, maxNoOfResults: number): Promise<Array<string>> {
    logger.logDebug(WordRepository.TAG, `getRandomWordsFromRespectiveDataSource wordSelectionSource = ${wordSelectionSource}`)
    switch (wordSelectionSource) {
      case WordSelectionSource.FROM_USER_DB:
        return this.getRandomWordsFromFirestore(organiserUid, maxNoOfResults)
      case WordSelectionSource.FROM_SHARED_DB:
        return this.getRandomWordsFromDatabase(maxNoOfResults)
      case WordSelectionSource.FROM_SHARED_AND_USER:
        return this.getRandomWordsFromUserDbAndSharedDb(organiserUid, maxNoOfResults)
      default:
        return this.getRandomWordsFromDatabase(maxNoOfResults)
    }
  }

  private getRandomWordsFromUserDbAndSharedDb(organiserUid: string, maxNoOfResults: number): Promise<Array<string>> {
    return new Promise((resolve: (data: Array<string>) => void, _: (error: Error) => void) => {
      Promise.allSettled([
        this.getRandomWordsFromFirestore(organiserUid, Math.floor(maxNoOfResults / 2)),
        this.getRandomWordsFromDatabase(Math.ceil(maxNoOfResults / 2))
      ]).then((results: Array<PromiseSettledResult<Array<string>>>) => {
        const words: Array<string> = []
        results.forEach((result: PromiseSettledResult<Array<string>>) => {
          if (result.status == "fulfilled")
            words.push(...result.value)
        })
        resolve(words)
      }).catch(e => {
        logger.logDebug(WordRepository.TAG, "Error from getRandomWordsFromUserDbAndSharedDb")
        logger.logError(WordRepository.TAG, e)
      });

    })
  }

  private appendFallbackDrawingWordsIfRequired(words: Array<string>): Promise<Array<string>> {
    if (words.length > 3)
      return Promise.resolve(words)

    console.log("Appending fallback words, current word size = ", words.length)
    const newWords: Array<string> = []
    newWords.push(...words)
    newWords.push(...WordRepository.FALLBACK_DRAWING_WORDS)
    return Promise.resolve(newWords)
  }

  private getRandomWordsFromFirestore(userId: string, maxWords: number): Promise<Array<string>> {
    return new Promise(async (resolve: (words: Array<string>) => void, reject: (error: Error) => void) => {
      logger.logDebug(WordRepository.TAG, `Get random words from firebase, maxWords = ${maxWords}`)

      const randomDocId = AutoId.newId()

      this.getWordsFromFirestore(userId, randomDocId, maxWords, true).then(data => {
        if (data.length > 0)
          resolve(data)
        else
          this.getWordsFromFirestore(userId, randomDocId, maxWords, false).then(data => {
            resolve(data)
          })
      }).catch(e => {
        logger.logDebug(WordRepository.TAG, "Error from getRandomWordsFromFirestore method")
        logger.logError(WordRepository.TAG, e)
        resolve([])
      })
    })
  }

  private getWordsFromFirestore(userId: string, randomDocId: string, limit: number, isUpperBound: boolean): Promise<Array<string>> {
    return new Promise((resolve: (data: Array<string>) => void, reject: (error: Error) => void) => {
      logger.logDebug(WordRepository.TAG, `Fetching words from firebase isUpperBound ${isUpperBound}`)

      firebase.firestore().collection(WordRepository.ROOT_COLLECTION_NAME)
        .doc(userId)
        .collection(WordRepository.WORDS_COLLECTION_NAME)
        .where(firestore.FieldPath.documentId(), isUpperBound ? ">=" : "<", randomDocId)
        .limit(limit)
        .get()
        .then((snapshot: firestore.QuerySnapshot<any>) => {
          const result: Array<string> = []

          snapshot.forEach((doc: firestore.QueryDocumentSnapshot<WordDocumentData>) => {
            result.push(doc.data().word)
          });

          resolve(result)
        }).catch(e => {
          logger.logDebug(WordRepository.TAG, "Error from getWordsFromFirebase method")
          logger.logError(WordRepository.TAG, e)
          resolve([])
        })
    })
  }

  private getRandomWordsFromDatabase(maxNoOfResults: number): Promise<Array<string>> {
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
