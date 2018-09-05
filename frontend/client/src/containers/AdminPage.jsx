'use strict';

import React from 'react';
import { connect } from 'react-redux';

import moment from 'moment-timezone';
const tz_str = 'Asia/Shanghai';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { get_users_ing, get_users_done, get_users_err, local_update_user,
        update_user_ing, update_user_done, update_user_err,
        delete_user_ing, delete_user_done, delete_user_err,
        add_user_ing, add_user_done, add_user_err} from '../actions';
import { Axios } from '../utils';

const mapStateToProps = state => {
    return {auth: state.auth, users: state.users};
}

const mapDispatchToProps = dispatch => ({
    promise_get_users_ing: () => {
        dispatch(get_users_ing());
    },
    promise_get_users_done: (response) => {
        dispatch(get_users_done(response));
    },
    promise_get_users_err: (err) => {
        dispatch(get_users_err(err));
    },
    sync_local_update_user: (email, user) => {   ///
        dispatch(local_update_user(email, user));
    },
    promise_update_user_ing: () => {
        dispatch(update_user_ing());
    },
    promise_update_user_done: (response) => {
        dispatch(update_user_done(response));
    },
    promise_update_user_err: (err) => {
        dispatch(update_user_err(err));
    },
    promise_delete_user_ing: () => {
        dispatch(delete_user_ing());
    },
    promise_delete_user_done: (response) => {
        dispatch(delete_user_done(response));
    },
    promise_delete_user_err: (err) => {
        dispatch(delete_user_err(err));
    },
    promise_add_user_ing: () => {
        dispatch(add_user_ing());
    },
    promise_add_user_done: (response) => {
        dispatch(add_user_done(response));
    },
    promise_add_user_err: (err) => {
        dispatch(add_user_err(err));
    }
})

class AdminPage extends React.Component {
    constructor(props) {
        super(props);
        this.fetchUsers = this.fetchUsers.bind(this);
        this.handleDatePicker_onChange = this.handleDatePicker_onChange.bind(this);
        this.deleteUser = this.deleteUser.bind(this);
        this.generateUserTable = this.generateUserTable.bind(this);
        this.saveNewUser = this.saveNewUser.bind(this);
        this.convertTime = this.convertTime.bind(this);
        this.ref_email = this.ref_password = this.ref_password_c = this.ref_expire = null;
    }

    componentWillMount() {
        this.fetchUsers();
    }

    fetchUsers() {
        this.props.promise_get_users_ing();
        Axios.get('/api/users', {headers: {"x-token": this.props.auth.data.token}})
            .then(response => {
                this.props.promise_get_users_done(response);
            }).catch(err => {
                this.props.promise_get_users_err(err);
            })
    }

    handleDatePicker_onChange(time, user) {
        var temp_user = {...user, expire: this.convertTime(time)};
        this.props.promise_update_user_ing();
        Axios.put('/api/user/' + user._id, temp_user, {headers: {"x-token": this.props.auth.data.token}})
            .then(response => {
                this.props.promise_update_user_done(response);
            }).catch(err => {
                this.props.promise_update_user_err(err);
            })
    }

    convertTime(time) {
        return new Date(Math.floor(time.unix() / (24 * 60 * 60)) * (24 * 60 * 60 * 1000) + 13 * 60 * 60 * 1000).getTime();
    }

    deleteUser(id) {
        this.props.promise_delete_user_ing();
        Axios.delete('/api/user/' + id, {headers: {"x-token": this.props.auth.data.token}})
            .then(response => {
                this.props.promise_delete_user_done(response);
            }).catch(err => {
                this.props.promise_delete_user_err(err);
            })
    }

    generateUserTable(arr) {
        return <table>
                    <thead>
                        <tr><th>Account</th><th>Password</th><th>validation</th><th>expire date(GTM+8)</th><th>options</th></tr>
                    </thead>
                    <tbody>
                    {arr.map((user, index) => {
                        return (
                            <tr key={index}>
                                <td><p>{user.email}</p></td>
                                <td><p>{user.password}</p></td>
                                    <td>{user.disable ? <p>Disabled</p> : <p>Enabled</p>}</td>
                                    <td><DatePicker
                                            selected={moment(user.expire).tz(tz_str)}
                                            onChange={param => this.handleDatePicker_onChange(param, user)}
                                            showTimeSelect
                                            dateFormat="DD-MMM-YYYY HH:mm"
                                        /></td>
                                    <td><input type="button" value="delete" onClick={e => {
                                        e.preventDefault();
                                        if(confirm('are you sure?')) {
                                            this.deleteUser(user._id);
                                        }
                                    }} /></td>
                                </tr>
                        )})}
                    </tbody>
                </table>
    }

    generateAddUserFrame() {
        return <form onSubmit={e => {
                e.preventDefault();
                var email = this.ref_email.value.trim();
                var passwd = this.ref_password.value.trim();
                var passwd_c = this.ref_password_c.value.trim();
                {/* var expire = this.ref_expire.valueOf.trim(); */}
                if(email && passwd && passwd_c) {
                    if(passwd === passwd_c) {
                        this.saveNewUser(email, passwd);
                    } else {
                        alert('password shold be same.');
                    }
                } else {
                    alert('uncomplete information');
                }
            }}>
            User ID: <input type="text" placeholder="User ID" ref={node => this.ref_email = node} /><br />
            Password: <input type="password" placeholder="Password" ref={node => this.ref_password = node} />
            <input type="password" placeholder="Password Confirm" ref={node => this.ref_password_c = node} /><br />
            <input type="submit" value="Save" />
        </form>
    }

    saveNewUser(email, password) {
        this.props.promise_add_user_ing();
        Axios.post('/api/user', {email: email, password: password}, {headers: {"x-token": this.props.auth.data.token}})
            .then(response => {
                this.ref_email.value = this.ref_password.value = this.ref_password_c.value = '';
                this.fetchUsers();
            }).catch(err => {
                this.promise_add_user_err(err);
            })
    }

    render() {
        var frame_admin = <div><p>not load</p></div>;
        var frame_adduser = this.generateAddUserFrame();
        if(this.props.users) {
            switch(this.props.users.status) {
                case 'get_users_ing':
                    frame_admin = <div><p>loading user info</p></div>;
                    break;
                case 'update_user_ing':
                    frame_admin = <div><p>updating user info</p></div>;
                    break;  
                case 'delete_user_ing':
                    frame_admin = <div><p>deleting user info</p></div>;
                    break;   
                case 'add_user_ing':
                    frame_admin = <div><p>adding user info</p></div>;
                    break;         
                case 'get_users_done':
                case 'update_user_done':
                case 'delete_user_done':
                case 'add_user_done':
                    frame_admin = <div>
                        {this.generateUserTable(this.props.users.data)}
                    </div>;
                    break;
                case 'get_users_err':
                case 'update_user_err':
                case 'delete_user_err':
                case 'add_user_err':
                    frame_admin = <div><p>{this.props.users.data}</p></div>;
                    break;
                default:
                    frame_admin = <div><p>no data</p></div>;
                    break;
            }
        }

        return <div>
            {frame_admin}
            {frame_adduser}
        </div>
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminPage);