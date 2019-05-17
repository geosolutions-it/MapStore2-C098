/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import PropTypes from 'prop-types';
import BorderLayout from '@mapstore/components/layout/BorderLayout';
import ReactPlayer from 'react-player';
import {getTelemetryByTimePlayed} from '@js/utils/sciadro';
import Message from '@mapstore/components/I18N/Message';


/**
 * MissionDetail
 * @class
 * @memberof components.List
*/
class MissionDetail extends React.Component {
    static propTypes = {
        anomalies: PropTypes.array,
        config: PropTypes.object,
        controls: PropTypes.bool,
        missions: PropTypes.array,
        missionSelected: PropTypes.object,
        onUpdateDroneGeometry: PropTypes.func,
        onStartPlaying: PropTypes.func,
        progressInterval: PropTypes.number,
        anomaliesListComponent: PropTypes.func,
        videoHeight: PropTypes.string,
        videoFormat: PropTypes.func,
        videoWidth: PropTypes.string
    };
    static contextTypes = {
        messages: PropTypes.object
    };
    static defaultProps = {
        anomalies: [],
        config: {
            file: {
                attributes: {
                    preload: "auto",
                    autoPlay: false
                }
            }
        },
        controls: [],
        missions: [],
        missionSelected: {
            videoUrl: "/assets/video/colibri.mp4"
        },
        onUpdateDroneGeometry: () => {},
        onStartPlaying: () => {},
        progressInterval: 500,
        anomaliesListComponent: () => null,
        videoHeight: 260,
        videoFormat: "video/mp4",
        videoWidth: "100%"
    };

    render() {
        const AnomaliesList = this.props.anomaliesListComponent;
        return (
            <BorderLayout
                header={
                    <div>
                        <div className="mission-detail-header">
                            {this.props.missionSelected.name}
                            <br/>
                            <Message msgId="sciadro.video"/>
                            <br/>
                            <ReactPlayer
                                progressInterval={this.props.progressInterval}
                                config={this.props.config}
                                style={{/*display: "-webkit-inline-box"*/}}
                                width={this.props.videoWidth}
                                controls={this.props.controls}
                                height={this.props.videoHeight}
                                url={[
                                        {src: this.props.missionSelected.videoUrl || "/assets/video/colibri.mp4", type: this.props.videoFormat || "video/mp4" }
                                    ]}
                                ref={this.ref}
                                onProgress= {(state) => {
                                    const t = getTelemetryByTimePlayed(this.props.missionSelected.telemetries, state.playedSeconds * 1000, this.props.missionSelected.telemInterval);
                                    if (this.t !== t ) {
                                        // optimized update process of drone position when telem has not changed
                                        this.t = t;
                                        this.props.onUpdateDroneGeometry(t.id, t.yaw, t.location, this.props.missionSelected.id);
                                    }
                                }}
                                />
                        </div>
                    </div>
                }>
                <div className="mission-detail-anomalies">
                    <Message msgId="sciadro.anomalies.detected"/>
                    <AnomaliesList onShowFrame={this.seekToFrame} videoDurationSec={this.player && this.player.getDuration()}/>
                    <br/>
                </div>
            </BorderLayout>
        );
    }
    ref = player => {
        this.player = player;
    }

    seekToFrame = (fraction = 0.5) => {
        this.player.seekTo(fraction);
    }

}

export default MissionDetail;
