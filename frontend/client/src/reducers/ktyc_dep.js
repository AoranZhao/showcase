'use strict';

const ktyc = (state = {}, action) => {
    switch (action.type) {
        case 'KT_YC_UPLOAD_QUESTION_ING':
            state = { ...state, question: action.question, output: '', err: '' }
            return state;
        case 'KT_YC_UPLOAD_QUESTION_DONE':
            state = { ...state, question: action.data.questions, output: action.data.output, err: '' }
            return state;
        case 'KT_YC_UPLOAD_QUESTION_ERR':
            state = { ...state, err: action.err }
            return state;
        case 'KT_YC_RESET_QUESTION':
            state = { question: '' }
            return state;
        default:
            return state;
    }
}

export default ktyc;