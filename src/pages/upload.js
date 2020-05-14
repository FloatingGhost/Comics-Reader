import React from "react";
import Layout from "../components/Layout";
import withIndexReady from "../hoc/withIndexReady";
import withAuth, { useAuth } from "../hoc/withAuth";
import Uppy from "@uppy/core";
import XHRUpload from "@uppy/xhr-upload";
import { DragDrop } from '@uppy/react';
import { Dashboard } from '@uppy/react'
import Tus from '@uppy/tus';
import Form from "@uppy/form";

class UploadForm extends React.Component {
    state = { workName: '' } 

    constructor(...args) {
        super(...args)

    }

    componentDidMount() {
        this.uppy = Uppy({})
            .use(Form, {target: this.form})
            .use(Tus, { endpoint: `/upload-file`, withCredentials: true, chunkSize:  10 * 1024 });
        this.uppy.on('upload', () => {
            console.log(this.state);
            if (this.state.workName.length < 3) {
                alert('Please give a comic name!');
                throw "No"
            }
        });
        this.setState({loaded: true});
    }

    render() {
        return (
        <Layout>
            <form id='metaform' ref={(ref) => this.form = ref}>
                <label htmlFor='workName'>Comic Name:</label>
                <input name='workName' value={this.state.workName}
                    onChange={(e) => this.setState({workName: e.target.value})}
                    required
                />
            </form>            
            { this.uppy && 
            <Dashboard
                uppy={this.uppy}
                theme='dark'
                proudlyDisplayPoweredByUppy={false}
                locale={{
                  strings: {
                    dropHereOr: 'Drop here or %{browse}',
                    browse: 'browse'
                  }
                }}
          />}
        </Layout>);
    }
}

export default withAuth(withIndexReady(UploadForm));
