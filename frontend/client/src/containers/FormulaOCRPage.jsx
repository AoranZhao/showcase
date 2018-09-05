'use strict';

import React from 'react';
import { connect } from 'react-redux';
import Dropzone from 'react-dropzone';
import io from 'socket.io-client';
import uuidv5 from 'uuid/v5';
// import { Icon } from 'react-fa';

import moment from 'moment-timezone';
const tz_str = 'Asia/Shanghai';

import { fo_reset_files, fo_drop_files, fo_upload_files_ing, fo_upload_files_done, fo_upload_analysis_ing, fo_upload_analysis_done, fo_upload_files_err, fo_update_socket } from '../actions';
import { Axios } from '../utils';

const mapStateToProps = state => {
    return {auth: state.auth, formulaocr: state.formulaocr, socket: state.socket};
}

const mapDispatchToProps = dispatch => ({
    sync_reset_files: () => {
        dispatch(fo_reset_files());
    },
    sync_drop_files: (files) => {
        dispatch(fo_drop_files(files));
    },
    promise_upload_files_ing: () => {
        dispatch(fo_upload_files_ing());
    },
    promise_upload_files_done: (response, api_dur) => {
        dispatch(fo_upload_files_done(response, api_dur));
    },
    promise_upload_files_err: (err) => {
        dispatch(fo_upload_files_err(err));
    },
    promise_upload_analysis_ing: () => {
        dispatch(fo_upload_analysis_ing());
    },
    promise_upload_analysis_done: (data, api_dur) => {
        dispatch(fo_upload_analysis_done(data, api_dur));
    },
    sync_update_socket: (socket_pack) => {
        dispatch(fo_update_socket(socket_pack));
    }
})

class FOrmulaOCRPage extends React.Component {
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
        this.props.socket.socket.on('messagefo', (data) => {
            console.log('messagefo:', data);
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
        if(this.props.formulaocr.output_status) {
            switch(this.props.formulaocr.output_status) {
                case 200: 
                    output_style = {borderWidth: 1, borderStyle: 'solid', borderColor: 'green'};
                    break;
                case 500:
                    output_style = {borderWidth: 1, borderStyle: 'solid', borderColor: 'red'};
                    break;
                default:
                    break;
            }
        }
        if(this.props.formulaocr && Array.isArray(this.props.formulaocr.dropped_files)) {
            switch(this.props.formulaocr.status) {
                case 'upload_files_ing':
                    return <div><p>uploading...</p></div>
                case 'upload_files_done':
                    return <div><p>upload is done</p></div>
                case 'upload_analysis_ing':
                    return <div><p>upload is done. analyzing...</p></div>
                default:
                    if(this.props.formulaocr.outputs && this.props.formulaocr.script_duration && this.props.formulaocr.length) {
                        var str = Math.round(this.props.formulaocr.script_duration * 100 / this.props.formulaocr.length) / 100000;
                        script_dur = <em>( {str} s per image)</em>
                    }
                    return <div>
                                {(this.props.formulaocr.outputs) ? <div>
                                        <div>
                                            {(this.props.formulaocr.api_duration) ? <p>API execution time: {this.props.formulaocr.api_duration / 1000} s</p> : <p>API execution time: unknow</p>}
                                            {(this.props.formulaocr.script_duration) ? <p>Script execution time: {this.props.formulaocr.script_duration / 1000} s {script_dur}</p> : <p>Script execution time: unknow</p>}
                                        </div>
                                        <br />
                                        <div style={output_style}>
                                            <p>Output: </p>
                                            <pre>{this.props.formulaocr.outputs}</pre>
                                        </div>
                                    </div> : <div></div>}
                                    <br />
                                    {(Array.isArray(this.props.formulaocr.dropped_files) && this.props.formulaocr.dropped_files.length !== 0) ? 
                                        <table>
                                            <thead>
                                                <tr><td>filename</td><td>img</td></tr>
                                            </thead>
                                            <tbody>
                                            {this.props.formulaocr.dropped_files.reverse().map((file, index) => {
                                                return (
                                                <tr key={index}>
                                                    <td>
                                                        <p>{file.name}</p>
                                                    </td>
                                                    <td>
                                                        <img src={file.preview} style={{maxHeight: "100px", maxWidth: "500px"}} />
                                                    </td>
                                                </tr>
                                            )})}
                                            </tbody>
                                        </table> : 
                                        <div><p>Not select img file yet.</p></div>
                                    }
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
        return <div>
            <input type="button" value="Upload" disabled={this.sendingStatus.indexOf(this.props.formulaocr.status) !== -1 || isExpire} onClick={e => {
                e.preventDefault();
                this.upload_images();
            }} />
            <input type="button" value="Clean" disabled={this.sendingStatus.indexOf(this.props.formulaocr.status) !== -1 || isExpire} onClick={e => {
                e.preventDefault();
                this.resetImages();
            }} />
        </div>
    }

    upload_images() {
        this.api_start_time = new Date().getTime();
        if(this.props.formulaocr && Array.isArray(this.props.formulaocr.dropped_files) && this.props.formulaocr.dropped_files.length > 0) {
            this.props.promise_upload_files_ing();
            var imgForm = new FormData(),
                sharedSize = 2 * 1024 * 1024;
            this.props.formulaocr.dropped_files.forEach(file => {
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
            imgForm.set('cb_api', '/api/callbackfo');
            imgForm.set('uuid', this.props.socket.uuid);
        // Axios.post('/api/upload', imgForm, {
            console.dir(imgForm);
	    Axios.post('/api/formulaocr', imgForm, {
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
                <h2>Formula OCR</h2>
                 {frame_user_info} 
                <Dropzone
                    multiple={true}
                    accept="image/*"
                    onDrop={this.onImageDrop}>
                    <p>Drop an image or click to select a file to upload.</p>
                    <p>Currently our formulaocr function is supported by firefox and chrome.</p>
                </Dropzone>
                {btn_ctrl}
                {images_preview}
            </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(FOrmulaOCRPage);
