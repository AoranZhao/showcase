'use strict';

import React from 'react';
import TabEntry from './TabEntry.jsx';
import LogoutButton from '../containers/LogoutButton.jsx';

import './SideBar.scss'

let SideBar = ({
    entries,
    base
}) => (
        <div className="sidebar">
            <div className="sidebar_item">
                <TabEntry text="Home" to="/" />
            </div>
            {/* <div className="sidebar_item">
                <TabEntry text="FormulaOCR" to="/home/formulaocr" />
            </div>
            <div className="sidebar_item">
                <TabEntry text="Nnin" to="/home/nnin" />
            </div>
            <div className="sidebar_item">
                <TabEntry text="Autosolve" to="/home/autosolve" />
            </div>
            <div className="sidebar_item">
                <TabEntry text="KT(Jixin)" to="/home/ktjx" />
            </div>
            <div className="sidebar_item">
                <TabEntry text="KT(Yichen)" to="/home/ktyc" />
            </div> */}
            <div className="sidebar_item">
                <TabEntry text="ZF" to="/home/zf" />
            </div>
            {/* <div className="sidebar_item">
                <TabEntry text="Video" to="/home/video" />
            </div> */}
            {entries.map((entry, index) => (
                <div key={index} className="sidebar_item">
                    <TabEntry text={entry.text} to={`${base}${entry.url}`} />
                </div>
            ))}
            <div className="frame_logout_btn">
                <LogoutButton />
            </div>
        </div>
    )

export default SideBar;
