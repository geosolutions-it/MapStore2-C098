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
        assetEdited: PropTypes.object,
        assetSelected: PropTypes.object,
        missionEdited: PropTypes.object,
        missionSelected: PropTypes.object,
        buttonsStatus: PropTypes.object,
        assetZoomLevel: PropTypes.number,
        missionZoomLevel: PropTypes.number,

        onResetCurrentAsset: PropTypes.func,
        onResetCurrentMission: PropTypes.func,
        onZoomToItem: PropTypes.func,
        onStartSavingMission: PropTypes.func,
        onStartSavingAsset: PropTypes.func,
        onDrawAsset: PropTypes.func,
        // onChangeMode: PropTypes.func,
        onEnterenterCreateItem: PropTypes.func,
        onEnterEditItem: PropTypes.func,
        onHideAdditionalLayer: PropTypes.func
    };
    static contextTypes = {
        messages: PropTypes.object
    };
    static defaultProps = {
        assetEdited: {},
        assetSelected: {},
        missionEdited: {},
        missionSelected: {},
        buttonsStatus: {
            back: false,
            zoom: false,
            zoomDisabled: false,
            saveError: {
                message: "",
                visible: false
            },
            edit: false,
            add: false,
            save: false,
            saveDisabled: false,
            draw: false
        },
        mode: "asset-list",
        onResetCurrentAsset: () => {},
        onResetCurrentMission: () => {},
        onZoomToItem: () => {},
        onStartSavingMission: () => {},
        onStartSavingAsset: () => {},
        onDrawAsset: () => {},
        // onChangeMode: () => {},
        onEnterenterCreateItem: () => {},
        onHideAdditionalLayer: () => {}
    };

    render() {
        const {missionEdited, missionSelected, assetSelected, assetEdited} = this.props;
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
                            visible: this.props.buttonsStatus.back // all but the first view(asset-list) has the back button
                        },
                        {
                            tooltipId: this.props.mode === "mission-list" ? "sciadro.missions.add" : "sciadro.assets.add",
                            tooltipPosition: "top",
                            className: "square-button-md no-border",
                            pullRight: true,
                            onClick: () => {
                                this.props.onEnterenterCreateItem(this.props.mode.replace("list", "edit"));
                                this.props.onHideAdditionalLayer("missions");
                            },
                            glyph: "plus",
                            visible: this.props.buttonsStatus.add
                        },
                        {
                            tooltipId: "sciadro.save",
                            tooltipPosition: "top",
                            className: "square-button-md no-border",
                            pullRight: true,
                            disabled: this.props.buttonsStatus.saveDisabled,
                            onClick: () => {
                                if (this.props.mode === "mission-edit") {
                                    this.props.onStartSavingMission(missionEdited.id);
                                }
                                if (this.props.mode === "asset-edit") {
                                    this.props.onStartSavingAsset(assetEdited.id);
                                }
                            },
                            glyph: "floppy-disk",
                            visible: this.props.buttonsStatus.save
                        },
                        {
                            tooltipId: this.props.mode === "mission-list" ? "sciadro.missions.edit" : "sciadro.assets.edit",
                            tooltipPosition: "top",
                            className: "square-button-md no-border",
                            pullRight: true,
                            onClick: () => {
                                this.props.onEnterEditItem(this.props.mode.replace("list", "edit"), missionSelected && missionSelected.id || assetSelected && assetSelected.id);
                                this.props.onHideAdditionalLayer("missions");
                            },
                            glyph: "wrench",
                            visible: this.props.buttonsStatus.edit
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
                            visible: this.props.buttonsStatus.zoom,
                            disabled: this.props.buttonsStatus.zoomDisabled
                        },
                        {
                            tooltipId: this.props.buttonsStatus.saveError.message,
                            tooltipPosition: "top",
                            className: "square-button-md no-border",
                            pullRight: true,
                            bsStyle: "danger",
                            glyph: "exclamation-mark",
                            visible: this.props.buttonsStatus.saveError.visible
                        }
                        // TODO add  DELETE BUTTON, FOR ASSETS OR MISSIONS
                    ]}
                />
            </ButtonToolbar>
        );
    }
}
