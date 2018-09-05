"use strict";

import React from 'react';
import { connect } from 'react-redux';
import Dropzone from 'react-dropzone';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import './ZF.scss';

import ReactCrop from 'react-image-crop';

import { zf_add_crop, zf_rm_crop, zf_update_crop, zf_add_mission, zf_switch_mission, zf_switch_tab, zf_add_mission_ing, zf_add_mission_done, zf_add_mission_err, zf_get_missions_ing, zf_get_missions_done, zf_get_missions_err, zf_get_solution_ing, zf_get_solution_done, zf_get_solution_err } from '../actions';
import { Axios } from '../utils';

const mapStateToProps = state => {
    return { auth: state.auth, zf: state.zf };
}

const mapDispatchToProps = dispatch => ({
    sync_zf_add_crop: (crop) => {
        dispatch(zf_add_crop(crop));
    },
    sync_zf_rm_crop: (index) => {
        dispatch(zf_rm_crop(index));
    },
    sync_zf_update_crop: (corp) => {
        dispatch(zf_update_crop(corp));
    },
    sync_zf_add_mission: (files) => {
        dispatch(zf_add_mission(files));
    },
    sync_zf_switch_mission: (mission_id) => {
        dispatch(zf_switch_mission(mission_id));
    },
    sync_zf_switch_tab: (tabname) => {
        dispatch(zf_switch_tab(tabname));
    },
    promise_add_mission_ing: () => {
        dispatch(zf_add_mission_ing());
    },
    promise_add_mission_done: (data) => {
        dispatch(zf_add_mission_done(data));
    },
    promise_add_mission_err: (err) => {
        dispatch(zf_add_mission_err(err));
    },
    promise_get_missions_ing: () => {
        dispatch(zf_get_missions_ing());
    },
    promise_get_missions_done: (data) => {
        dispatch(zf_get_missions_done(data));
    },
    promise_get_missions_err: (err) => {
        dispatch(zf_get_missions_err(err));
    },
    promise_get_solution_ing: () => {
        dispatch(zf_get_solution_ing());
    },
    promise_get_solution_done: (data) => {
        dispatch(zf_get_solution_done(data));
    },
    promise_get_solution_err: (err) => {
        dispatch(zf_get_solution_err(err));
    }
})

class ZFPage extends React.Component {
    constructor(props) {
        super(props);
        this.switchTab = this.switchTab.bind(this);
        this.switchMission = this.switchMission.bind(this);
        this.fetch_missions = this.fetch_missions.bind(this);
        this.submit_mission = this.submit_mission.bind(this);
        this.add_mission = this.add_mission.bind(this);
        this.fetch_solution = this.fetch_solution.bind(this);
        this.set_crop = this.set_crop.bind(this);
        this.add_crop = this.add_crop.bind(this);
        this.rm_crop = this.rm_crop.bind(this);

        this.generate_options = this.generate_options.bind(this);
        this.generate_tab = this.generate_tab.bind(this);
        this.generate_sidebar = this.generate_sidebar.bind(this);
        this.generate_content = this.generate_content.bind(this);
        this.generate_new = this.generate_new.bind(this);
        this.generate_solution = this.generate_solution.bind(this);

        this.onCropComplete = this.onCropComplete.bind(this);
        this.onCropChange = this.onCropChange.bind(this);
    }

    componentWillMount() {
        this.switchTab('missions');
        this.add_mission([]);
    }

    generate_options() {
        return <div style={{ width: '400px', height: '60px' }}>
            <a style={{ cursor: 'pointer', width: '100px', display: 'inline-block', margin: '2px', border: '1px solid #AAAAAA' }} onClick={e => {
                e.preventDefault();
                this.switchTab('missions');
            }}>
                <p>Missions</p>
            </a>
            <a style={{ cursor: 'pointer', width: '100px', display: 'inline-block', margin: '2px', border: '1px solid #AAAAAA' }} onClick={e => {
                e.preventDefault();
                this.switchTab('new');
            }}>
                <p>New</p>
            </a>
        </div>
    }

    switchTab(tabname) {
        this.props.sync_zf_switch_tab(tabname);
        switch (tabname) {
            case 'missions':
                this.fetch_missions();
                this.props.promise_get_solution_done({});
                break;
            case 'new':
                this.add_mission([]);
                break;
            default:
                break;
        }
    }

    switchMission(mission_id) {
        this.props.sync_zf_switch_mission(mission_id);
        this.props.promise_get_solution_done({});
    }

    generate_tab() {
        let content = <div>
            <p>Content Page</p>
        </div>;
        if (!!this.props.zf && this.props.zf.tab === 'missions') {
            content = <div style={{ width: '900px' }}>
                {this.generate_sidebar()}
                {this.generate_content()}
            </div>;
        } else if (!!this.props.zf && this.props.zf.tab === 'new') {
            content = <div style={{ width: '900px' }}>
                {this.generate_new()}
            </div>
        }
        return content;
    }

    generate_sidebar() {
        let content = <div style={{ verticalAlign: 'top' }}><p>Content Sidebar</p></div>;
        if (!!this.props.zf && !!this.props.zf.missions && Array.isArray(this.props.zf.missions.data)) {
            content = <div style={{ width: '280px', display: 'inline-block', verticalAlign: 'top' }}>
                <div>
                    <a style={{ cursor: 'pointer', width: '250px', display: 'inline-block', margin: '2px', border: '1px solid #AAAAAA' }}
                        onClick={e => {
                            e.preventDefault();
                            this.fetch_missions();
                        }}>
                        <p>Refresh</p>
                    </a>
                </div>
                <div>
                    {this.props.zf.missions.data.map((mission, index) => {
                        return <div key={index}>
                            <a style={{ cursor: 'pointer', width: '250px', display: 'inline-block', margin: '2px', border: (!!mission.check) ? '1px solid green' : '1px solid red', borderRightWidth: (!!this.props.zf.mission && this.props.zf.mission === mission.id) ? '10px' : '1px' }}
                                onClick={e => {
                                    e.preventDefault();
                                    this.switchMission(mission.id)
                                }}>
                                <p>{mission.id}</p>
                            </a>
                        </div>
                    })}
                </div>
            </div>
        } else {
            content = <div style={{ width: '280px', display: 'inline-block', verticalAlign: 'top' }}>
                <div>
                    <a style={{ cursor: 'pointer', width: '250px', display: 'inline-block', margin: '2px', border: '1px solid #AAAAAA' }}
                        onClick={e => {
                            e.preventDefault();
                            this.fetch_missions();
                        }}>
                        <p>Refresh</p>
                    </a>
                </div>
                <div>
                    <p>Refreshing....</p>
                </div>
            </div>
        }
        return content;
    }

    generate_content() {
        let content = <div style={{ width: '600px', display: 'inline-block', verticalAlign: 'top' }}>
            <h2>Mission: </h2>
        </div>
        if (!!this.props.zf && !!this.props.zf.mission && Array.isArray(this.props.zf.missions.data)) {
            let missions = this.props.zf.missions.data.filter(mission => ((mission.id === this.props.zf.mission) ? true : false));
            if (missions.length > 0) {
                content = <div style={{ width: '600px', display: 'inline-block', verticalAlign: 'top' }}>
                    <Tabs>
                        <TabList>
                            <Tab>Mission</Tab>
                            <Tab>Solution</Tab>
                        </TabList>
                        <TabPanel>
                            <div>
                                <h2>{`Mission: ${missions[0].id}`}</h2>
                                <p>{`creat at ${missions[0].created_date}`}</p>
                                <img src={`${missions[0].image_url}`} style={{ maxWidth: '550px' }} />
                            </div>
                        </TabPanel>
                        <TabPanel>
                            {this.generate_solution(missions[0])}
                        </TabPanel>
                    </Tabs>
                </div>
            } else {
                content = <div style={{ width: '600px', display: 'inline-block', verticalAlign: 'top' }}>
                    <h2>Mission: </h2>
                    <p>{`not found ${this.props.zf.mission}`}</p>
                </div>
            }
        }
        return content;
    }

    fetch_missions() {
        this.props.promise_get_missions_ing();
        this.props.promise_get_solution_done({});
        Axios.get('/api/zf/missions', {
            headers: {
                'x-token': this.props.auth.data.token,
                "Content-Type": "application/json"
            }
        }).then(response => {
            console.log(response);
            this.props.promise_get_missions_done(response.data);
            if (Array.isArray(response.data) && response.data.length > 0 && typeof response.data[0] !== 'undefined') {
                this.switchMission(response.data[0].id);
            } else {
                this.switchMission('');
            }
        }).catch(err => {
            console.log(err);
            this.props.promise_get_missions_err(err.data);
        })
    }

    submit_mission(cropped) {
        this.props.promise_add_mission_ing();
        if (typeof this.props.zf.new_mission !== 'undefined' && Array.isArray(this.props.zf.new_mission) && this.props.zf.new_mission.length > 0) {
            let imgForm = new FormData();
            imgForm.append('images', this.props.zf.new_mission[0]);
            if (!!cropped && Array.isArray(this.props.zf.crops)) {
                this.props.zf.crops.forEach(crop => {
                    let cord = {
                        x: crop.x,
                        y: crop.y,
                        width: crop.width,
                        height: crop.height
                    }
                    imgForm.append('cords[]', JSON.stringify(cord))
                })
            }
            Axios.post('/api/zf/mission', imgForm, {
                headers: {
                    "x-token": this.props.auth.data.token,
                    "Content-Type": "multipart/form-data"
                }
            }).then(response => {
                this.props.promise_add_mission_done(response.data);
                this.props.sync_zf_add_mission([]);
                this.set_crop(10, 10, 80, 80);
            }).then(err => {
                this.props.promise_add_mission_err(err.data);
                this.props.sync_zf_add_mission([]);
                this.set_crop(10, 10, 80, 80);
            })
        }
    }

    add_mission(files) {
        if (files.length > 1) {
            alert('only drop one image.');
        } else if (files.length === 0) {
            this.props.sync_zf_add_mission([]);
            this.set_crop(10, 10, 80, 80);
        } else {
            this.props.sync_zf_add_mission(files);
            this.set_crop(10, 10, 80, 80);
        }
    }

    set_crop(x, y, w, h) {
        this.props.sync_zf_update_crop({ x: x, y: y, width: w, height: h });
    }

    add_crop(crop) {
        this.props.sync_zf_add_crop(crop);
    }

    rm_crop(index) {
        this.props.sync_zf_rm_crop(index);
    }

    onCropComplete(crop) {

    }

    onCropChange(crop) {
        this.set_crop(crop.x, crop.y, crop.width, crop.height);
    }

    generate_new() {
        let content = <div>
            <p>New Page</p>
        </div>

        if (typeof this.props.zf !== 'undefined' && typeof this.props.zf.new_mission !== 'undefined' && typeof this.props.zf.crop !== 'undefined') {
            if (typeof this.props.zf.add_mission !== 'undefined') {
                if (this.props.zf.add_mission.status === 'ing') {
                    content = <div><p>Submitting.....</p></div>
                } else if (this.props.zf.add_mission.status === 'err') {
                    content = <div style={{ width: '900px' }}>
                        <div style={{ width: '280px', display: 'inline-block', verticalAlign: 'top' }}>
                            <div style={{ margin: '2px' }}>
                                <Dropzone
                                    multiple={false}
                                    accept="image/*"
                                    onDrop={this.add_mission}>
                                    <p>Drop an image or click to select a image to upload.</p>
                                </Dropzone>
                            </div>
                            <input type="button" value="Submit for full image"
                                style={{ height: '30px', width: '200px', margin: '2px', color: 'white', backgroundColor: '#5394fc', fontSize: '15px', cursor: 'pointer' }}
                                disabled={(typeof this.props.zf.new_mission !== 'undefined' && Array.isArray(this.props.zf.new_mission) && this.props.zf.new_mission.length > 0) ? false : true}
                                onClick={e => {
                                    e.preventDefault();
                                    this.submit_mission();
                                }} /><br />
                            <input type="button" value="Crop Image"
                                style={{ height: '30px', width: '200px', margin: '2px', color: 'white', backgroundColor: '#5394fc', fontSize: '15px', cursor: 'pointer' }}
                                onClick={e => {
                                    e.preventDefault();
                                    this.add_crop(this.props.zf.crop);
                                }} /><br />
                            <input type="button" value="Submit for cropped image"
                                style={{ height: '30px', width: '200px', margin: '2px', color: 'white', backgroundColor: '#5394fc', fontSize: '15px', cursor: 'pointer' }}
                                disabled={(typeof this.props.zf !== 'undefined' && typeof this.props.zf.new_mission !== 'undefined' && Array.isArray(this.props.zf.new_mission) && this.props.zf.new_mission.length > 0) ? false : true}
                                onClick={e => {
                                    e.preventDefault();
                                    this.submit_mission(true);
                                }} />
                            <div>
                                <p>{`Error: ${this.props.zf.add_mission.err}`}</p>
                            </div>
                        </div>
                        <div style={{ width: '600px', display: 'inline-block', verticalAlign: 'top' }}>
                            <Tabs>
                                <TabList>
                                    <Tab>Preview</Tab>
                                    <Tab>Cropped</Tab>
                                </TabList>
                                <TabPanel>
                                    <p>Preview:</p>
                                    {(Array.isArray(this.props.zf.new_mission) && this.props.zf.new_mission.length > 0) ? <div>
                                        <p>{this.props.zf.new_mission[0].name}</p>
                                        {/* <img src={this.props.zf.new_mission[0].preview} style={{ maxWidth: '550px' }} /> */}
                                        <ReactCrop
                                            src={this.props.zf.new_mission[0].preview}
                                            crop={this.props.zf.crop}
                                            // onImageLoaded={}
                                            onComplete={this.onCropComplete}
                                            onChange={this.onCropChange} />
                                    </div> : <div></div>}
                                </TabPanel>
                                <TabPanel>
                                    <p>Cropped</p>
                                    {(Array.isArray(this.props.zf.crops)) ? <div>
                                        {this.props.zf.crops.map((crop, index) => {
                                            return <div key={index}>
                                                <a onClick={e => {
                                                    e.preventDefault();
                                                    this.rm_crop(index);
                                                }}>delete</a>
                                                <p>{index + 1}: {JSON.stringify(crop)}</p>
                                            </div>
                                        })}
                                    </div> : <div></div>}
                                </TabPanel>
                            </Tabs>
                        </div>
                    </div>
                } else {
                    content = <div style={{ width: '900px' }}>
                        <div style={{ width: '280px', display: 'inline-block', verticalAlign: 'top' }}>
                            <div style={{ margin: '2px' }}>
                                <Dropzone
                                    multiple={false}
                                    accept="image/*"
                                    onDrop={this.add_mission}>
                                    <p>Drop an image or click to select a image to upload.</p>
                                </Dropzone>
                            </div>
                            <input type="button" value="Submit for full image"
                                style={{ height: '30px', width: '200px', margin: '2px', color: 'white', backgroundColor: '#5394fc', fontSize: '15px', cursor: 'pointer' }}
                                disabled={(typeof this.props.zf.new_mission !== 'undefined' && Array.isArray(this.props.zf.new_mission) && this.props.zf.new_mission.length > 0) ? false : true}
                                onClick={e => {
                                    e.preventDefault();
                                    this.submit_mission();
                                }} /><br />
                            <input type="button" value="Crop Image"
                                style={{ height: '30px', width: '200px', margin: '2px', color: 'white', backgroundColor: '#5394fc', fontSize: '15px', cursor: 'pointer' }}
                                onClick={e => {
                                    e.preventDefault();
                                    this.add_crop(this.props.zf.crop);
                                }} /><br />
                            <input type="button" value="Submit for cropped image"
                                style={{ height: '30px', width: '200px', margin: '2px', color: 'white', backgroundColor: '#5394fc', fontSize: '15px', cursor: 'pointer' }}
                                disabled={(typeof this.props.zf !== 'undefined' && typeof this.props.zf.new_mission !== 'undefined' && Array.isArray(this.props.zf.new_mission) && this.props.zf.new_mission.length > 0) ? false : true}
                                onClick={e => {
                                    e.preventDefault();
                                    this.submit_mission(true);
                                }} />
                        </div>
                        <div style={{ width: '600px', display: 'inline-block', verticalAlign: 'top' }}>
                            <Tabs>
                                <TabList>
                                    <Tab>Preview</Tab>
                                    <Tab>Cropped</Tab>
                                </TabList>
                                <TabPanel>
                                    <p>Preview:</p>
                                    {(Array.isArray(this.props.zf.new_mission) && this.props.zf.new_mission.length > 0) ? <div>
                                        <p>{this.props.zf.new_mission[0].name}</p>
                                        {/* <img src={this.props.zf.new_mission[0].preview} style={{ maxWidth: '550px' }} /> */}
                                        <ReactCrop
                                            src={this.props.zf.new_mission[0].preview}
                                            crop={this.props.zf.crop}
                                            // onImageLoaded={}
                                            onComplete={this.onCropComplete}
                                            onChange={this.onCropChange} />
                                    </div> : <div></div>}
                                </TabPanel>
                                <TabPanel>
                                    <p>Cropped</p>
                                    {(Array.isArray(this.props.zf.crops)) ? <div>
                                        {this.props.zf.crops.map((crop, index) => {
                                            return <div key={index}>
                                                <a onClick={e => {
                                                    e.preventDefault();
                                                    this.rm_crop(index);
                                                }}>delete</a>
                                                <p>{index + 1}: {JSON.stringify(crop)}</p>
                                            </div>
                                        })}
                                    </div> : <div></div>}
                                </TabPanel>
                            </Tabs>
                        </div>
                    </div>
                }
            } else {
                content = <div style={{ width: '900px' }}>
                    <div style={{ width: '280px', display: 'inline-block', verticalAlign: 'top' }}>
                        <div style={{ margin: '2px' }}>
                            <Dropzone
                                multiple={false}
                                accept="image/*"
                                onDrop={this.add_mission}>
                                <p>Drop an image or click to select a image to upload.</p>
                            </Dropzone>
                        </div>
                        <input type="button" value="Submit for full image"
                            style={{ height: '30px', width: '200px', margin: '2px', color: 'white', backgroundColor: '#5394fc', fontSize: '15px', cursor: 'pointer' }}
                            disabled={(typeof this.props.zf !== 'undefined' && typeof this.props.zf.new_mission !== 'undefined' && Array.isArray(this.props.zf.new_mission) && this.props.zf.new_mission.length > 0) ? false : true}
                            onClick={e => {
                                e.preventDefault();
                                this.submit_mission();
                            }} /><br />
                        <input type="button" value="Crop Image"
                            style={{ height: '30px', width: '200px', margin: '2px', color: 'white', backgroundColor: '#5394fc', fontSize: '15px', cursor: 'pointer' }}
                            onClick={e => {
                                e.preventDefault();
                                this.add_crop(this.props.zf.crop);
                            }} /><br />
                        <input type="button" value="Submit for cropped image"
                            style={{ height: '30px', width: '200px', margin: '2px', color: 'white', backgroundColor: '#5394fc', fontSize: '15px', cursor: 'pointer' }}
                            disabled={(typeof this.props.zf !== 'undefined' && typeof this.props.zf.new_mission !== 'undefined' && Array.isArray(this.props.zf.new_mission) && this.props.zf.new_mission.length > 0) ? false : true}
                            onClick={e => {
                                e.preventDefault();
                                this.submit_mission(true);
                            }} />
                    </div>
                    <div style={{ width: '600px', display: 'inline-block', verticalAlign: 'top' }}>
                        <Tabs>
                            <TabList>
                                <Tab>Preview</Tab>
                                <Tab>Cropped</Tab>
                            </TabList>
                            <TabPanel>
                                <p>Preview:</p>
                                {(Array.isArray(this.props.zf.new_mission) && this.props.zf.new_mission.length > 0) ? <div>
                                    <p>{this.props.zf.new_mission[0].name}</p>
                                    {/* <img src={this.props.zf.new_mission[0].preview} style={{ maxWidth: '550px' }} /> */}
                                    <ReactCrop
                                        src={this.props.zf.new_mission[0].preview}
                                        crop={this.props.zf.crop}
                                        // onImageLoaded={}
                                        onComplete={this.onCropComplete}
                                        onChange={this.onCropChange} />
                                </div> : <div></div>}
                            </TabPanel>
                            <TabPanel>
                                <p>Cropped</p>
                                {(Array.isArray(this.props.zf.crops)) ? <div>
                                    {this.props.zf.crops.map((crop, index) => {
                                        return <div key={index}>
                                            <a onClick={e => {
                                                e.preventDefault();
                                                this.rm_crop(index);
                                            }}>delete</a>
                                            <p>{index + 1}: {JSON.stringify(crop)}</p>
                                        </div>
                                    })}
                                </div> : <div></div>}
                            </TabPanel>
                        </Tabs>
                    </div>
                </div>
            }
        }

        return content;
    }

    fetch_solution() {
        if (typeof this.props.zf !== 'undefined' && !!this.props.zf.mission) {
            this.props.promise_get_solution_ing();
            Axios.get(`/api/zf/mission/${this.props.zf.mission}/solutions`, {
                headers: {
                    "x-token": this.props.auth.data.token,
                    "Content-Type": "application/json"
                }
            }).then(response => {
                this.props.promise_get_solution_done(response.data);
            }).catch(err => {
                this.props.promise_get_solution_err(err);
            })
        }
    }

    generate_solution(mission) {
        console.log('generate solution');
        let content = <div><p>Solution Section</p></div>
        if (!mission.check) {
            content = <div>
                <p>Solution: Coming soon....</p>
            </div>
        } else {
            if (typeof this.props.zf !== 'undefined' && typeof this.props.zf.solution !== 'undefined' && typeof this.props.zf.solution.data !== 'undefined') {
                content = <div style={{ width: '600px' }}>
                    <p>Solution: </p>
                    <input type="button" value="Get Solution" style={{ height: '30px', width: '120px', margin: '2px', color: 'white', backgroundColor: '#5394fc', fontSize: '15px', cursor: 'pointer' }}
                        onClick={e => {
                            e.preventDefault();
                            this.fetch_solution()
                        }} />
                    {(Array.isArray(this.props.zf.solution.data)) ? <div>
                        <Tabs>
                            <TabList>
                                {this.props.zf.solution.data.map((solution, index) => {
                                    return <Tab key={index}>{index + 1}</Tab>;
                                })}
                            </TabList>
                            {this.props.zf.solution.data.map((solution, index) => {
                                return <TabPanel key={index}>
                                    <p>{`Solution id: ${solution.id}`}</p>
                                    <p>{`created at ${solution.created_date}`}</p>
                                    <Tabs>
                                        <TabList>
                                            <Tab>Image</Tab>
                                            <Tab>List</Tab>
                                        </TabList>
                                        <TabPanel>
                                            <div>
                                                <p>Image: </p>
                                                <img src={solution.image} style={{ maxWidth: '550px' }} />
                                            </div>
                                        </TabPanel>
                                        <TabPanel>
                                            <div>
                                                <table>
                                                    <thead>
                                                        <tr>
                                                            <td>Index</td>
                                                            <td style={{ width: '300px' }}>Value</td>
                                                            {/* <td style={{ width: '200px' }}>Image</td> */}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {solution.solution.map((sol, index) => {
                                                            return <tr key={index}>
                                                                <td><p>{sol.index}</p></td>
                                                                <td style={{ width: '300px' }}><p>{sol.value}</p></td>
                                                                {/* <td>{(!!sol.image_url) ? <img src={sol.image_url} style={{ maxWidth: '200px' }} /> : <p></p>}</td> */}
                                                            </tr>
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </TabPanel>
                                    </Tabs>
                                </TabPanel>
                            })}
                        </Tabs></div> : <div></div>}
                </div>
            } else {
                content = <div>
                    <p>Solution: </p>
                    <input type="button" value="Get Solution" style={{ height: '30px', width: '120px', margin: '2px', color: 'white', backgroundColor: '#5394fc', fontSize: '15px', cursor: 'pointer' }}
                        onClick={e => {
                            e.preventDefault();
                            this.fetch_solution();
                        }} />
                </div>
            }
        }
        return content;
    }

    render() {
        return (
            <div>
                {this.generate_options()}
                {this.generate_tab()}
            </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ZFPage);