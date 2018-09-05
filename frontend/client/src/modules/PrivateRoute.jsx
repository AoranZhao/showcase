'use strict';

import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';

const mapStateToProps = state => {
    var obj = {};
    obj.token = (typeof state.auth.data === 'undefined') ? undefined : state.auth.data.token;
    return obj;
}

let PrivateRoute = ({ token, component: Component, ...rest }) => {
    return (
        <Route {...rest} render={ props => (
                token ?
                    <Component {...props} /> : 
                    <Redirect to="/login" />
            )}
            />
    )
}

PrivateRoute = withRouter(connect(mapStateToProps)(PrivateRoute));

export default PrivateRoute;