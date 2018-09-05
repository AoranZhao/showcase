'use strict';

import React from 'react';
import { connect } from 'react-redux';
import { logout } from '../actions';

import './LogoutButton.scss';

let LogoutButton = ({dispatch}) => (
    <form
        onSubmit={e => {
            e.preventDefault();
            dispatch(logout());
        }}
        >
        <input type="submit" value="Logout" className="logout_btn" />
    </form>
)

LogoutButton = connect()(LogoutButton);

export default LogoutButton;