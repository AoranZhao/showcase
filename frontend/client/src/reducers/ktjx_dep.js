'use strict';

const ktjx = (state = {}, action) => {
    switch (action.type) {
        case 'KTJX_RESET_FILES':
            state = { ...state, dropped_files: [], outputs: '' }
            return state;
        case 'KTJX_DROP_FILES':
            if (!Array.isArray(state.dropped_files)) {
                state.dropped_files = [];
            }
            state = { ...state, status: 'drop_files', dropped_files: [...action.files] }
            return state;
        case 'KTJX_UPLOAD_FILES_ING':
            state = { ...state, status: 'upload_files_ing' };
            return state;
        case 'KTJX_UPLOAD_FILES_DONE':
            state = { ...state, status: 'upload_files_done' };
            return state;
        case 'KTJX_UPLOAD_ANALYSIS_ING':
            state = { ...state, status: 'upload_analysis_ing' };
            return state;
        case 'KTJX_UPLOAD_ANALYSIS_DONE':
            state = { ...state, status: 'upload_analysis_done', outputs: action.data.output, api_duration: action.api_dur, script_duration: action.data.script_dur, output_status: action.data.status, length: action.data.length };
            return state;
        case 'KTJX_UPLOAD_FILES_ERR':
            state = { ...state, status: 'upload_files_err', data: action.err };
            return state;
        default:
            return state;
    }
}

export default ktjx;