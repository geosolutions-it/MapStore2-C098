/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';

import Message from '../../components/I18N/Message';
// import LayersUtils from '../../utils/LayersUtils';
// import LocaleUtils from '../../utils/LocaleUtils';
import FileUtils from '../../utils/FileUtils';
import {Grid, Row, Col, Button} from 'react-bootstrap';
import {isString} from 'lodash';

import SelectShape from './SelectShape';

import {Promise} from 'es6-promise';

class FileUpload extends React.Component {
    static propTypes = {
        bbox: PropTypes.array,
        layers: PropTypes.array,
        style: PropTypes.object,
        readFiles: PropTypes.func,
        onDropError: PropTypes.func,
        onDropSuccess: PropTypes.func,
        onFileDropped: PropTypes.func,
        addFile: PropTypes.func,
        onFileLoading: PropTypes.func,
        error: PropTypes.string,
        success: PropTypes.string,
        buttonSize: PropTypes.string,
        uploadMessage: PropTypes.object,
        cancelMessage: PropTypes.object,
        addMessage: PropTypes.object,
        uploadOptions: PropTypes.object
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        onFileLoading: () => {},
        readFiles: (files, onWarnings) => files.map((file) => {
            const ext = FileUtils.recognizeExt(file.name);
            const type = file.type || FileUtils.MIME_LOOKUPS[ext];
            if (type === 'application/x-zip-compressed' ||
                type === 'application/zip' ) {
                return FileUtils.readZip(file).then((buffer) => {
                    return FileUtils.checkShapePrj(buffer).then((warnings) => {
                        if (warnings.length > 0) {
                            onWarnings('shapefile.error.missingPrj');
                        }
                        return FileUtils.shpToGeoJSON(buffer);// todo chech this
                    });
                });
            }
        }),
        stylers: {},
        buttonSize: "small",
        uploadOptions: {},
        bbox: null
    };

    state = {
        useDefaultStyle: false,
        zoomOnShapefiles: true
    };

    getGeometryType = (geometry) => {
        if (geometry && geometry.type === 'GeometryCollection') {
            return geometry.geometries.reduce((previous, g) => {
                if (g && g.type === previous) {
                    return previous;
                }
                return g.type;
            }, null);
        }
        if (geometry) {
            switch (geometry.type) {
                case 'Polygon':
                case 'MultiPolygon': {
                    return 'Polygon';
                }
                case 'MultiLineString':
                case 'LineString': {
                    return 'LineString';
                }
                case 'Point':
                case 'MultiPoint': {
                    return 'Point';
                }
                default: {
                    return null;
                }
            }
        }
        return null;
    };

    renderError = () => {
        return (<Row>
                   <div style={{textAlign: "center"}} className="alert alert-danger"><Message msgId={this.props.error}/></div>
                </Row>);
    };

    renderSuccess = () => {
        return (<Row>
                   <div style={{textAlign: "center", overflowWrap: "break-word"}} className="alert alert-success">{this.props.success}</div>
                </Row>);
    };

    render() {
        return (
            <Grid role="body" style={{width: "300px"}} fluid>
                {this.props.error ? this.renderError() : null}
                {this.props.success ? this.renderSuccess() : null}
                <Row style={{textAlign: "center"}}>
                    <SelectShape {...this.props.uploadOptions} errorMessage="shapefile.error.select" text={this.props.uploadMessage} onFileDropped={this.addFile} onDropError={this.props.onDropError}/>
                </Row>
                <Row>
                    <Col xsOffset={6} xs={3}>
                        <Button bsSize={this.props.buttonSize} onClick={() => {this.props.onFileDropped(null); }}>
                            {this.props.cancelMessage}
                        </Button>
                    </Col>
                </Row>
            </Grid>
        );
    }

    addFile = (files) => {
        this.props.onFileLoading(true);
        let queue = this.props.readFiles(files, this.props.onDropError);
        // geoJsons is array of array
        Promise.all(queue).then((filesDropped) => {
            console.log("filesDropped\n");
            console.log(filesDropped);
            this.props.onFileDropped(files);
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
/*
    addToMap = () => {
        this.props.onFileLoading(true);
        let styledLayer = this.props.selected;
        if (!this.state.useDefaultStyle) {
            styledLayer = StyleUtils.toVectorStyle(styledLayer, this.props.shapeStyle);
        }
        Promise.resolve(this.props.addFileLayer( styledLayer )).then(() => {
            this.props.onFileLoading(false);
            let bbox = [];
            if (this.props.layers[0].bbox && this.props.bbox) {
                bbox = [
                    Math.min(this.props.bbox[0], this.props.layers[0].bbox.bounds.minx),
                    Math.min(this.props.bbox[1], this.props.layers[0].bbox.bounds.miny),
                    Math.max(this.props.bbox[2], this.props.layers[0].bbox.bounds.maxx),
                    Math.max(this.props.bbox[3], this.props.layers[0].bbox.bounds.maxy)
                ];
            }
            if (this.state.zoomOnShapefiles) {
                this.props.updateShapeBBox(bbox && bbox.length ? bbox : this.props.bbox);
                this.props.onZoomSelected(bbox && bbox.length ? bbox : this.props.bbox, "EPSG:4326");
            }
            this.props.onDropSuccess(this.props.layers[0].name + LocaleUtils.getMessageById(this.context.messages, "shapefile.success"));
            this.props.onLayerAdded(this.props.selected);
        }).catch(() => {
            this.props.onFileLoading(false);
            this.props.onDropError('shapefile.error.genericLoadError');
        });
    };*/
}


module.exports = FileUpload;
