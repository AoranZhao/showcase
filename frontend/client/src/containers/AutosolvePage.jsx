'use strict';

import React from 'react';
import { connect } from 'react-redux';
import Dropzone from 'react-dropzone';
import io from 'socket.io-client';
import uuidv5 from 'uuid/v5';
// import { Icon } from 'react-fa';

import moment from 'moment-timezone';
const tz_str = 'Asia/Shanghai';

import { au_reset_files, au_drop_files, au_upload_files_ing, au_upload_files_done, au_upload_analysis_ing, au_upload_analysis_done, au_upload_files_err, au_update_socket, au_update_type } from '../actions';
import { Axios } from '../utils';

const mapStateToProps = state => {
    return {auth: state.auth, autosolve: state.autosolve, socket: state.socket};
}

const mapDispatchToProps = dispatch => ({
    sync_reset_files: () => {
        dispatch(au_reset_files());
    },
    sync_drop_files: (files) => {
        dispatch(au_drop_files(files));
    },
    promise_upload_files_ing: () => {
        dispatch(au_upload_files_ing());
    },
    promise_upload_files_done: (response, api_dur) => {
        dispatch(au_upload_files_done(response, api_dur));
    },
    promise_upload_files_err: (err) => {
        dispatch(au_upload_files_err(err));
    },
    promise_upload_analysis_ing: () => {
        dispatch(au_upload_analysis_ing());
    },
    promise_upload_analysis_done: (data, api_dur) => {
        dispatch(au_upload_analysis_done(data, api_dur));
    },
    sync_update_socket: (socket_pack) => {
        dispatch(au_update_socket(socket_pack));
    },
    sync_update_type: (type) => {
        dispatch(au_update_type(type));
    }
})

class AutosolvePage extends React.Component {
    constructor(props) {
        super(props);
        this.onImageDrop = this.onImageDrop.bind(this);
        this.preview_images = this.preview_images.bind(this);
        this.generate_btn_ctrl = this.generate_btn_ctrl.bind(this);
        this.upload_images = this.upload_images.bind(this);
        this.resetImages = this.resetImages.bind(this);
        this.get_user_info = this.get_user_info.bind(this);
        this.setupSocket = this.setupSocket.bind(this);
        if(Object.keys(this.props.socket).length === 0 && this.props.socket.constructor === Object) {
            this.props.sync_update_socket(this.setupSocket());
        }
        this.props.socket.socket.on('messageau', (data) => {
            console.log('messageau:', data);
            var api_end_time = new Date().getTime();
            this.props.promise_upload_analysis_done(data, api_end_time - this.api_start_time);
        })
        this.sendingStatus = ['upload_files_ing', 'upload_files_done', 'upload_analysis_ing'];
    }

    componentWillMount() {
        this.resetImages();
    }

    resetImages() {
        this.props.sync_reset_files();
    }

    onImageDrop(files) {
        if(files.length > 1) {
            alert('only upload one file, please');
        }
        console.log(`drop file, ${files.length}`);
        console.dir(files);
        this.props.sync_drop_files(files.slice(0, 1));
    }

    setupSocket() {
        console.log('set up socket');
        // let socket = io('http://localhost:2979');
	    var baseUrl = window.location.href.split('//')[1].split('/')[0];
        let socket = io('http://' + baseUrl);
        socket.on('connect', () => {
            console.log('socket id:', socket.id);
            let auth_uuid = '';
            if(this.props.socket.uuid) {
                auth_uuid = this.props.socket.uuid;
            } else {
                auth_uuid = uuidv5(socket.id, uuidv5.URL);
                this.props.sync_update_socket({uuid: auth_uuid});
            }
            console.log('auth_uuid:', auth_uuid);
            socket.emit('initial', {uuid: auth_uuid, socket_id: socket.id});
        })
        // socket.on('messagefo', (data) => {
        //     console.log('messagefo:', data);
        //     var api_end_time = new Date().getTime();
        //     this.props.promise_upload_analysis_done(data, api_end_time - this.api_start_time);
        // })
        return {socket: socket};
    }

    preview_images() {
        let output_style = {}, script_dur = <em></em>;
        if(this.props.autosolve.output_status) {
            switch(this.props.autosolve.output_status) {
                case 200: 
                    output_style = {borderWidth: 1, borderStyle: 'solid', borderColor: 'green', margin: '3px 5px 3px 5px'};
                    break;
                case 500:
                    output_style = {borderWidth: 1, borderStyle: 'solid', borderColor: 'red', margin: '3px 5px 3px 5px'};
                    break;
                default:
                    break;
            }
        }
        if(this.props.autosolve && Array.isArray(this.props.autosolve.dropped_files)) {
            switch(this.props.autosolve.status) {
                case 'upload_files_ing':
                    return <div><p>uploading...</p></div>
                case 'upload_files_done':
                    return <div><p>upload is done</p></div>
                case 'upload_analysis_ing':
                    return <div><p>upload is done. analyzing...</p></div>
                default:
                    if(this.props.autosolve.outputs && this.props.autosolve.script_duration && this.props.autosolve.length) {
                        var str = Math.round(this.props.autosolve.script_duration * 100 / this.props.autosolve.length) / 100000;
                        script_dur = <em>( {str} s per image)</em>
                    }
                    var detected_type = '', solution = '';
                    if(this.props.autosolve.outputs && this.props.autosolve.output_status === 200) {
                        if(this.props.autosolve.outputs.split(/\n[\s|\t]*\r*\n/).length > 1) {
                            solution = this.props.autosolve.outputs.split(/\n[\s|\t]*\r*\n/).slice(1).join(/\n\n/);
                            detected_type = this.props.autosolve.outputs.split(/\n[\s|\t]*\r*\n/)[0];
                        } else {
                            solution = this.props.autosolve.outputs;
                        }
                    } else {
                        solution = this.props.autosolve.outputs;
                    }
                    return <div style={{maxWidth: '550px'}}>
                        {(Array.isArray(this.props.autosolve.dropped_files) && this.props.autosolve.dropped_files.length !== 0) ? 
                            <table>
                                <tbody>
                                {this.props.autosolve.dropped_files.reverse().map((file, index) => {
                                    return (
                                    <tr key={index}>
                                        <td>
                                            <p>{file.name}</p>
                                        </td>
                                        <td>
                                            <img src={file.preview} style={{maxHeight: "100px", maxWidth: "400px"}} />
                                        </td>
                                    </tr>
                                )})}
                                </tbody>
                            </table> : 
                            <Dropzone
                                multiple={true}
                                accept="image/*"
                                onDrop={this.onImageDrop}>
                                <p>Drop an image or click to select a file to upload.</p>
                                <p>Currently our autosolve function is supported by firefox and chrome.</p>
                            </Dropzone>
                        }
                        {(this.props.autosolve.outputs) ? <div>
                                <div>
                                    {(this.props.autosolve.api_duration) ? <p>API执行时间: {this.props.autosolve.api_duration / 1000} s</p> : <p>API执行时间: unknow</p>}
                                    {(this.props.autosolve.script_duration) ? <p>脚本执行时间: {this.props.autosolve.script_duration / 1000} s {script_dur}</p> : <p>脚本执行时间: unknow</p>}
                                </div>
                                <br />
                                { (detected_type) ?  <div style={output_style}>
                                    <p>检测到问题类型:</p>
                                    <pre style={{whiteSpace: 'pre-wrap'}}>{detected_type}</pre>
                                </div> : <div></div>}
                                <div style={output_style}>
                                    { (this.props.autosolve.output_status === 200) ? <p>解答: </p> : <p>错误: </p>}
                                    <pre style={{whiteSpace: 'pre-wrap'}}>{solution}</pre>
                                </div>
                            </div> : <div></div>}
                        </div>
            }
        } else {
            return <div></div>
        }
    }

    generate_btn_ctrl() {
        let isExpire = false;
        if(this.props.auth.data.expire < new Date().getTime()) {
            isExpire = true;
        }
        var style = {
            width: '130px',
            margin: '3px 5px 3px 5px'
        }
        return <div style={{ float: 'right' }}>
            <p style={{margin: '0'}}>问题类型</p>
            <select style={style} value={ (typeof this.props.autosolve.question_type === 'undefined') ? 'no' : this.props.autosolve.question_type } disabled={this.sendingStatus.indexOf(this.props.autosolve.status) !== -1 || isExpire} onChange={e => {
                e.preventDefault();
                this.props.sync_update_type(e.target.value);
            }}>
                <option value="no">未选择</option>
                <option value="ineq">不等式组</option>
                <option value="poly">方程</option>
                <option value="factor">因式分解</option>
                <option value="num_exp">有理数式</option>
            </select><br />
            <input style={style} type="button" value="Solve !" disabled={this.sendingStatus.indexOf(this.props.autosolve.status) !== -1 || isExpire} onClick={e => {
                e.preventDefault();
                this.upload_images();
            }} /><br />
            <input style={style} type="button" value="Clean" disabled={this.sendingStatus.indexOf(this.props.autosolve.status) !== -1 || isExpire} onClick={e => {
                e.preventDefault();
                this.resetImages();
            }} /><br />
        </div>
    }

    upload_images() {
        this.api_start_time = new Date().getTime();
        if(this.props.autosolve && Array.isArray(this.props.autosolve.dropped_files) && this.props.autosolve.dropped_files.length > 0) {
            this.props.promise_upload_files_ing();
            var imgForm = new FormData(),
                sharedSize = 2 * 1024 * 1024;
            this.props.autosolve.dropped_files.forEach(file => {
                // var total_shares = Math.ceil(file.size / sharedSize);
                
                // for(var i = 0; i < total_shares; i++) {
                //     var start = i * total_shares,
                //         end = Math.min(file.size, start + sharedSize);
                    
                //     imgForm.append('images', file.slice(start, end));
                //     imgForm.append('name', file.name);
                //     imgForm.append('total', total_shares);
                //     imgForm.append('index', i);
                // }
                imgForm.append('images', file);
            })
            imgForm.set('cb_api', '/api/callbackau');
            imgForm.set('uuid', this.props.socket.uuid);
            if(typeof this.props.autosolve.question_type !== 'undefined' && this.props.autosolve.question_type !== 'no') {
                imgForm.set('question_type', this.props.autosolve.question_type);
            }
        // Axios.post('/api/upload', imgForm, {
	    Axios.post('/api/autosolve', imgForm, {
                headers: {
                    "x-token": this.props.auth.data.token,
                    "Content-Type": "multipart/form-data"
                }
            }).then(response => {
                this.props.promise_upload_files_done();
                this.props.promise_upload_analysis_ing();
            }).catch(err => {
                this.props.promise_upload_files_err(err);
            })
        } else {
            alert('please choose images to upload first.');
        }
    }

    get_user_info() {
        let expire_style = {};
        if(this.props.auth.data.expire < new Date().getTime()) {
            expire_style = { color: 'red' }
        }
        if(this.props.auth.data) {
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

    render() {
        var frame_user_info = this.get_user_info();
        var images_preview = this.preview_images();
        var btn_ctrl = this.generate_btn_ctrl();
        return(
            <div>
                <h2>Autosolve</h2>
                {frame_user_info} 
                <div style={{ width: '700px' }}>
                    {btn_ctrl}
                    {images_preview}
                </div>
            </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AutosolvePage);
