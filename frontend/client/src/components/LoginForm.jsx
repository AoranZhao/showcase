'use strict';

import React from 'react';
import PropTypes from 'prop-types';

import './LoginForm.scss';

const LoginForm = ({
    onSubmit,
    status,
    statusText
}) => {
    let ref_email, ref_password;

    return (
        <form
            onSubmit={e => {
                e.preventDefault();
                if(!ref_email.value.trim() || !ref_password.value.trim()) {
                    return;
                }
                onSubmit(ref_email.value.trim(), ref_password.value.trim());
            }}>
            <div>
                <p>{statusText}</p>
            </div>
            <input className="form_input" type="text" placeholder="User ID" name="email" ref={node => ref_email = node} />
            <input className="form_input" type="password" placeholder="Password" name="password" ref={node => ref_password = node} />
            <div className="frame_btn">
                <input className="form_btn" type="submit" value="Login" />
            </div>
        </form>
    )
}

LoginForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    status: PropTypes.number,
    statusText: PropTypes.string
}

export default LoginForm;