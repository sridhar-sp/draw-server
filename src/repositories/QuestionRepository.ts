import questionDataset from '../question/questions'

class QuestionRepository {
    constructor() {

    }
    getQuestions(limit: number) {
        const questions = []
        for (let i = 0; i < limit; i++) {
            questions.push(questionDataset[Math.floor(Math.random() * questionDataset.length)])
        }
        return questions
    }
}

export default QuestionRepository