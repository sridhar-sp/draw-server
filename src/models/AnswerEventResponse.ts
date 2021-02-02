class AnswerEventResponse {
    public answer: string
    public answerResultState: AnswerResultState

    static createWrongAnswerResponse(answer: string): AnswerEventResponse {
        return new AnswerEventResponse(answer, AnswerResultState.WRONG)
    }

    static createCorrectAnswerResponse(answer: string): AnswerEventResponse {
        return new AnswerEventResponse(answer, AnswerResultState.CORRECT)
    }

    static createCloseAnswerResponse(answer: string): AnswerEventResponse {
        return new AnswerEventResponse(answer, AnswerResultState.CLOSE)
    }

    private constructor(answer: string, answerResultState: AnswerResultState) {
        this.answer = answer
        this.answerResultState = answerResultState
    }

}

enum AnswerResultState {
    WRONG = 0,
    CORRECT = 1,
    CLOSE = 2
}

export default AnswerEventResponse