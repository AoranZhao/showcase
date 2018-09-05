"use strict";

import React from 'react';
import { connect } from 'react-redux';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import './ZFAdmin.scss';

import { zfadmin_change_solution, zfadmin_switch_mission, zfadmin_get_missions_ing, zfadmin_get_missions_done, zfadmin_get_missions_err, zfadmin_get_solution_ing, zfadmin_get_solution_done, zfadmin_get_solution_err, zfadmin_update_mission_ing, zfadmin_update_mission_done, zfadmin_update_mission_err } from '../actions';
import { Axios } from '../utils';

const mapStateToProps = state => {
    return { auth: state.auth, zfadmin: state.zfadmin };
}

const mapDispatchToProps = dispatch => ({
    sync_change_solution: (sid, index, value) => {
        dispatch(zfadmin_change_solution(sid, index, value));
    },
    sync_switch_mission: (mission_id) => {
        dispatch(zfadmin_switch_mission(mission_id));
    },
    promise_get_missions_ing: () => {
        dispatch(zfadmin_get_missions_ing());
    },
    promise_get_missions_done: (data) => {
        dispatch(zfadmin_get_missions_done(data));
    },
    promise_get_missions_err: (err) => {
        dispatch(zfadmin_get_missions_err(err));
    },
    promise_get_solution_ing: () => {
        dispatch(zfadmin_get_solution_ing());
    },
    promise_get_solution_done: (data) => {
        dispatch(zfadmin_get_solution_done(data));
    },
    promise_get_solution_err: (err) => {
        dispatch(zfadmin_get_solution_err(err));
    },
    promise_update_mission_ing: () => {
        dispatch(zfadmin_update_mission_ing());
    },
    promise_update_mission_done: (data) => {
        dispatch(zfadmin_update_mission_done(data));
    },
    promise_update_mission_err: (err) => {
        dispatch(zfadmin_update_mission_err(err));
    }
})

class ZFAdminPage extends React.Component {
    constructor(props) {
        super(props);
        this.fetchSolution = this.fetchSolution.bind(this);
        this.switchMission = this.switchMission.bind(this);
        this.fetchMissions = this.fetchMissions.bind(this);
        this.updateMission = this.updateMission.bind(this);
        this.updateSolution = this.updateSolution.bind(this);

        this.generateContent = this.generateContent.bind(this);
        this.generateSidebar = this.generateSidebar.bind(this);
        this.generateContent = this.generateContent.bind(this);
        this.generateCtrl = this.generateCtrl.bind(this);
        this.generateSolution = this.generateSolution.bind(this);
    }

    componentWillMount() {
        this.fetchMissions();
    }

    fetchMissions(keepM) {
        this.props.promise_get_missions_ing();
        Axios.get('/api/zf/missions?admin=yes', {
            headers: {
                "x-token": this.props.auth.data.token,
                "Content-Type": "application/json"
            }
        }).then(response => {
            console.log(response);
            this.props.promise_get_missions_done(response.data);
            if (Array.isArray(response.data) && response.data.length > 0 && typeof response.data[0] !== 'undefined') {
                if (!keepM || !this.props.zfadmin.mission || response.data.map(d => (d.id)).indexOf(this.props.zfadmin.mission) === -1) {
                    this.switchMission(response.data[0].id);
                    this.props.promise_get_solution_done({});
                }
            } else {
                this.switchMission('');
            }
        }).catch(err => {
            console.log(err);
            this.props.promise_get_missions_err(err.data);
        })
    }

    switchMission(mission_id) {
        this.props.sync_switch_mission(mission_id);
        if (!!mission_id) {
            this.fetchSolution(mission_id);
        } else {
            this.props.promise_get_solution_done({});
        }
    }

    fetchSolution(mission_id) {
        this.props.promise_get_solution_ing();
        Axios.get(`/api/zf/mission/${mission_id}/solutions`, {
            headers: {
                "x-token": this.props.auth.data.token,
                "Content-Type": "application/json"
            }
        }).then(response => {
            this.props.promise_get_solution_done(response.data);
        }).catch(err => {
            this.props.promise_get_solution_err(err.data);
        })
    }

    generateContent() {
        let content = <div style={{ width: '600px', display: 'inline-block', verticalAlign: 'top' }}>
            <p>Content Page</p>
            <p>Select a mission</p>
        </div>;
        if (typeof this.props.zfadmin !== 'undefined' && typeof this.props.zfadmin.missions !== 'undefined' && Array.isArray(this.props.zfadmin.missions.data) && !!this.props.zfadmin.mission) {
            let missions = this.props.zfadmin.missions.data.filter((mission) => ((mission.id === this.props.zfadmin.mission) ? true : false));
            if (Array.isArray(missions) && missions.length > 0) {
                let mission = missions[0];
                content = <div style={{ width: '600px', display: 'inline-block', verticalAlign: 'top' }}>
                    {this.generateCtrl(mission)}
                    {this.generateSolution(mission)}
                </div>
            } else {
                content = <div style={{ width: '600px', display: 'inline-block', verticalAlign: 'top' }}>
                    <p>Content Page</p>
                    <p>Not found mission {this.props.zfadmin.mission}, please select another one.</p>
                </div>;
            }
        }
        return content;
    }

    generateCtrl(mission) {
        let content = <div><p>Ctrl</p></div>;
        if (typeof this.props.zfadmin !== 'undefined') {
            if (typeof this.props.zfadmin.update_mission !== 'undefined' && this.props.zfadmin.update_mission.status === 'ing') {
                content = <div><p>Saving...</p></div>
            } else if (typeof this.props.zfadmin.update_mission !== 'undefined' && this.props.zfadmin.update_mission.status === 'err') {
                content = <div>
                    <input type="button" value={(mission.check) ? 'Unmark it' : 'Mark it'} style={{ height: '50px', width: '100px', margin: '10px', color: 'white', backgroundColor: '#5394fc', fontSize: '20px', cursor: 'pointer' }} onClick={e => {
                        e.preventDefault();
                        this.updateMission(mission.id, (mission.check) ? false : true);
                    }} />
                    <p>Error: {this.props.zfadmin.update_mission.err}</p>
                </div>
            } else {
                // let sid, solution;
                // if (typeof this.props.zfadmin.solution !== 'undefined' && typeof this.props.zfadmin.solution.data !== 'undefined') {
                //     sid = this.props.zfadmin.solution.data.id;
                //     solution = this.props.zfadmin.solution.data.solution;
                // }
                content = <div>
                    <input type="button" value={(mission.check) ? 'Unmark it' : 'Mark it'} style={{ height: '50px', width: '100px', margin: '10px', color: 'white', backgroundColor: '#5394fc', fontSize: '20px', cursor: 'pointer' }} onClick={e => {
                        e.preventDefault();
                        this.updateMission(mission.id, (mission.check) ? false : true);
                    }} />
                    {/* <input type="button" value="Save" style={{ height: '50px', width: '100px', margin: '10px', color: 'white', backgroundColor: '#5394fc', fontSize: '20px', cursor: 'pointer' }} onClick={e => {
                        e.preventDefault();
                        this.updateSolution(sid, solution);
                    }} /> */}
                </div>
            }
        }
        return content;
    }

    generateSidebar() {
        let content = <div style={{ verticalAlign: 'top' }}><p>Sidebar</p></div>;
        if (typeof this.props.zfadmin !== 'undefined' && typeof this.props.zfadmin.missions !== 'undefined' && Array.isArray(this.props.zfadmin.missions.data)) {
            content = <div style={{ width: '280px', display: 'inline-block', verticalAlign: 'top' }}>
                <div>
                    <a style={{ cursor: 'pointer', width: '250px', display: 'inline-block', margin: '2px', border: '1px solid #AAAAAA' }} onClick={e => {
                        e.preventDefault();
                        this.fetchMissions();
                    }}>
                        <p>Refresh</p>
                    </a>
                </div>
                <div>
                    {this.props.zfadmin.missions.data.map((mission, index) => {
                        return <div key={index}>
                            <a style={{ cursor: 'pointer', width: '250px', display: 'inline-block', margin: '2px', border: (!!mission.check) ? '1px solid green' : '1px solid red', borderRightWidth: (!!this.props.zfadmin.mission && this.props.zfadmin.mission === mission.id) ? '10px' : '1px' }} onClick={e => {
                                e.preventDefault();
                                this.switchMission(mission.id);
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
                    <a style={{ cursor: 'pointer', width: '250px', display: 'inline-block', margin: '2px', border: '1px solid #AAAAAA' }} onClick={e => {
                        e.preventDefault();
                        this.fetchMissions();
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

    generateSolution(mission) {
        let mission_id = mission.id;
        let content = <div><p>Solution for {mission_id}</p></div>
        if (typeof this.props.zfadmin !== 'undefined' && typeof this.props.zfadmin.solution !== 'undefined') {
            if (this.props.zfadmin.solution.status === 'ing') {
                content = <Tabs>
                    <TabList>
                        <Tab>Solution</Tab>
                        <Tab>Mission</Tab>
                    </TabList>
                    <TabPanel>
                        <div>
                            <h2>Solution:</h2>
                            <p>fetching solution for {mission_id}</p>
                        </div>
                    </TabPanel>
                    <TabPanel>
                        <div>
                            <h2>Mission: {mission.id}</h2>
                            <p>User: {mission.account}</p>
                            <p>created at {mission.created_date}</p>
                            <img src={mission.image_url} style={{ maxWidth: '600px' }} />
                        </div>
                    </TabPanel>
                </Tabs>
            } else if (this.props.zfadmin.solution.status === 'err') {
                content = <Tabs>
                    <TabList>
                        <Tab>Solution</Tab>
                        <Tab>Mission</Tab>
                    </TabList>
                    <TabPanel>
                        <div>
                            <h2>Solution:</h2>
                            <p>Error: {this.props.zfadmin.solution.err}</p>
                            <input type="button" value="retry" style={{ height: '50px', width: '100px', margin: '10px', color: 'white', backgroundColor: '#5394fc', fontSize: '20px', cursor: 'pointer' }} onClick={e => {
                                e.preventDefault();
                                this.fetchSolution(mission_id);
                            }} />
                        </div>
                    </TabPanel>
                    <TabPanel>
                        <div>
                            <h2>Mission: {mission.id}</h2>
                            <p>User: {mission.account}</p>
                            <p>created at {mission.created_date}</p>
                            <img src={mission.image_url} style={{ maxWidth: '600px' }} />
                        </div>
                    </TabPanel>
                </Tabs>
            } else if (this.props.zfadmin.solution.status === 'done' && !!this.props.zfadmin.solution.data) {
                let temp_solutions = [];
                if (Array.isArray(this.props.zfadmin.solution.data)) {
                    this.props.zfadmin.solution.data.forEach(solut => {
                        let temp_solution = solut.solution;
                        if (!Array.isArray(temp_solution) || temp_solution.length === 0) {
                            temp_solution = [];
                            for (var i = 0; i <= 52; i++) {
                                temp_solution.push({
                                    index: i,
                                    value: ''
                                });
                            }
                        }
                        temp_solutions.push(temp_solution);
                    })
                }

                content = Array.isArray(this.props.zfadmin.solution.data) ?
                    <Tabs>
                        <TabList>
                            {this.props.zfadmin.solution.data.map((sol, index) => {
                                return <Tab key={index}>{index + 1}</Tab>
                            })}
                        </TabList>
                        {this.props.zfadmin.solution.data.map((solut, ind) => {
                            return <TabPanel key={ind}>
                                <Tabs>
                                    <TabList>
                                        <Tab>Image</Tab>
                                        <Tab>List</Tab>
                                        <Tab>Log</Tab>
                                        <Tab>Mission</Tab>
                                    </TabList>
                                    <TabPanel>
                                        <div>
                                            <p>Image:</p>
                                            <img src={solut.image} style={{ maxWidth: '600px' }} />
                                        </div>
                                    </TabPanel>
                                    <TabPanel>
                                        <p>Detail:</p>
                                        <input type="button" value="Save" style={{ height: '50px', width: '100px', margin: '10px', color: 'white', backgroundColor: '#5394fc', fontSize: '20px', cursor: 'pointer' }} onClick={e => {
                                            e.preventDefault();
                                            this.updateSolution(solut.id, solut.solution);
                                        }} />
                                        <table>
                                            <thead>
                                                <tr>
                                                    <td><p>Index</p></td>
                                                    <td><p>Value</p></td>
                                                    <td><p>Image</p></td>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {temp_solutions[ind].map((sol, index) => {
                                                    return <tr key={index}>
                                                        <td><p>{sol.index}</p></td>
                                                        <td><textarea value={sol.value} rows="3" style={{ width: '250px', resize: 'none' }} onChange={e => {
                                                            e.preventDefault();
                                                            this.props.sync_change_solution(ind, sol.index, e.target.value);
                                                        }}>
                                                        </textarea>
                                                        </td>
                                                        <td>{(!!sol.image_url) ? <img src={sol.image_url} style={{ maxWidth: '300px' }} /> : <p></p>}</td>
                                                    </tr>
                                                })}
                                            </tbody>
                                        </table>
                                    </TabPanel>
                                    <TabPanel>
                                        <p>Log:</p>
                                        <p>Code: {(typeof solut.log !== 'undefined') ? solut.log.code : 'none'}</p>
                                        <br />
                                        <p>Output:</p>
                                        <pre>{(typeof solut.log !== 'undefined') ? solut.log.stdout : ''}</pre>
                                        <br />
                                        <p>Err:</p>
                                        <pre>{(typeof solut.log !== 'undefined') ? solut.log.stderr : ''}</pre>
                                    </TabPanel>
                                    <TabPanel>
                                        <div>
                                            <h2>Mission: {mission.id}</h2>
                                            <p>User: {mission.account}</p>
                                            <p>created at {mission.created_date}</p>
                                            <img src={mission.image_url} style={{ maxWidth: '600px' }} />
                                        </div>
                                    </TabPanel>
                                </Tabs>
                            </TabPanel>
                        })}
                    </Tabs> : <div>
                        <p>Err: solution is not array.</p>
                    </div>;
            } else {
                content = <div>
                    <p>Solution for {mission_id}</p>
                    <p>Some Err on fetching result, please contact with us.</p>
                </div>
            }
        }
        return content;
    }

    updateMission(mid, check) {
        this.props.promise_update_mission_ing();
        Axios.put(`/api/zf/mission/${mid}?admin=yes`, { check: (check === true) ? true : false }, {
            headers: {
                "x-token": this.props.auth.data.token,
                "Content-Type": "application/json"
            }
        }).then(response => {
            this.props.promise_update_mission_done(response.data);
            this.fetchMissions(true);
            // }
        }).catch(err => {
            console.log(err);
            this.props.promise_update_mission_err(err.data);
        })
    }

    updateSolution(sid, solution) {
        console.log(`sid: ${sid}, solution: ${solution}`);
        if (typeof sid !== 'undefined' && typeof solution !== 'undefined') {
            if (Array.isArray(solution) && solution.length > 0) {
                this.props.promise_update_mission_ing();
                Axios.put(`/api/zf/solution/${sid}`, { solution: solution }, {
                    headers: {
                        "x-token": this.props.auth.data.token,
                        "Content-Type": "application/json"
                    }
                }).then(response => {
                    this.props.promise_update_mission_done(response.data);
                    this.fetchMissions(true);
                }).catch(err => {
                    this.props.promise_update_mission_err(err.data);
                })
            } else {
                alert('wrong solution format.');
            }
        } else {
            alert('not found sid and solution');
        }
    }

    render() {
        return <div style={{ width: '900px' }}>
            {this.generateSidebar()}
            {this.generateContent()}
        </div>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ZFAdminPage);