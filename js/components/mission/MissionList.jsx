/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import PropTypes from 'prop-types';
import {find} from 'lodash';
import {compose} from 'recompose';

import SideGrid from '@mapstore/components/misc/cardgrids/SideGrid';
import Toolbar from '@mapstore/components/misc/toolbar/Toolbar';
import BorderLayout from '@mapstore/components/layout/BorderLayout';
import loadingState from '@mapstore/components/misc/enhancers/loadingState';
import emptyState from '@mapstore/components/misc/enhancers/emptyState';
import Message from '@mapstore/components/I18N/Message';
import LoadingWithText from '@js/components/LoadingWithText';
const SideGridEnhanced = compose(
    loadingState(({loading} ) => loading, {text: "Loading Missions"}, LoadingWithText),
    emptyState( // TODO verify if we want this empty state enhancer
        ({loading, items = []} ) => items.length === 0 && !loading,
        {
            title: <Message msgId="sciadro.no-missions" />
        })
)(SideGrid);
/**
 * Mission MissionList
 * @class
 * @memberof components.MissionList
*/
class MissionList extends React.Component {
    static propTypes = {
        missions: PropTypes.array,
        assets: PropTypes.array,
        loadingMissions: PropTypes.bool,
        onChangeCurrentMission: PropTypes.func,
        onSelectMission: PropTypes.func
    };
    static contextTypes = {
        messages: PropTypes.object
    };
    static defaultProps = {
        assets: [],
        loadingMissions: false,
        missions: [],
        onChangeCurrentMission: () => {},
        onSelectMission: () => {}
    };

    render() {
        const asset = find(this.props.assets, a => a.current) || {};

        return (
            <BorderLayout
                header={
                    <div>
                        <div className="mission-list-header">
                            {asset.name}
                        </div>
                        <div className="mission-list-header">
                            Date Filter Section
                        </div>
                    </div>
                }>
            <SideGridEnhanced
                loading={this.props.loadingMissions}
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
                                        tooltipId: "sciadro.missions.detail",
                                        glyph: 'arrow-right',
                                        loading: item.loadingFeature,
                                        disabled: item.loadingFeature,
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
