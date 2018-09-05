'use strict';

const socket = (state = {}, action) => {
    switch(action.type) {
        case 'UPDATE_SOCKET':
            // socket_pack: {uuid, socket}
            state = {...state, status: 'update_socket', ...action.socket_pack}
            return state;
        default:
            return state;
    }
}

export default socket;