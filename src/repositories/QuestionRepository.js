const questionDataset = require('../question/questions.js')

class QuestionRepository {
    constructor() {

    }
    getQuestions(limit) {
        const questions = []
        for (let i = 0; i < limit; i++) {
            questions.push(questionDataset[Math.floor(Math.random() * questionDataset.length)])
        }
        return questions
    }
}

module.exports = QuestionRepository