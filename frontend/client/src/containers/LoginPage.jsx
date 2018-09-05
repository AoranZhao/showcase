'use strict';

import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import { Axios } from '../utils';
import { login_ing, login_done, login_err } from '../actions';
import LoginForm from '../components/LoginForm.jsx';

import logo3 from '../static/logo3.png';
import './LoginPage.scss';

const mapStateToProps = state => {
    return {auth: state.auth};
}

let LoginPage = ({auth, dispatch, history}) => {

    let onSubmit = (email, password) => {
        dispatch(login_ing());
        Axios.post('/api/signin', {email: email, password: password})
            .then(response => {
                dispatch(login_done(response));
                history.push('/');
            })
            .catch(error => {
                dispatch(login_err(error))
            })
    }

    let status = 0, statusText = '';
    if(auth) {
        switch(auth.status) {
            case 'login_ing':
                status = 1;
                statusText = 'login...';
                break;
            case 'login_done':
                status = 0;
                statusText = '';
                break;
            case 'login_err':
                status = 3;
                statusText = (auth.data.status === 401) ? 'login fail. please check login info' : auth.data.data;
                break;
            default:
                status = 0;
                statusText = '';
                break;
        }
    }

    return <div>
        <div className="loginPage">
            <img src={logo3} />
            <div className="frame_loginForm">
                <LoginForm onSubmit={onSubmit} status={status} statusText={statusText} />
            </div>
        </div>
    </div>
}

LoginPage = withRouter(connect(mapStateToProps)(LoginPage));

export default LoginPage;