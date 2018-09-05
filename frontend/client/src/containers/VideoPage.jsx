'use strict';

import React from 'react';
import { connect } from 'react-redux';
import Dropzone from 'react-dropzone';
import io from 'socket.io-client';
import uuidv5 from 'uuid/v5';

import moment from 'moment-timezone';
const tz_str = 'Asia/Shanghai';

import { vd_reset_video, vd_drop_video, vd_send_video_ing, vd_send_video_err, vd_send_video_done, vd_analysis_ing, vd_analysis_done, vd_update_socket } from '../actions';
import { Axios } from '../utils';

const mapStateToProps = state => {
    return { auth: state.auth, video: state.video, socket: state.socket };
}

const mapDispatchToProps = dispatch => ({
    sync_reset_video: () => {
        dispatch(vd_reset_video());
    },
    sync_drop_video: (file, category) => {
        dispatch(vd_drop_video(file, category));
    },
    promise_send_video_ing: () => {
        dispatch(vd_send_video_ing());
    },
    promise_send_video_err: () => {
        dispatch(vd_send_video_err());
    },
    promise_send_video_done: () => {
        dispatch(vd_send_video_done());
    },
    promise_analysis_ing: () => {
        dispatch(vd_analysis_ing());
    },
    promise_analysis_done: (data) => {
        dispatch(vd_analysis_done(data));
    },
    sync_update_socket: (socket_pack) => {
        dispatch(vd_update_socket(socket_pack));
    }
})

class VideoPage extends React.Component {
    constructor(props) {
        super(props);
        this.resetVideo = this.resetVideo.bind(this);
        this.onFileDrop = this.onFileDrop.bind(this);
        this.onTeacherFileDrop = this.onTeacherFileDrop.bind(this);
        this.onStudentFileDrop = this.onStudentFileDrop.bind(this);
        this.get_user_info = this.get_user_info.bind(this);
        this.generate_output = this.generate_output.bind(this);
        this.props.socket.socket.on('messagevd', (data) => {
            console.log('messagevd:', data);
            this.props.promise_analysis_done(data);
        })
        this.generate_btn_ctrl = this.generate_btn_ctrl.bind(this);
        this.sendingStatus = ['send_video_ing', 'send_video_done', 'analysis_ing'];
    }

    componentWillMount() {
        this.resetVideo();
    }

    resetVideo() {
        this.props.sync_reset_video();
    }

    onFileDrop(files, category) {
        if (files.length === 0) {
            alert('only accept mp4 file');
            return;
        }
        if (files.length > 1) {
            alert('only upload one video file, please');
        }
        console.log('drop file for', category);
        console.log(files);
        this.props.sync_drop_video(files[0], category);
    }

    onTeacherFileDrop(files) {
        this.onFileDrop(files, 'teacher');
    }

    onStudentFileDrop(files) {
        this.onFileDrop(files, 'student');
    }

    get_user_info() {
        let expire_style = {};
        if (this.props.auth.data.expire < new Date().getTime()) {
            expire_style = { color: 'red' }
        }
        if (this.props.auth.data) {
            let greeting = (this.props.auth.data.email) ? <p>hello, {this.props.auth.data.email}</p> : <p>hello, </p>,
                expire_time = moment(this.props.auth.data.expire).tz(tz_str).format('MMMM Do YYYY, H:mm'),
                expire_mention = (this.props.auth.data.expire) ? <p>Account expire at <em style={expire_style}>{expire_time}</em></p> : <p>Account expire at unknow</p>;
            return <div>
                {greeting}
                {expire_mention}
            </div>
        } else {
            return <div><p>loading user infomation</p></div>
        }
    }

    generate_btn_ctrl() {
        let isExpire = false;
        if (this.props.auth.data.expire < new Date().getTime()) {
            isExpire = true;
        }
        return <div>
            <input type="button" value="Upload" disabled={this.sendingStatus.indexOf(this.props.video.status) !== -1 || isExpire} onClick={e => {
                e.preventDefault();
                this.send_video();
            }} />
            <input type="button" value="Clean" disabled={this.sendingStatus.indexOf(this.props.video.status) !== -1 || isExpire} onClick={e => {
                e.preventDefault();
                this.resetVideo();
            }} />
        </div>
    }

    send_video() {
        console.log('prepare send video');
        if (typeof this.props.video === 'undefined' || (typeof this.props.video.input.student === 'undefined' && typeof this.props.video.input.teacher === 'undefined')) {
            alert('can not upload empty video');
        } else {
            this.props.promise_send_video_ing();
            let imgForm = new FormData();
            if (typeof this.props.video.input.student !== 'undefined')
                imgForm.set('student', this.props.video.input.student)
            if (typeof this.props.video.input.teacher !== 'undefined')
                imgForm.set('teacher', this.props.video.input.teacher);
            imgForm.set('cb_api', '/api/callbackvd');
            imgForm.set('uuid', this.props.socket.uuid);
            Axios.post('/api/video', imgForm, {
                headers: {
                    "x-token": this.props.auth.data.token,
                    "Content-Type": "multipart/form-data"
                }
            }).then(response => {
                console.log('video response:');
                console.log(response);
                this.props.promise_send_video_done();
                this.props.promise_analysis_ing();
            }).catch(err => {
                console.log('video err:');
                console.log(err);
                this.props.promise_send_video_err();
            })
        }
    }

    generate_output() {
        return (typeof this.props.video.output !== 'undefined' && typeof this.props.video.output.output !== 'undefined' && !!this.props.video.output.output.toString().match(/^http:\/\//)) ?
            <div><a href={this.props.video.output.output.toString()}>{'download result from <' + this.props.video.output.output.toString() + '>'}</a></div> : <div></div>
    }

    render() {
        let frame_user_info = this.get_user_info();
        let btn_ctl = this.generate_btn_ctrl();
        let output = this.generate_output();
        return (<div>
            <h2>Video</h2>
            {frame_user_info}
            <table>
                <tr>
                    <td>
                        <div style={{}}>
                            <p>Student Video:</p>
                            <Dropzone
                                multiple={false}
                                accept="video/mp4"
                                onDrop={this.onStudentFileDrop}>
                                <p>Drop Student Video with MP4 format.</p>
                                <p>Only accept one student video</p>
                            </Dropzone>
                        </div>
                    </td>
                    <td>
                        {(typeof this.props.video.input !== 'undefined' && typeof this.props.video.input.student !== 'undefined') ?
                            <div>
                                <video width="400" controls>
                                    <source src={this.props.video.input.student.preview} type="video/mp4" />
                                    Your browser does not support HTML5 video.
                        </video>
                            </div> : <div></div>
                        }
                    </td>
                </tr>
                <tr>
                    <td>
                        <div style={{}}>
                            <p>Teacher Video:</p>
                            <Dropzone
                                multiple={false}
                                accept="video/mp4"
                                onDrop={this.onTeacherFileDrop}>
                                <p>Drop Teacher Video with MP4 format.</p>
                                <p>Only accept one teacher video</p>
                            </Dropzone>
                        </div>
                    </td>
                    <td>
                        {(typeof this.props.video.input !== 'undefined' && typeof this.props.video.input.teacher !== 'undefined') ?
                            <div>
                                <video width="400" controls>
                                    <source src={this.props.video.input.teacher.preview} type="video/mp4" />
                                    Your browser does not support HTML5 video.
                        </video>
                            </div> : <div></div>
                        }
                    </td>
                </tr>
            </table>
            {btn_ctl}
            {output}
        </div>)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(VideoPage);