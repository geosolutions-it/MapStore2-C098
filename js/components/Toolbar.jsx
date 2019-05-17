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

        onClearMissionDateFilter: PropTypes.func,
        onEnterCreateItem: PropTypes.func,
        onEnterEditItem: PropTypes.func,
        onFilterMissionByDate: PropTypes.func,
        onHideAdditionalLayer: PropTypes.func,
        onResetCurrentAsset: PropTypes.func,
        onResetCurrentMission: PropTypes.func,
        onStartSavingAsset: PropTypes.func,
        onStartSavingMission: PropTypes.func,
        onZoomToItem: PropTypes.func
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
            searchDate: {
                visible: true,
                disabled: true
            },
            edit: false,
            add: false,
            save: false,
            saveDisabled: false,
            draw: false
        },
        mode: "asset-list",
        onClearMissionDateFilter: () => {},
        onEnterCreateItem: () => {},
        onEnterEditItem: () => {},
        onFilterMissionByDate: () => {},
        onHideAdditionalLayer: () => {},
        onResetCurrentAsset: () => {},
        onResetCurrentMission: () => {},
        onStartSavingAsset: () => {},
        onStartSavingMission: () => {},
        onZoomToItem: () => {}
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
                                this.props.onEnterCreateItem(this.props.mode.replace("list", "edit"));
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
                            tooltipId: this.props.mode.indexOf("mission") !== -1 ? "sciadro.missions.zoom" : "sciadro.assets.zoom",
                            tooltipPosition: "top",
                            className: "square-button-md no-border",
                            pullRight: true,
                            onClick: () => {
                                this.props.onZoomToItem();
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
                        },
                        {
                            bsStyle: this.props.buttonsStatus.searchDate.error ? "danger" : "primary",
                            disabled: this.props.buttonsStatus.searchDate.disabled,
                            className: "square-button-md no-border",
                            glyph: "search",
                            pullRight: true,
                            onClick: () => {
                                if (!this.props.buttonsStatus.searchDate.error) {
                                    this.props.onFilterMissionByDate();
                                }
                            },
                            tooltipId: this.props.buttonsStatus.searchDate.error ? "sciadro.missions.filterByDateError" : "sciadro.missions.filterByDate",
                            tooltipPosition: "top",
                            visible: this.props.buttonsStatus.searchDate.visible
                        },
                        {
                            className: "square-button-md no-border",
                            disabled: this.props.buttonsStatus.clearFilter.disabled,
                            glyph: "clear-filter",
                            pullRight: true,
                            onClick: () => {
                                if (!this.props.buttonsStatus.clearFilter.enabled) {
                                    this.props.onClearMissionDateFilter();
                                }
                            },
                            tooltipId: "sciadro.missions.clearFilter",
                            tooltipPosition: "top",
                            visible: this.props.buttonsStatus.clearFilter.visible
                        }
                        // TODO add  DELETE BUTTON, FOR ASSETS OR MISSIONS
                    ]}
                />
            </ButtonToolbar>
        );
    }
}
