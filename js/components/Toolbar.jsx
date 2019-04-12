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
import {find} from 'lodash';
import DropdownToolbarOptions from '@mapstore/components/misc/toolbar/DropdownToolbarOptions';

/**
 * Toolbar for sciadro app
 * @class
 * @memberof components.Toolbar
 */
export default class MainToolbar extends React.Component {
    static propTypes = {
        assets: PropTypes.array,
        mode: PropTypes.string,
        drawMethod: PropTypes.string,
        onResetCurrentAsset: PropTypes.func,
        onResetCurrentMission: PropTypes.func,
        onAddMission: PropTypes.func,
        onAddAsset: PropTypes.func,
        onDrawAsset: PropTypes.func,
        onChangeMode: PropTypes.func
    };
    static contextTypes = {
        messages: PropTypes.object
    };
    static defaultProps = {
        assets: [],
        mode: "asset-list",
        onResetCurrentAsset: () => {},
        onResetCurrentMission: () => {},
        onAddMission: () => {},
        onAddAsset: () => {},
        onDrawAsset: () => {},
        onChangeMode: () => {}
    };

    render() {
        const assetEdited = find(this.props.assets, a => a.edit) || {};

        return (
            <ButtonToolbar className="buttonToolbar">
                <Toolbar
                    btnGroupProps = {{ className: 'btn-group-menu-options'}}
                    transitionProps = {null}
                    btnDefaultProps = {{ className: 'square-button-md', bsStyle: 'primary' }}
                    buttons = {[
                        {
                            tooltipId: "sciadro.back",
                            tooltipPosition: "top",
                            className: "square-button-md no-border",
                            pullRight: true,
                            onClick: () => {
                                if (this.props.mode === "mission-detail" || this.props.mode === "mission-edit") {
                                    this.props.onResetCurrentMission();
                                }
                                if (this.props.mode === "mission-list" || this.props.mode === "asset-edit") {
                                    this.props.onResetCurrentAsset();
                                }
                            },
                            glyph: "arrow-left",
                            visible: this.props.mode !== "asset-list" // all but the first has the back button
                        },
                        {
                            tooltipId: this.props.mode === "mission-list" ? "sciadro.missions.add" : "sciadro.assets.add",
                            tooltipPosition: "top",
                            className: "square-button-md no-border",
                            pullRight: true,
                            onClick: () => {
                                this.props.onChangeMode(this.props.mode.replace("list", "edit"));
                            },
                            glyph: "plus",
                            visible: this.props.mode.indexOf("list") !== -1
                        },
                        {
                            tooltipId: this.props.mode === "mission-edit" ? "sciadro.missions.edit" : "sciadro.assets.edit",
                            tooltipPosition: "top",
                            className: "square-button-md no-border",
                            pullRight: true,
                            onClick: () => {
                                if (this.props.mode === "mission-edit") {
                                    this.props.onAddMission();
                                }
                                if (this.props.mode === "asset-edit") {
                                    this.props.onAddAsset();
                                }
                            },
                            glyph: "floppy-disk",
                            visible: this.props.mode.indexOf("edit") !== -1
                        },
                        {
                            tooltipId: this.props.mode === "mission-edit" ? "sciadro.missions.upload" : "sciadro.assets.upload",
                            tooltipPosition: "top",
                            className: "square-button-md no-border",
                            pullRight: true,
                            onClick: () => {
                                if (this.props.mode === "mission-edit") {
                                    // this.props.onUploadMissionData();
                                }
                                if (this.props.mode === "asset-edit") {
                                    // this.props.onUploadAssetData();
                                }
                            },
                            glyph: "upload",
                            visible: this.props.mode.indexOf("edit") !== -1
                        },
                        {
                        buttonConfig: {
                            title: <Glyphicon glyph="pencil"/>,
                            tooltipId: "sciadro.assets.draw",
                            tooltipPosition: "top",
                            className: "square-button-md no-border",
                            pullRight: true,
                            bsStyle: assetEdited.draw ? "success" : "primary",
                            id: "geom"
                        },
                        menuOptions: [
                            {
                                glyph: "point",
                                text: <Message msgId="sciadro.assets.point"/>,
                                active: this.props.drawMethod === "Point",
                                onClick: () => {
                                    this.props.onDrawAsset(assetEdited.id, "Point");
                                }
                            }, {
                                // active: this.props.format === "aeronautical",
                                glyph: "line",
                                text: <Message msgId="sciadro.assets.line"/>,
                                active: this.props.drawMethod === "LineString",
                                onClick: () => {
                                    this.props.onDrawAsset(assetEdited.id, "LineString");
                                }
                            }
                        ],
                        visible: this.props.mode === "asset-edit",
                        Element: DropdownToolbarOptions
                    }
                    ]}
                />
            </ButtonToolbar>
        );
    }
}
