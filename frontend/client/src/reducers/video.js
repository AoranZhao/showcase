'use strict';

const video = (state = {}, action) => {
    switch (action.type) {
        case 'VD_RESET_VIDEO':
            state = { ...state, input: {}, output: {} }
            return state;
        case 'VD_DROP_VIDEO':
            if (action.category === 'teacher' || action.category === 'student') {
                console.log('type is:', action.category);
                state = { ...state, input: { ...state.input, [action.category]: action.file }, status: 'drop_video' }
            }
            return state;
        case 'VD_SEND_VIDEO_ING':
            state = { ...state, status: 'send_video_ing' };
            return state;
        case 'VD_SEND_VIDEO_ERR':
            state = { ...state, status: 'send_video_err' };
            return state;
        case 'VD_SEND_VIDEO_DONE':
            state = { ...state, status: 'send_video_done' };
            return state;
        case 'VD_ANALYSIS_ING':
            state = { ...state, status: 'analysis_ing' };
            return state;
        case 'VD_ANALYSIS_DONE':
            state = { ...state, status: 'analysis_done', output: action.data };
            return state;
        default:
            return state;
    }
}

export default video;