'use strict';

const users = (state = {}, action) => {
    switch(action.type) {
        case 'GET_USERS_ING':
            state = {status: 'get_users_ing'};
            return state;
        case 'GET_USERS_DONE':
            state = {status: 'get_users_done', data: action.response.data};
            return state;
        case 'GET_USERS_ERR':
            state = {status: 'get_users_err', data: action.err};
            return state;
        case 'LOCAL_UPDATE_USER':
            let temp_data = state.data.reduce((u1, u2) => {
                if(u2.email === action.email) {
                    u1 = [...u1, {...action.user}];
                } else {
                    u1 = [...u1, u2];
                }
                return u1;
            }, []);
            state = {...state, data: temp_data};
            return state;
        case 'UPDATE_USER_ING':
            state = {...state, status: 'update_user_ing'};
            return state;
        case 'UPDATE_USER_DONE':
            state = {...state, status: 'update_user_done', data: state.data.map(u => {
                if(u._id === action.response.data._id) {
                    return action.response.data;
                }
                return u;
            })};
            return state;
        case 'UPDATE_USER_ERR':
            state = {...state, status: 'update_user_err', data: action.err};
            return state;
        case 'DELETE_USER_ING':
            state = {...state, status: 'delete_user_ing'};
            return state;
        case 'DELETE_USER_DONE':
            state = {...state, status: 'delete_user_done', data: state.data.reduce((u1, u2) => {
                if(u2._id !== action.response.data._id) {
                    u1 = [...u1, u2];
                }
                return u1;
            }, [])}
            return state;
        case 'DELETE_USER_ERR':
            state = {...state, status: 'delete_user_err', data: action.err}
            return state;
        case 'ADD_USER_ING':
            state = {...state, status: 'add_user_ing'};
            return state;
        case 'ADD_USER_DONE':
            state = {...state, status: 'add_user_done'};
            return state;
        case 'ADD_UER_ERR': 
            state = {...state, status: 'add_user_err', data: action.err};
            return state;
        default:
            return state;
    }
}

export default users;