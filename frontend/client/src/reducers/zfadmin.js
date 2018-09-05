import { SSL_OP_LEGACY_SERVER_CONNECT } from "constants";

'use strict';

const zfadmin = (state = {}, action) => {
    switch (action.type) {
        case 'ZFADMIN_GET_MISSIONS_ING':
            state = { ...state, missions: { status: 'ing' } };
            return state;
        case 'ZFADMIN_GET_MISSIONS_DONE':
            state = { ...state, missions: { status: 'done', data: action.data } };
            return state;
        case 'ZFADMIN_GET_MISSIONS_ERR':
            state = { ...state, missions: { status: 'err', err: action.err } };
            return state;
        case 'ZFADMIN_UPDATE_MISSION_ING':
            state = { ...state, update_mission: { status: 'ing' } };
            return state;
        case 'ZFADMIN_UPDATE_MISSION_DONE':
            state = { ...state, update_mission: { status: 'done', data: action.data } };
            return state;
        case 'ZFADMIN_UPDATE_MISSION_ERR':
            state = { ...state, update_mission: { status: 'err', err: action.err } };
            return state;
        case 'ZFADMIN_GET_SOLUTION_ING':
            state = { ...state, solution: { status: 'ing' } };
            return state;
        case 'ZFADMIN_GET_SOLUTION_DONE':
            state = { ...state, solution: { status: 'done', data: action.data } };
            return state;
        case 'ZFADMIN_GET_SOLUTION_ERR':
            state = { ...state, solution: { status: 'err', err: action.err } };
            return state;
        case 'ZFADMIN_SWITCH_MISSION':
            state = { ...state, mission: action.mission };
            return state;
        case 'ZFADMIN_CHANGE_SOLUTION':
            if (typeof state.solution !== 'undefined' && typeof state.solution.data !== 'undefined' && state.solution.data[action.sid] !== 'undefined') {
                let solutions = state.solution.data.reduce((sol_arr, solution, index) => {
                    if (index === action.sid) {
                        let data = [];
                        if (Array.isArray(solution.solution) && solution.solution.length > 0) {
                            data = solution.solution.reduce((arr, val) => {
                                if (val.index === action.index.toString())
                                    arr = [...arr, { ...val, value: action.value }];
                                else
                                    arr = [...arr, { ...val }];
                                return arr;
                            }, []);
                        } else {
                            let temp_data = [];
                            for (var i = 0; i <= 52; i++) {
                                temp_data.push({
                                    index: i.toString(),
                                    value: ''
                                });
                            }
                            data = temp_data.reduce((arr, val) => {
                                if (val.index === action.index.toString())
                                    arr = [...arr, { ...val, value: action.value }];
                                else
                                    arr = [...arr, { ...val }];
                                return arr;
                            }, []);
                        }
                        solution = { ...solution, solution: [...data] };
                    }
                    sol_arr = [...sol_arr, solution];
                    return sol_arr;
                }, [])

                state = { ...state, solution: { ...state.solution, data: [...solutions] } };
            }
            return state;
        default:
            return state;
    }
}

export default zfadmin;