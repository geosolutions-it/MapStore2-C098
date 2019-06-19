/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import PropTypes from 'prop-types';
import { ButtonToolbar, Glyphicon } from 'react-bootstrap';

import Message from '@mapstore/components/I18N/Message';
import Toolbar from '@mapstore/components/misc/toolbar/Toolbar';
import DropdownToolbarOptions from '@mapstore/components/misc/toolbar/DropdownToolbarOptions';
/**
 * Toolbar for sciadro app
 * @class
 * @memberof components.Toolbar
 */
export default class ToolbarGeometry extends React.Component {
    static propTypes = {
        assetEdited: PropTypes.object,
        buttonsStatus: PropTypes.object,
        drawMethod: PropTypes.string,
        mode: PropTypes.string,

        onDrawAsset: PropTypes.func,
        onChangeSuccessMessage: PropTypes.func,
        onDeleteAssetFeature: PropTypes.func,
        onHideAdditionalLayer: PropTypes.func
    };
    static contextTypes = {
        messages: PropTypes.object
    };
    static defaultProps = {
        assetEdited: {},
        buttonsStatus: {
            deleteGeom: true,
            deleteGeomDisabled: true,
            draw: {
                visible: true,
                disabled: false
            }
        },
        mode: "asset-edit",
        onChangeSuccessMessage: () => {},
        onDeleteAssetFeature: () => {},
        onDrawAsset: () => {},
        onHideAdditionalLayer: () => {}
    };

    getOptions = () => {
        const { assetEdited } = this.props;

        let options = [];
        if (assetEdited && assetEdited.attributes && assetEdited.attributes.type === "ELE") {
            options = [ ...options, {
                glyph: "point",
                text: <Message msgId="sciadro.assets.point"/>,
                active: this.props.drawMethod === "Marker",
                onClick: () => {
                    if (assetEdited && assetEdited.id) {
                        this.props.onDrawAsset(assetEdited.id, "Marker");
                    }
                },
                visible: assetEdited && assetEdited.type === "ELE"
            }];
        }
        options = [ ...options, {
            glyph: "line",
            text: <Message msgId="sciadro.assets.line"/>,
            active: this.props.drawMethod === "LineString",
            onClick: () => {
                if (assetEdited && assetEdited.id) {
                    this.props.onDrawAsset(assetEdited.id, "LineString");
                }
            }
        }];
        return options;
    }
    render() {
        const { assetEdited, mode, buttonsStatus } = this.props;

        return (
            <ButtonToolbar className="buttonToolbar">
                <Toolbar
                    btnGroupProps = {{ className: 'btn-group-menu-options'}}
                    transitionProps = { null }
                    btnDefaultProps = {{ className: 'square-button-md', bsStyle: 'primary' }}
                    buttons = {[
                        {
                            tooltipId: "sciadro.assets.geomTrash",
                            tooltipPosition: "top",
                            className: "square-button-md no-border",
                            pullRight: true,
                            onClick: () => {
                                if (assetEdited && assetEdited.id) {
                                    this.props.onDeleteAssetFeature(assetEdited.id);
                                    this.props.onChangeSuccessMessage(null);
                                    this.props.onHideAdditionalLayer("assets");
                                }
                            },
                            glyph: "trash",
                            visible: mode === "asset-edit",
                            disabled: buttonsStatus.deleteGeomDisabled
                        },
                        {
                            buttonConfig: {
                                disabled: buttonsStatus.draw.disabled,
                                title: <Glyphicon glyph="pencil"/>,
                                tooltipId: "sciadro.assets.draw",
                                tooltipPosition: "top",
                                className: "square-button-md no-border",
                                pullRight: true,
                                bsStyle: assetEdited && assetEdited.draw ? "success" : "primary",
                                id: "geom"
                            },
                            menuOptions: this.getOptions(),
                            visible: buttonsStatus.draw.visible,
                            Element: DropdownToolbarOptions
                        }
                    ]}
                />
            </ButtonToolbar>
        );
    }
}
