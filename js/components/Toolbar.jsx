/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import PropTypes from 'prop-types';
import { ButtonToolbar } from 'react-bootstrap';

import Toolbar from '@mapstore/components/misc/toolbar/Toolbar';
/**
 * Toolbar for sciadro app
 * @class
 * @memberof components.Toolbar
 */
export default class MainToolbar extends React.Component {
    static propTypes = {
        mode: PropTypes.string,
        drawMethod: PropTypes.string,
        error: PropTypes.string,
        assetEdited: PropTypes.object,
        assetSelected: PropTypes.object,
        missionSelected: PropTypes.object,
        buttonsVisibility: PropTypes.object,
        assetZoomLevel: PropTypes.number,
        missionZoomLevel: PropTypes.number,

        onResetCurrentAsset: PropTypes.func,
        onResetCurrentMission: PropTypes.func,
        onZoomToItem: PropTypes.func,
        onAddMission: PropTypes.func,
        onStartSaveAsset: PropTypes.func,
        onDrawAsset: PropTypes.func,
        // onChangeMode: PropTypes.func,
        onCreateItem: PropTypes.func,
        onEditItem: PropTypes.func,
        onHideAdditionalLayer: PropTypes.func
    };
    static contextTypes = {
        messages: PropTypes.object
    };
    static defaultProps = {
        buttonsVisibility: {
            back: false,
            zoom: false,
            saveDisabled: false,
            zoomDisabled: false,
            edit: false,
            add: false,
            save: false,
            draw: false
        },
        mode: "asset-list",
        onResetCurrentAsset: () => {},
        onResetCurrentMission: () => {},
        onZoomToItem: () => {},
        onAddMission: () => {},
        onStartSaveAsset: () => {},
        onDrawAsset: () => {},
        // onChangeMode: () => {},
        onCreateItem: () => {},
        onHideAdditionalLayer: () => {}
    };

    render() {
        const {missionSelected, assetSelected, assetEdited} = this.props;
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
                                const {mode} = this.props;
                                if (mode === "mission-detail" || mode === "mission-edit") {
                                    this.props.onResetCurrentMission();
                                }
                                if (mode === "mission-list" || mode === "asset-edit" || mode === "asset-permission") {
                                    this.props.onResetCurrentAsset();
                                }
                            },
                            glyph: "arrow-left",
                            visible: this.props.buttonsVisibility.back // all but the first view(asset-list) has the back button
                        },
                        {
                            tooltipId: this.props.mode === "mission-list" ? "sciadro.missions.add" : "sciadro.assets.add",
                            tooltipPosition: "top",
                            className: "square-button-md no-border",
                            pullRight: true,
                            onClick: () => {
                                this.props.onCreateItem(this.props.mode.replace("list", "edit"));
                                this.props.onHideAdditionalLayer("missions");
                            },
                            glyph: "plus",
                            visible: this.props.buttonsVisibility.add
                        },
                        {
                            tooltipId: "sciadro.save",
                            tooltipPosition: "top",
                            className: "square-button-md no-border",
                            pullRight: true,
                            disabled: this.props.buttonsVisibility.saveDisabled,
                            onClick: () => {
                                if (this.props.mode === "mission-edit") {
                                    this.props.onAddMission();
                                }
                                if (this.props.mode === "asset-edit") {
                                    this.props.onStartSaveAsset(assetEdited.id);
                                }
                            },
                            glyph: "floppy-disk",
                            visible: this.props.buttonsVisibility.save
                        },
                        {
                            tooltipId: this.props.mode === "mission-list" ? "sciadro.missions.edit" : "sciadro.assets.edit",
                            tooltipPosition: "top",
                            className: "square-button-md no-border",
                            pullRight: true,
                            onClick: () => {
                                this.props.onEditItem(this.props.mode.replace("list", "edit"));
                                this.props.onHideAdditionalLayer("missions");
                            },
                            glyph: "wrench",
                            visible: this.props.buttonsVisibility.edit
                        },
                        {
                            tooltipId: this.props.mode === "mission-list" ? "sciadro.missions.zoom" : "sciadro.assets.zoom",
                            tooltipPosition: "top",
                            className: "square-button-md no-border",
                            pullRight: true,
                            onClick: () => {
                                if (missionSelected && missionSelected.selected && missionSelected.feature) {
                                    this.props.onZoomToItem(this.props.missionZoomLevel);
                                }
                                if (assetSelected && assetSelected.selected && assetSelected.feature) {
                                    this.props.onZoomToItem(this.props.assetZoomLevel);
                                }
                            },
                            glyph: "zoom-to",
                            visible: this.props.buttonsVisibility.zoom,
                            disabled: this.props.buttonsVisibility.zoomDisabled
                        },
                        {
                            tooltipId: this.props.error,
                            tooltipPosition: "top",
                            className: "square-button-md no-border",
                            pullRight: true,
                            bsStyle: "danger",
                            glyph: "exclamation-mark",
                            visible: this.props.buttonsVisibility.saveError
                        }
                    ]}
                />
            </ButtonToolbar>
        );
    }
}
