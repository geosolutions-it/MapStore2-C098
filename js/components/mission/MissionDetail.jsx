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
import {pick} from 'lodash';
import AnomaliesList from './AnomaliesList';

/**
 * Mission List
 * @class
 * @memberof components.List
*/
class MissionDetail extends React.Component {
    static propTypes = {
        missions: PropTypes.array,
        anomalies: PropTypes.array
    };
    static contextTypes = {
        messages: PropTypes.object
    };
    static defaultProps = {
        missions: [],
        anomalies: []
    };

    render() {
        const mission = find(this.props.missions, a => a.selected);
        const anomaliesProps = pick(this.props, ["anomalies"]);
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
                                style={{/*display: "-webkit-inline-box"*/}}
                                width="100%"
                                controls
                                height={260}
                                url="https://www.youtube.com/watch?v=ysz5S6PUM-U" />
                        </div>
                    </div>
                }>
                <div className="mission-detail-anomalies">
                    Detected Anomalies
                    <AnomaliesList
                        {...anomaliesProps}
                        />
                    <br/>
                </div>
            </BorderLayout>
        );
    }
}

export default MissionDetail;
