/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import PropTypes from 'prop-types';
import SideGrid from '@mapstore/components/misc/cardgrids/SideGrid';
import Toolbar from '@mapstore/components/misc/toolbar/Toolbar';
import BorderLayout from '@mapstore/components/layout/BorderLayout';
import Message from '@mapstore/components/I18N/Message';
import {find} from 'lodash';

/**
 * Mission AnomaliesList
 * @class
 * @memberof components.AnomaliesList
*/
export default class AnomaliesList extends React.Component {
    static propTypes = {
        anomalies: PropTypes.array,
        missionCurrent: PropTypes.object,
        videoDurationSec: PropTypes.number,
        onDownloadFrame: PropTypes.func,
        onUpdateDroneGeometry: PropTypes.func,
        onShowFrame: PropTypes.func,
        onShowOnMap: PropTypes.func
    };
    static contextTypes = {
        messages: PropTypes.object
    };
    static defaultProps = {
        anomalies: [],
        missionCurrent: {},
        onDownloadFrame: () => {},
        onUpdateDroneGeometry: () => {},
        onShowFrame: () => {},
        onShowOnMap: () => {}
    };

    getTitle(type) {
        switch (type) {
            case "INS": {
                return <Message msgId="sciadro.anomalies.ins"/>;// "Insulator";
            }
            case "PIP": {
                return <Message msgId="sciadro.anomalies.pip"/>;
            }
            default: return "N.A.";
        }
    }
    render() {

        return (
            <BorderLayout>
                <SideGrid
                    className="mission-list-container"
                    size="sm"
                    onItemClick = {(/*item*/) => {
                        // do selection of this item
                    }}
                    items={
                        /*
                        * item *
                            confidence: 0
                            frame: "562a9ae4-2ed8-4cd9-91f1-66608dbd7edc"
                            id: "12696564-20ae-4512-811c-5eb9a60af2e8"
                            status: "UNK"
                            type: "INS"
                            x_max: 2
                            x_min: 1
                            y_max: 4
                            y_min: 3
                        */
                        this.props.anomalies.map(item => ({
                            id: item.id,
                            title: this.getTitle(item.type),
                            selected: item.selected,
                            tools: <Toolbar
                                btnDefaultProps={{
                                    bsStyle: 'primary',
                                    className: 'square-button-md'
                                }}
                                buttons={
                                    [
                                        {
                                            glyph: 'playback',
                                            tooltipId: "sciadro.missions.showFrame",
                                            onClick: () => {
                                                const frame = find(this.props.missionCurrent.frames, {id: item.frame});
                                                const frameTime = frame.index * 1000 / 24; // assuming 24 fps for the video
                                                this.props.onShowFrame(frameTime / (this.props.videoDurationSec * 1000), "fraction");
                                            }
                                        }, {
                                            glyph: 'download',
                                            tooltipId: "sciadro.missions.downloadFrame",
                                            loading: item.downloading,
                                            disabled: item.downloading,
                                            onClick: () => {
                                                this.props.onDownloadFrame(item.frame);
                                            }
                                        }, {
                                            glyph: '1-map',
                                            tooltipId: "sciadro.missions.showMap",
                                            onClick: () => {
                                                const frame = find(this.props.missionCurrent.frames, {id: item.frame});
                                                const frameTime = frame.index * 1000 / 24; // assuming 24 fps for the video
                                                this.props.onShowFrame(frameTime / (this.props.videoDurationSec * 1000), "fraction");
                                            }
                                        }
                                    ]
                                }/>
                        }))
                    }
                />
        </BorderLayout>
        );
    }
}
