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

/**
 * Mission MissionList
 * @class
 * @memberof components.MissionList
*/
class MissionList extends React.Component {
    static propTypes = {
        missions: PropTypes.array,
        assetName: PropTypes.string,
        selectedMission: PropTypes.string,
        onChangeCurrentMission: PropTypes.func,
        onSelectMission: PropTypes.func
    };
    static contextTypes = {
        messages: PropTypes.object
    };
    static defaultProps = {
        assetName: "",
        selectedMission: "",
        missions: [],
        onChangeCurrentMission: () => {},
        onSelectMission: () => {}
    };

    render() {

        return (
            <BorderLayout
                header={
                    <div>
                        <div className="mission-list-header">
                            {this.props.assetName}
                        </div>
                        <div className="mission-list-header">
                            Date Filter Section
                        </div>
                    </div>
                }>
            <SideGrid
                className="mission-list-container"
                size="sm"
                onItemClick = {(item) => {
                    this.props.onSelectMission(item.id);
                }}
                items={
                    this.props.missions.map(item => ({
                        id: item.id,
                        title: item.name,
                        selected: item.selected,
                        tools: <Toolbar
                            btnDefaultProps={{
                                bsStyle: 'primary',
                                className: 'square-button-md'
                            }}
                            buttons={
                                [
                                    {
                                        glyph: 'arrow-right',
                                        onClick: (e) => {
                                            e.stopPropagation();
                                            this.props.onChangeCurrentMission(item.id);
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

export default MissionList;
