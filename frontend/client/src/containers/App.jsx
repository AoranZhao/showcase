'use strict';

import React from 'react';
import {
    BrowserRouter as Router,
    Route,
    browserHistory,
    Redirect
} from 'react-router-dom';

import PrivateRoute from '../modules/PrivateRoute.jsx';
import LoginPage from './LoginPage.jsx';
import HomePage from './HomePage.jsx';

import './App.scss';

// import eye_tracking from 'aaron-loader/eye-tracking/v1';

const App = () => {
    return (
        <Router history={browserHistory} >
            <div style={{width: '100%'}}>
                <Route exact path="/" render={() => (
                    <Redirect to="/home" />
                )} />
                <PrivateRoute path="/home" component={HomePage} />
                <Route path="/login" component={LoginPage} />
            </div>
        </Router>
    )
}    

export default App;