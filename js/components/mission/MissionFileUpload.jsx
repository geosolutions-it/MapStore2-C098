/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import {Grid, Row} from 'react-bootstrap';
import {isString, includes} from 'lodash';
import Dropzone from 'react-dropzone';
import {Promise} from 'es6-promise';
import JSZip from 'jszip';

import Message from '@mapstore/components/I18N/Message';
import FileUtils from '@mapstore/utils/FileUtils';

class FileUpload extends React.Component {
    static propTypes = {
        readFiles: PropTypes.func,
        onDropError: PropTypes.func,
        onDropSuccess: PropTypes.func,
        onDropFiles: PropTypes.func,
        onFileLoading: PropTypes.func,
        error: PropTypes.string,
        success: PropTypes.string,
        buttonSize: PropTypes.string,
        uploadMessage: PropTypes.string,
        errorMessage: PropTypes.string,
        cancelMessage: PropTypes.string,
        showErrorMessage: PropTypes.bool,
        showSuccessMessage: PropTypes.bool
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        onDropError: () => {},
        onDropFiles: () => {},
        onDropSuccess: () => {},
        onFileLoading: () => {},
        readFiles: (files, onWarnings, supportedFormats = ['application/x-zip-compressed', 'application/zip']) => files.map((file) => {
            const ext = FileUtils.recognizeExt(file.name);
            const type = file.type || FileUtils.MIME_LOOKUPS[ext];
            if (includes(supportedFormats, type)) {
                return FileUtils.readZip(file)
                    .then((buffer) => {
                        const zip = new JSZip();
                        return zip.loadAsync(buffer);
                    });
            }
            return FileUtils.readZip(file)
                .then((buffer) => {
                    const zip = new JSZip();
                    return zip.loadAsync(buffer);
                });
        }),
        uploadMessage: "shapefile.placeholderMissionFiles",
        cancelMessage: "shapefile.cancel",
        errorMessage: "sciadro.missions.files.invalid",
        showSuccessMessage: false,
        showErrorMessage: false,
        success: "sciadro.missions.files.valid",
        buttonSize: "small"
    };

    renderError = () => {
        return (<Row>
                   <div style={{textAlign: "center"}} className="alert alert-danger"><Message msgId={this.props.errorMessage}/></div>
                </Row>);
    };

    renderSuccess = () => {
        return (<Row>
                   <div style={{textAlign: "center", overflowWrap: "break-word"}} className="alert alert-success"><Message msgId={this.props.success}/></div>
                </Row>);
    };

    render() {
        return (
            <Grid role="body" style={{width: "300px"}} fluid>
                {this.props.showErrorMessage ? this.renderError() : null}
                {this.props.showSuccessMessage ? this.renderSuccess() : null}
                <Row style={{textAlign: "center"}}>
                    <Dropzone rejectClassName="alert-danger" className="alert alert-info" onDrop={this.addFile}>
                        <div className="dropzone-content" style={{textAlign: "center"}}>
                            <Message msgId={this.props.uploadMessage}/>
                        </div>
                    </Dropzone>
                </Row>
            </Grid>
        );
    }

    checkMandatoryFiles = (zipFiles, mandatoryFiles = [".avi", ".telem", ".xml"]) => {
        const isValidFormat = (fileName) => mandatoryFiles.reduce((p, c) => {
            return p || fileName.indexOf(c) !== -1;
        }, false);

        return zipFiles.reduce((p, zipFile) => {
            return p && Object.keys(zipFile.files).reduce((pre, cur) => {
                return isValidFormat(cur);
            }, true);
        }, true);
    }
    addFile = (files) => {
        this.props.onFileLoading(true);
        let queue = this.props.readFiles(files, this.props.onDropError);
        Promise.all(queue).then((filesDropped) => {

            // CHECK PRESENCE OF THREE FORMATS, .AVI .XML .TELEM
            if (this.checkMandatoryFiles(filesDropped) && filesDropped.length === 1 && Object.keys(filesDropped[0].files).length === 3) {
                this.props.onDropFiles(files[0].preview);
            } else {
                this.props.onDropError('shapefile.error.genericLoadError');
            }
            this.props.onFileLoading(false);
        }).catch(e => {
            this.props.onFileLoading(false);
            const errorName = e && e.name || e || '';
            if (isString(errorName) && errorName === 'SyntaxError') {
                this.props.onDropError('shapefile.error.shapeFileParsingError');
            } else {
                this.props.onDropError('shapefile.error.genericLoadError');
            }
        });
    };

}


module.exports = FileUpload;
