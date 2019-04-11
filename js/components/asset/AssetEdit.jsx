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

/**
 * Asset Edit
 * @class
 * @memberof components.AssetEdit
*/
class AssetEdit extends React.Component {
    static propTypes = {
        asset: PropTypes.object,
        className: PropTypes.string
    };
    static contextTypes = {
        messages: PropTypes.object
    };
    static defaultProps = {
        assets: [],
        className: ""
    };
    render() {

        return (
            <BorderLayout
                className="padding15"
                header={
                    <div style={{ padding: 8 }}>
                    </div>
                }>
                <Form horizontal>
                    <FormGroup>
                        <Col xs={12} sm={12} md={12}>
                            <ControlLabel><Message msgId="sciadro.assets.type"/></ControlLabel>
                            <FormControl/>
                        </Col>
                        <Col xs={12} sm={12} md={12}>
                            <ControlLabel><Message msgId="sciadro.assets.name"/></ControlLabel>
                            <FormControl/>
                        </Col>
                        <Col xs={12} sm={12} md={12}>
                            <ControlLabel><Message msgId="sciadro.assets.description"/></ControlLabel>
                            <FormControl/>
                        </Col>
                        <Col xs={12} sm={12} md={12}>
                            <ControlLabel><Message msgId="sciadro.assets.note"/></ControlLabel>
                            <FormControl/>
                        </Col>
                        <Col xs={12} sm={12} md={12}>
                            <ControlLabel><Message msgId="sciadro.assets.dateCreation"/></ControlLabel>
                            <FormControl/>
                        </Col>
                        <Col xs={12} sm={12} md={12}>
                            <ControlLabel><Message msgId="sciadro.assets.dateModified"/></ControlLabel>
                            <FormControl/>
                        </Col>
                    </FormGroup>
                </Form>
            </BorderLayout>
        );
    }
}

export default AssetEdit;
