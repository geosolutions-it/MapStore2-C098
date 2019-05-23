/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import PropTypes from 'prop-types';
import {Form, FormGroup, Col} from 'react-bootstrap';
import BorderLayout from '@mapstore/components/layout/BorderLayout';
import Message from '@mapstore/components/I18N/Message';
import PermissionEditor from '@mapstore/components/security/PermissionEditor';

/**
 * Asset Permission
 * @class
 * @memberof components.AssetPermission
*/
class AssetPermission extends React.Component {
    static propTypes = {
        assets: PropTypes.array,
        assetEdited: PropTypes.object,
        className: PropTypes.string,
        onEditAsset: PropTypes.func,
        savingAsset: PropTypes.bool,
        user: PropTypes.object
    };
    static contextTypes = {
        messages: PropTypes.object
    };
    static defaultProps = {
        assetEdited: {},
        assets: [],
        className: "",
        onEditAsset: () => {},
        savingAsset: false,
        user: {
            "attribute": [
                {
                    "name": "email",
                    "value": "info@geo-solutions.it"
                },
                {
                    "name": "notes",
                    "value": "note"
                },
                {
                    "name": "company",
                    "value": "GeoSolutions"
                }
            ],
            "enabled": true,
            "groups": {
                "group": [
                    {
                        "description": "description",
                        "enabled": true,
                        "groupName": "everyone",
                        "id": 479
                    },
                    {
                        "description": "Group for GeoSolutions' Staff",
                        "enabled": true,
                        "groupName": "geosolutions",
                        "id": 524
                    }
                ]
            },
            "id": 3,
            "name": "admin",
            "role": "ADMIN"
        }
    };

    render() {

        /*
        availablePermissions ={this.props.availablePermissions}
        availableGroups={this.props.availableGroups}
        groups={this.props.groups}
        newGroup={this.props.newGroup}
        newPermission={this.props.newPermission}
        onNewGroupChoose={this.props.onNewGroupChoose}
        onNewPermissionChoose={this.props.onNewPermissionChoose}
        onAddPermission={this.props.onAddPermission}
        onGroupsChange={this.props.onGroupsChange}*/
        return (
            <BorderLayout>
                <Form horizontal>
                    <FormGroup>
                        <Col xs={12} sm={12} md={12}>
                            <Message msgId="sciadro.assets.permissionsOptions" />{this.props.assetEdited.name || "no name"}
                                <PermissionEditor
                                    user={this.props.user}
                                    disabled={this.props.savingAsset}
                                    map={this.props.assetEdited}
                                />
                        </Col>
                    </FormGroup>
                </Form>
            </BorderLayout>
        );
    }
}

export default AssetPermission;
