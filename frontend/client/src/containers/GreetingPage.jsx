'use strict';

import React from 'react';
import { connect } from 'react-redux';

const mapStateToProps = state => {
    return { auth: state.auth };
}

const mapDispatchToProps = dispatch => ({

})

class GreetingPage extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <div>
            <h2>Welcome, {(!!this.props.auth && !!this.props.auth.data && !!this.props.auth.data.email) ? this.props.auth.data.email : 'Guest'}</h2>
        </div>
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(GreetingPage)