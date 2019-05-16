/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import PropTypes from 'prop-types';
import {find} from 'lodash';
import {Form, FormGroup, Col} from 'react-bootstrap';
import BorderLayout from '@mapstore/components/layout/BorderLayout';
import Message from '@mapstore/components/I18N/Message';

/**
 * Asset Edit
 * @class
 * @memberof components.AssetEdit
*/
class AssetEdit extends React.Component {
    static propTypes = {
        assets: PropTypes.array,
        className: PropTypes.string,
        onEditAsset: PropTypes.func
    };
    static contextTypes = {
        messages: PropTypes.object
    };
    static defaultProps = {
        assets: [],
        className: "",
        onEditAsset: () => {}
    };

    render() {
        const asset = find(this.props.assets, a => a.permission) || {};

        return (
            <BorderLayout
                className="padding15">
                <Form horizontal>
                    <FormGroup>
                        <Col xs={12} sm={12} md={12}>
                            <Message msgId="sciadro.assets.permissionsOptions" />{asset.name || "no name"}
                            <img src="assets/images/permissions.png"/>
                        </Col>
                    </FormGroup>
                </Form>
            </BorderLayout>
        );
    }
}

export default AssetEdit;
