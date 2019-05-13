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


/**
 * MissionDetail
 * @class
 * @memberof components.List
*/
class MissionDetail extends React.Component {
    static propTypes = {
        anomalies: PropTypes.array,
        missions: PropTypes.array,
        missionSelected: PropTypes.object,
        renderAnomaliesList: PropTypes.func
    };
    static contextTypes = {
        messages: PropTypes.object
    };
    static defaultProps = {
        anomalies: [],
        missions: [],
        missionSelected: {}
    };

    render() {
        const mission = find(this.props.missions, a => a.selected);
        const AnomaliesList = this.props.renderAnomaliesList;
        return (
            <BorderLayout
                header={
                    <div>
                        <div className="mission-detail-header">
                            {mission.name}
                            <br/>
                            Video
                            <br/>
                            <ReactPlayer
                                ref={this.ref}
                                onReady= {() => {
                                    console.log('onReady');
                                }}
                                onStart= {() => {
                                    console.log('onStart');
                                }}
                                onPlay= {() => {
                                    console.log('onPlay');
                                }}
                                onPause= {() => {
                                    console.log('onPause');
                                }}
                                onSeek= {(s) => {
                                    console.log('onSeek ', s);
                                    // call seekTo and change drone location
                                }}

                                config={{
                                    file: {
                                        attributes: {
                                            preload: "auto",
                                            autoPlay: false
                                        }
                                    }
                                }}

                                onDuration={(duration) => {
                                    console.log('onDuration', duration, "s");
                                }}
                                style={{/*display: "-webkit-inline-box"*/}}
                                width="100%"
                                controls
                                height={260}
                                url={[
                                        {src: "http://localhost:8081/assets/video/colibri.mp4", type: "video/mp4"}
                                    ]}/>
                        </div>
                    </div>
                }>
                <div className="mission-detail-anomalies">
                    Detected Anomalies
                    <AnomaliesList onShowFrame={this.seekToFrame}/>
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
