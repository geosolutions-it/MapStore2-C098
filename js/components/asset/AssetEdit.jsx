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
        typeList: PropTypes.array,
        assetEdited: PropTypes.object,
        className: PropTypes.string,
        formatDate: PropTypes.string,
        savingAsset: PropTypes.bool,
        onEditAsset: PropTypes.func,
        renderDropZone: PropTypes.func,
        renderToolbarGeom: PropTypes.func
    };
    static contextTypes = {
        messages: PropTypes.object
    };
    static defaultProps = {
        assetEdited: {attributes: {}, isNew: true},
        savingAsset: false,
        assets: [],
        formatDate: "DD/MM/YYYY HH:mm:ss",
        typeList: [
            { value: "POW", label: "sciadro.assets.powerline" },
            { value: "PIP", label: "sciadro.assets.pipeline" },
            { value: "ELE", label: "sciadro.assets.electric-truss" }
        ],
        className: "",
        onEditAsset: () => {},
        renderDropZone: () => null,
        renderToolbarGeom: () => null
    };

    render() {
        const asset = this.props.assetEdited;
        const DropZone = this.props.renderDropZone;
        const ToolbarGeom = this.props.renderToolbarGeom;
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
                                value={asset.attributes.type}
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
                                value={asset.attributes.note}
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
                                    defaultValue={new Date(asset.attributes.created)}
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
                                    defaultValue={new Date(asset.attributes.modified)}
                                />
                            </Col>
                        </FormGroup>
                    }
                    <FormGroup>
                        <Col xs={12} sm={12} md={12}>
                            <ControlLabel><Message msgId="sciadro.assets.geometry"/></ControlLabel>
                            <br/>
                            <ToolbarGeom/>
                            <DropZone wrap={false}/>
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
