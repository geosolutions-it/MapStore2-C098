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

// import Message from '@mapstore/components/I18N/Message';
import Toolbar from '@mapstore/components/misc/toolbar/Toolbar';

/**
 * Toolbar for sciadro app
 * @class
 * @memberof components.Toolbar
 */
export default class MainToolbar extends React.Component {
    static propTypes = {
        mode: PropTypes.string,
        onResetCurrentAsset: PropTypes.func,
        onResetCurrentMission: PropTypes.func,
        onChangeMode: PropTypes.func
    };
    static contextTypes = {
        messages: PropTypes.object
    };
    static defaultProps = {
        mode: "asset-list",
        onResetCurrentAsset: () => {},
        onResetCurrentMission: () => {},
        onChangeMode: () => {}
    };

    render() {
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
                                if (this.props.mode === "mission-detail") {
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
                        }
                    ]}
                />
            </ButtonToolbar>
        );
    }
}
