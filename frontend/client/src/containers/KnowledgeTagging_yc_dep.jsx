'use strict';

import React from 'react';
import { connect } from 'react-redux';
// import k from 'knowledge_tagging_visualization';
import * as d3 from 'd3';
import { Tree } from 'react-d3-tree';

import { kt_yc_upload_question_ing, kt_yc_upload_question_done, kt_yc_upload_question_err } from '../actions';
import { Axios } from '../utils';

const mapStateToProps = state => {
    return { auth: state.auth, ktyc: state.ktyc };
}

const mapDispatchToProps = dispatch => ({
    promise_upload_question_ing: (question) => {
        dispatch(kt_yc_upload_question_ing(question));
    },
    promise_upload_question_done: (data) => {
        dispatch(kt_yc_upload_question_done(data));
    },
    promise_upload_question_err: (err) => {
        dispatch(kt_yc_upload_question_err(err));
    }
})

class KTYCPage extends React.Component {
    constructor(props) {
        super(props);
        this.generate_question_preview = this.generate_question_preview.bind(this);
        this.generate_question_input = this.generate_question_input.bind(this);
        this.generate_question_image = this.generate_question_image.bind(this);
        this.upload_question = this.upload_question.bind(this);
        this.output_convert = this.output_convert.bind(this);

        this.generate_node = this.generate_node.bind(this);
        this.check_node = this.check_node.bind(this);
        this.generate_children = this.generate_children.bind(this);

        this.handleResponse = this.handleResponse.bind(this);
        this.handleOutput = this.handleOutput.bind(this);
    }

    generate_question_preview() {
        return <div>
            <pre style={{ width: '800px', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{this.props.ktyc.question}</pre>
            {(this.props.ktyc.err) ? <pre style={{ color: 'red' }}>{this.props.ktyc.err}</pre> : <pre></pre>}
        </div>
    }

    generate_question_input() {
        let ref_question;
        return <div>
            <form
                onSubmit={e => {
                    e.preventDefault();
                    if (!ref_question.value.trim())
                        return;
                    this.upload_question(ref_question.value.trim());
                }}>
                <textarea style={{ height: '100px', width: '700px' }} ref={node => ref_question = node}></textarea><br />
                <input type="submit" value="Upload" />
            </form>
        </div>
    }

    generate_question_image() {
        let el = <div></div>;
        if (typeof this.props.ktyc.output === 'object') {
            el = <div style={{ height: '600px', width: '800px' }}><Tree translate={{ x: 100, y: 250 }} data={this.output_convert(this.props.ktyc.output)} orientation='vertical' /></div>
        }
        return <div>
            {/* <p>{JSON.stringify(this.props.ktyc.output)}</p> */}
            {el}
        </div>
    }

    output_convert(output) {
        var result = [];
        output.forEach(n => {
            if (Array.isArray(n) && n.length > 0) {
                if (result.length === 0 || result.map(n => n.Concept).indexOf(n[0].Concept) === -1) {
                    result.push(this.generate_node(n[0]));
                }
            }
        })
        var temp_obj = this.check_node(output);
        Object.keys(temp_obj).forEach(key => {
            for (var i = 0; i < result.length; i++) {
                result[i] = this.generate_children(result[i], key, temp_obj[key]);
            }
        })
        return result;
    }

    generate_node(node) {
        return {
            name: node.Concept,
            attributes: {
                Confidence: node.Confidence,
                // Prediction: node.Prediction,
                Level: node.Level
            }
        }
    }

    check_node(output) {
        var result = {};
        output.forEach(nodes => {
            nodes.slice(1).forEach(node => {
                if (Object.keys(result).indexOf(node.Parent) !== -1 && Array.isArray(result[node.Parent])) {
                    if (result[node.Parent].map(n => n.name).indexOf(node.Concept) === -1)
                        result[node.Parent].push(this.generate_node(node));
                } else {
                    result[node.Parent] = [];
                    result[node.Parent].push(this.generate_node(node));
                }
            })
        })
        // output.forEach(node => {
        //     if (Object.keys(result).indexOf(node.Parent) !== -1 && Array.isArray(result[node.Parent])) {
        //         if (result[node.Parent].map(n => n.name).indexOf(node.Concept) === -1)
        //             result[node.Parent].push(this.generate_node(node));
        //     } else {
        //         result[node.Parent] = [];
        //         result[node.Parent].push(this.generate_node(node));
        //     }
        // })
        return result;
    }

    generate_children(node, key, children) {
        if (node.name === key) {
            node.children = children;
        }
        if (Array.isArray(node.children)) {
            var temp_children = [];
            node.children.forEach(child => {
                temp_children.push(this.generate_children(child, key, children))
            })
            node.children = temp_children;
        }
        return node;
    }

    upload_question(question) {
        this.props.promise_upload_question_ing(question);
        Axios.post('/api/kt/yichen', { questions: question }, {
            headers: {
                "x-token": this.props.auth.data.token,
                "Content-Type": "application/json"
            }
        }).then(response => {
            console.log(response.data);
            if (response.data.err) {
                this.props.promise_upload_question_err(response.data.err);
            } else {
                this.props.promise_upload_question_done(this.handleResponse(response.data));
            }
        }).catch(err => {
            console.log(err);
            this.props.promise_upload_question_err(err);
        })
    }

    handleResponse(data) {
        if (Array.isArray(data.output)) {
            data.output = this.handleOutput(data.output);
        }
        data.output = [data.output];
        return data;
    }

    handleOutput(output) {
        let result = [];
        let temp_map = output.reduce((obj, value) => {
            obj[value.Level] = value.Concept;
            return obj;
        }, {});
        let defaultParent = 'This is a dummy root that connects all forest roots';
        output.forEach(o => {
            if (Array.isArray(o)) {
                result.push(this.handleOutput(o));
            } else {
                if (o.Level === 1) {
                    o.Parent = defaultParent;
                } else {
                    o.Parent = temp_map[--o.Level];
                }
                result.push(o);
            }
        })
        return result;
    }

    render() {
        var question_preview = this.generate_question_preview(),
            question_input = this.generate_question_input(),
            question_image = this.generate_question_image();
        return <div style={{ marginLeft: '20px' }}>
            <p>Upload Question</p>
            {question_preview}
            {question_input}
            {question_image}
        </div>
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(KTYCPage);