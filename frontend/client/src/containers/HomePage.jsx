'use strict';

import React from 'react';
import { Route } from 'react-router-dom';
import { connect } from 'react-redux';

import SideBar from '../components/SideBar.jsx';
import GreetingPage from './GreetingPage.jsx';
import UserPage from './UserPage.jsx';
import AdminPage from './AdminPage.jsx';
import NninPage from './NninPage.jsx';
import FormulaOCRPage from './FormulaOCRPage.jsx';
import AutosolvePage from './AutosolvePage.jsx';
import KTJXPage from './KnowledgeTagging_jx.jsx';
import KTYCPage from './KnowledgeTagging_yc.jsx';
import VideoPage from './VideoPage.jsx';
import ZFPage from './ZF.jsx';
import ZFAdminPage from './ZFAdmin.jsx';

const mapStateToProps = state => {
    var obj = {};
    obj.entries = (typeof state.auth.data === 'undefined' || state.auth.data.type !== 'admin') ? [] : [{ text: 'ZFAdmin', url: '/zfadmin' }, { text: 'Admin', url: '/admin' }];
    return obj;
}

let HomePage = ({
    match,
    entries
}) => {
    return <div style={{ width: '100%' }}>
        <SideBar entries={entries} base={match.url} />
        <Route exact path={`${match.url}`} component={GreetingPage} />
        <Route path={`${match.url}/formulaocr`} component={FormulaOCRPage} />
        <Route path={`${match.url}/nnin`} component={NninPage} />
        <Route path={`${match.url}/admin`} component={AdminPage} />
        <Route path={`${match.url}/autosolve`} component={AutosolvePage} />
        <Route path={`${match.url}/ktjx`} component={KTJXPage} />
        <Route path={`${match.url}/ktyc`} component={KTYCPage} />
        <Route path={`${match.url}/video`} component={VideoPage} />
        <Route path={`${match.url}/zf`} component={ZFPage} />
        <Route path={`${match.url}/zfadmin`} component={ZFAdminPage} />
    </div>
}

HomePage = connect(mapStateToProps)(HomePage);

export default HomePage;