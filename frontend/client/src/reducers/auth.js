'use strict';

const auth = (state = {}, action) => {
    switch(action.type) {
        case 'LOGIN_ING':
            state = {status: 'login_ing'};
            return state;
        case 'LOGIN_DONE':
            state = {status: 'login_done', data: action.response.data};
            return state;
        case 'LOGIN_ERR':
            state = {status: 'login_err', data: action.err.response};
            return state;
        case 'LOGOUT':
            state = {status: 'logout'};
            return state;
        default:
            return state;
    }
}

export default auth;