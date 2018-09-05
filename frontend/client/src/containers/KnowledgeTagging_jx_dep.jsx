'use strict';

import React from 'react';
import { connect } from 'react-redux';
import Dropzone from 'react-dropzone';
import io from 'socket.io-client';
import uuidv5 from 'uuid/v5';
// import { Icon } from 'react-fa';

import moment from 'moment-timezone';
const tz_str = 'Asia/Shanghai';

import { ktjx_reset_files, ktjx_drop_files, ktjx_upload_files_ing, ktjx_upload_files_done, ktjx_upload_analysis_ing, ktjx_upload_analysis_done, ktjx_upload_files_err, ktjx_update_socket } from '../actions';
import { Axios } from '../utils';

import './KnowledgeTagging_jx.scss';

const mapStateToProps = state => {
    return { auth: state.auth, ktjx: state.ktjx, socket: state.socket };
}

const mapDispatchToProps = dispatch => ({
    sync_reset_files: () => {
        dispatch(ktjx_reset_files());
    },
    sync_drop_files: (files) => {
        dispatch(ktjx_drop_files(files));
    },
    promise_upload_files_ing: () => {
        dispatch(ktjx_upload_files_ing());
    },
    promise_upload_files_done: (response, api_dur) => {
        dispatch(ktjx_upload_files_done(response, api_dur));
    },
    promise_upload_files_err: (err) => {
        dispatch(ktjx_upload_files_err(err));
    },
    promise_upload_analysis_ing: () => {
        dispatch(ktjx_upload_analysis_ing());
    },
    promise_upload_analysis_done: (data, api_dur) => {
        dispatch(ktjx_upload_analysis_done(data, api_dur));
    },
    sync_update_socket: (socket_pack) => {
        dispatch(ktjx_update_socket(socket_pack));
    }
})

class KTJXPage extends React.Component {
    constructor(props) {
        super(props);
        this.onFileDrop = this.onFileDrop.bind(this);
        this.preview_texts = this.preview_texts.bind(this);
        this.generate_btn_ctrl = this.generate_btn_ctrl.bind(this);
        this.upload_files = this.upload_files.bind(this);
        this.resetImages = this.resetImages.bind(this);
        this.get_user_info = this.get_user_info.bind(this);
        this.setupSocket = this.setupSocket.bind(this);
        this.syntaxHighlight = this.syntaxHighlight.bind(this);
        if (Object.keys(this.props.socket).length === 0 && this.props.socket.constructor === Object) {
            this.props.sync_update_socket(this.setupSocket());
        }
        this.props.socket.socket.on('messagekt_jx', (data) => {
            console.log('messagekt_jx:', data);
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

    onFileDrop(files) {
        if (files.length > 1) {
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
            if (this.props.socket.uuid) {
                auth_uuid = this.props.socket.uuid;
            } else {
                auth_uuid = uuidv5(socket.id, uuidv5.URL);
                this.props.sync_update_socket({ uuid: auth_uuid });
            }
            console.log('auth_uuid:', auth_uuid);
            socket.emit('initial', { uuid: auth_uuid, socket_id: socket.id });
        })
        // socket.on('messagefo', (data) => {
        //     console.log('messagefo:', data);
        //     var api_end_time = new Date().getTime();
        //     this.props.promise_upload_analysis_done(data, api_end_time - this.api_start_time);
        // })
        return { socket: socket };
    }

    preview_texts() {
        let output_style = {}, script_dur = <em></em>;
        if (this.props.ktjx.output_status) {
            switch (this.props.ktjx.output_status) {
                case 200:
                    output_style = { borderWidth: 1, borderStyle: 'solid', borderColor: 'green' };
                    break;
                case 500:
                    output_style = { borderWidth: 1, borderStyle: 'solid', borderColor: 'red' };
                    break;
                default:
                    break;
            }
        }
        if (this.props.ktjx && Array.isArray(this.props.ktjx.dropped_files)) {
            switch (this.props.ktjx.status) {
                case 'upload_files_ing':
                    return <div><p>uploading...</p></div>
                case 'upload_files_done':
                    return <div><p>upload is done</p></div>
                case 'upload_analysis_ing':
                    return <div><p>upload is done. analyzing...</p></div>
                default:
                    if (this.props.ktjx.outputs && this.props.ktjx.script_duration && this.props.ktjx.length) {
                        var str = Math.round(this.props.ktjx.script_duration * 100 / this.props.ktjx.length) / 100000;
                        script_dur = <em>( {str} s per image)</em>
                    }
                    return <div>
                        {(this.props.ktjx.outputs) ? <div>
                            <div>
                                {(this.props.ktjx.api_duration) ? <p>API execution time: {this.props.ktjx.api_duration / 1000} s</p> : <p>API execution time: unknow</p>}
                                {(this.props.ktjx.script_duration) ? <p>Script execution time: {this.props.ktjx.script_duration / 1000} s {script_dur}</p> : <p>Script execution time: unknow</p>}
                            </div>
                            <br />
                            <div style={output_style}>
                                <p>Output: </p>
                                <pre>{this.syntaxHighlight(JSON.parse(this.props.ktjx.outputs))}</pre>
                            </div>
                        </div> : <div></div>}
                        <br />
                        {(Array.isArray(this.props.ktjx.dropped_files) && this.props.ktjx.dropped_files.length !== 0) ?
                            <table>
                                <thead>
                                    <tr><td>filename</td><td>content</td></tr>
                                </thead>
                                <tbody>
                                    {this.props.ktjx.dropped_files.reverse().map((file, index) => {
                                        return (
                                            <tr key={index}>
                                                <td>
                                                    <p>{file.name}</p>
                                                </td>
                                                <td>
                                                    <pre>{file.preview}</pre>
                                                </td>
                                            </tr>
                                        )
                                    })}
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
        if (this.props.auth.data.expire < new Date().getTime()) {
            isExpire = true;
        }
        return <div>
            <input type="button" value="Upload" disabled={this.sendingStatus.indexOf(this.props.ktjx.status) !== -1 || isExpire} onClick={e => {
                e.preventDefault();
                this.upload_files();
            }} />
            <input type="button" value="Clean" disabled={this.sendingStatus.indexOf(this.props.ktjx.status) !== -1 || isExpire} onClick={e => {
                e.preventDefault();
                this.resetImages();
            }} />
        </div>
    }

    upload_files() {
        this.api_start_time = new Date().getTime();
        if (this.props.ktjx && Array.isArray(this.props.ktjx.dropped_files) && this.props.ktjx.dropped_files.length > 0) {
            this.props.promise_upload_files_ing();
            var imgForm = new FormData(),
                sharedSize = 2 * 1024 * 1024;
            this.props.ktjx.dropped_files.forEach(file => {
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
            imgForm.set('cb_api', '/api/callbackktjx');
            imgForm.set('uuid', this.props.socket.uuid);
            // Axios.post('/api/upload', imgForm, {
            console.dir(imgForm);
            Axios.post('/api/kt/jixin', imgForm, {
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

    syntaxHighlight(json) {
        if (typeof json != 'string') {
            json = JSON.stringify(json, undefined, 2);
        }
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            var cls = 'number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'key';
                } else {
                    cls = 'string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'boolean';
            } else if (/null/.test(match)) {
                cls = 'null';
            }
            // return '<span class="' + cls + '">' + match + '</span>';
            return match;
        });
    }

    render() {
        var frame_user_info = this.get_user_info();
        var texts_preview = this.preview_texts();
        var btn_ctrl = this.generate_btn_ctrl();
        return (
            <div>
                <h2>Knowledge Tagging(Jixin version)</h2>
                {frame_user_info}
                <Dropzone
                    multiple={true}
                    accept="text/plain"
                    onDrop={this.onFileDrop}>
                    <p>Drop an image or click to select a file to upload.</p>
                    <p>Currently our ktjx function is supported by firefox and chrome.</p>
                </Dropzone>
                {btn_ctrl}
                {texts_preview}
            </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(KTJXPage);
