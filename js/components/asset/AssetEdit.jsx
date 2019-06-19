/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import PropTypes from 'prop-types';
import {Form, FormGroup, FormControl, ControlLabel, Col} from 'react-bootstrap';
import BorderLayout from '@mapstore/components/layout/BorderLayout';
import Message from '@mapstore/components/I18N/Message';
import Moment from 'moment';
import {compose} from 'recompose';
import momentLocalizer from 'react-widgets/lib/localizers/moment';
momentLocalizer(Moment);
require('react-widgets/lib/less/react-widgets.less');

import loadingState from '@mapstore/components/misc/enhancers/loadingState';
import {DateTimePicker} from 'react-widgets';
import {getValidationState} from '@js/utils/sciadro';
import LoadingWithText from '@js/components/LoadingWithText';

/**
 * Asset Edit
 * @class
 * @memberof components.AssetEdit
*/
class AssetEdit extends React.Component {
    static propTypes = {
        assets: PropTypes.array,
        assetEdited: PropTypes.object,
        assetPermissionComponent: PropTypes.func,
        className: PropTypes.string,
        dropZoneComponent: PropTypes.func,
        formatDate: PropTypes.string,
        onEditAsset: PropTypes.func,
        savingAsset: PropTypes.bool,
        toolbarGeometryComponent: PropTypes.func,
        typeList: PropTypes.array
    };
    static contextTypes = {
        messages: PropTypes.object
    };
    static defaultProps = {
        assets: [],
        assetEdited: {attributes: {}, isNew: true},
        assetPermissionComponent: () => null,
        className: "",
        dropZoneComponent: () => null,
        formatDate: "DD/MM/YYYY HH:mm:ss",
        onEditAsset: () => {},
        savingAsset: false,
        typeList: [
            { value: "POW", label: "sciadro.assets.powerline" },
            { value: "PIP", label: "sciadro.assets.pipeline" },
            { value: "ELE", label: "sciadro.assets.electricTruss" }
        ],
        toolbarGeometryComponent: () => null
    };

    render() {
        const asset = this.props.assetEdited;
        const DropZone = this.props.dropZoneComponent;
        const AssetPermission = this.props.assetPermissionComponent;
        const ToolbarGeom = this.props.toolbarGeometryComponent;
        return (
            <BorderLayout
                className="padding15" >
                <Form horizontal>
                    <FormGroup>
                        <Col xs={12} sm={12} md={12}>
                            <ControlLabel><Message msgId="sciadro.mandatory"/></ControlLabel>
                        </Col>
                    </FormGroup>
                    <FormGroup>
                        <Col xs={12} sm={12} md={12}>
                            <ControlLabel><Message msgId="sciadro.assets.type"/></ControlLabel>
                            <FormControl
                                componentClass="select"
                                placeholder="..."
                                onChange={(e) => this.props.onEditAsset(asset.id, "attributes.type", e.target.value)}
                                value={asset.attributes && asset.attributes.type}
                                >
                                    {this.props.typeList.map((t, i) => (
                                        <option key={i} value={t.value}><Message msgId={t.label}/></option>
                                    ))}
                            </FormControl>
                        </Col>
                    </FormGroup>
                    <FormGroup validationState={getValidationState(asset.name)}>
                        <Col xs={12} sm={12} md={12}>
                            <ControlLabel><Message msgId="sciadro.assets.name"/> *</ControlLabel>
                            <FormControl
                                value={asset.name}
                                onChange={(e) => this.props.onEditAsset(asset.id, "name", e.target.value)}
                            />
                        </Col>
                    </FormGroup>
                  <FormGroup>
                        <Col xs={12} sm={12} md={12}>
                            <ControlLabel><Message msgId="sciadro.assets.description"/></ControlLabel>
                            <FormControl
                                value={asset.description}
                                onChange={(e) => this.props.onEditAsset(asset.id, "description", e.target.value)}
                            />
                        </Col>
                    </FormGroup>
                    <FormGroup>
                        <Col xs={12} sm={12} md={12}>
                            <ControlLabel><Message msgId="sciadro.assets.note"/></ControlLabel>
                            <FormControl
                                value={asset.attributes && asset.attributes.note}
                                onChange={(e) => this.props.onEditAsset(asset.id, "attributes.note", e.target.value)}
                            />
                        </Col>
                    </FormGroup>
                    {
                        asset && !asset.isNew && <FormGroup>
                            <Col xs={12} sm={12} md={12}>
                                <ControlLabel><Message msgId="sciadro.assets.created"/></ControlLabel>
                                <DateTimePicker
                                    time={false}
                                    calendar={false}
                                    disabled
                                    format={this.props.formatDate}
                                    defaultValue={new Date(asset.attributes && asset.attributes.created)}
                                />
                            </Col>
                        </FormGroup>
                    }
                    {
                        asset && !asset.isNew && <FormGroup>
                            <Col xs={12} sm={12} md={12}>
                                <ControlLabel><Message msgId="sciadro.assets.modified"/></ControlLabel>
                                <DateTimePicker
                                    time={false}
                                    calendar={false}
                                    disabled
                                    format={this.props.formatDate}
                                    defaultValue={new Date(asset.attributes && asset.attributes.modified)}
                                />
                            </Col>
                        </FormGroup>
                    }
                    <FormGroup>
                        <Col xs={12} sm={12} md={12}>
                            <ControlLabel><Message msgId="sciadro.assets.geometry"/></ControlLabel>
                            <br/>
                            <ToolbarGeom/>
                            {asset && !asset.draw ? <DropZone
                                uploadMessage = {<Message msgId={"shapefile.placeholder"}/>}
                                addMessage = {<Message msgId={"shapefile.addMessage"}/>}
                                cancelMessage = {<Message msgId={"shapefile.cancelMessage"}/>}
                            /> : null}
                            <AssetPermission/>
                        </Col>
                    </FormGroup>
                </Form>
            </BorderLayout>
        );
    }
}

const AssetEditEnhanced = compose(
   loadingState(({savingAsset}) => savingAsset, {text: "Saving Asset"}, LoadingWithText),
)(AssetEdit);

export default AssetEditEnhanced;
