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
import {isEqual} from 'lodash';
import Message from '@mapstore/components/I18N/Message';
// import ContainerDimensions from 'react-container-dimensions';


/**
 * MissionDetail
 * @class
 * @memberof components.List
*/
class MissionDetail extends React.Component {
    static propTypes = {
        anomalies: PropTypes.array,
        anomalySelected: PropTypes.object,
        anomaliesListComponent: PropTypes.func,
        config: PropTypes.object,
        controls: PropTypes.bool,
        frameSelected: PropTypes.object,
        missions: PropTypes.array,
        missionSelected: PropTypes.object,
        onUpdateDroneGeometry: PropTypes.func,
        onPausePlayer: PropTypes.func,
        onStartPlayer: PropTypes.func,
        playing: PropTypes.bool,
        progressInterval: PropTypes.number,
        videoHeight: PropTypes.string,
        videoFormat: PropTypes.string,
        videoWidth: PropTypes.string
    };
    static contextTypes = {
        messages: PropTypes.object
    };
    static defaultProps = {
        anomalies: [],
        anomalySelected: null,
        anomaliesListComponent: () => null,
        config: {
            file: {
                attributes: {
                    preload: "auto",
                    autoPlay: false
                }
            }
        },
        controls: [],
        frameSelected: null,
        missions: [],
        missionSelected: {
            videoUrl: "/assets/video/colibri.mp4"
        },
        onUpdateDroneGeometry: () => {},
        onPausePlayer: () => {},
        onStartPlayer: () => {},
        playing: false,
        progressInterval: 500,
        videoHeight: 375,
        videoFormat: "video/mp4",
        videoWidth: 500
    };

    render() {
        const AnomaliesList = this.props.anomaliesListComponent;
        return (
            <BorderLayout
                header={
                    <div className="with-flex" style={{position: "relative"}}>
                        <div className="mission-detail-header">
                            <div className="mission-detail-video-container" style={{position: "relative", width: "100%", height: "100%"}}>
                                <div className="mission-detail-player" style={{position: "absolute", width: "100%", height: "100%"}}>
                                    <div>
                                        {this.props.missionSelected.name}
                                        <br/>
                                        <Message msgId="sciadro.video"/>
                                        <br/>
                                    </div>
                                    <ReactPlayer
                                        progressInterval={this.props.progressInterval}
                                        config={this.props.config}
                                        style={{/*display: "-webkit-inline-box"*/}}
                                        width={this.props.videoWidth}
                                        controls={this.props.controls}
                                        height={this.props.videoHeight}
                                        url={[{
                                            src: this.props.missionSelected.videoUrl || "/assets/video/colibri.mp4", type: this.props.videoFormat || "video/mp4"
                                        }]}
                                        ref={this.ref}
                                        playing={this.props.playing}

                                        onPlay= {() => {
                                            this.props.onStartPlayer();
                                        }}
                                        onSeek={this.pausePlayer}
                                        onProgress= {(state) => {
                                            const telem = getTelemetryByTimePlayed(this.props.missionSelected.telemetries, state.playedSeconds * 1000, this.props.missionSelected.telemInterval);
                                            if (!isEqual(this.telem, telem) ) {
                                                // optimized update process of drone position when telem has not changed
                                                this.telem = telem;
                                                this.props.onUpdateDroneGeometry(telem.id, telem.yaw, telem.location, this.props.missionSelected.id);
                                            }
                                        }}
                                    />
                                    <div className="mission-detail-videoHighlight" style={this.createAnomalyStyle()}/>
                                </div>
                            </div>
                        </div>
                    </div>
                }>
                <div className="mission-detail-anomalies">
                    <br/>
                    <Message msgId="sciadro.anomalies.detected"/>
                    <AnomaliesList
                        onShowFrame={this.seekToFrame}
                        onPauseVideo={this.pausePlayer}
                        videoDurationSec={this.player && this.player.getDuration()}/>
                    <br/>
                </div>
            </BorderLayout>
        );
    }
    ref = player => {
        this.player = player;
    }

    createAnomalyStyle = () => {
        const missionSelected = this.props.missionSelected;
        const anomaly = this.props.anomalySelected;
        if (missionSelected.size && anomaly) {
            const {xMin, yMin, xMax, yMax} = anomaly;
            const [widthFrame, heightFrame] = missionSelected.size;
            // assuming top-left as origin (0, 0)

            const newXMin = Math.floor(xMin * this.props.videoHeight / heightFrame);
            const newXMax = Math.floor(xMax * this.props.videoHeight / heightFrame);
            const newYMin = Math.floor(yMin * this.props.videoWidth / widthFrame);
            const newYMax = Math.floor(yMax * this.props.videoWidth / widthFrame);

            const width = `${newXMax - newXMin}px`;
            const height = `${newYMax - newYMin}px`;
            const top = newXMin + 40; // 40 for header height
            const left = newYMin;
            return {
                position: "absolute",
                pointerEvents: "none",
                border: "2px red solid",
                width,
                height,
                top,
                left
            };
        }
        return {
            display: "none"
        };
    }
    seekToFrame = (fraction = 0.5) => {
        this.player.seekTo(fraction);
    }
    pausePlayer = () => {
        this.props.onPausePlayer();
    }

}

export default MissionDetail;
