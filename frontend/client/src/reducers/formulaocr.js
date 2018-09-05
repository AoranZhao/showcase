'use strict';

const formulaocr = (state = {}, action) => {
    switch (action.type) {
        case 'FO_RESET_FILES':
            state = { ...state, dropped_files: [], outputs: '' }
            return state;
        case 'FO_DROP_FILES':
            if (!Array.isArray(state.dropped_files)) {
                state.dropped_files = [];
            }
            state = { ...state, status: 'drop_files', dropped_files: [...action.files] }
            return state;
        case 'FO_UPLOAD_FILES_ING':
            state = { ...state, status: 'upload_files_ing' };
            return state;
        case 'FO_UPLOAD_FILES_DONE':
            state = { ...state, status: 'upload_files_done' };
            return state;
        case 'FO_UPLOAD_ANALYSIS_ING':
            state = { ...state, status: 'upload_analysis_ing' };
            return state;
        case 'FO_UPLOAD_ANALYSIS_DONE':
            state = { ...state, status: 'upload_analysis_done', outputs: action.data.output, api_duration: action.api_dur, script_duration: action.data.script_dur, output_status: action.data.status, length: action.data.length };
            return state;
        case 'FO_UPLOAD_FILES_ERR':
            state = { ...state, status: 'upload_files_err', data: action.err };
            return state;
        default:
            return state;
    }
}

export default formulaocr;