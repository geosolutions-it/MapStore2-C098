/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import PropTypes from 'prop-types';
import {compose} from 'recompose';
import {Col, Row} from 'react-bootstrap';

import SideGrid from '@mapstore/components/misc/cardgrids/SideGrid';
import Toolbar from '@mapstore/components/misc/toolbar/Toolbar';
import BorderLayout from '@mapstore/components/layout/BorderLayout';
import Message from '@mapstore/components/I18N/Message';
import loadingState from '@mapstore/components/misc/enhancers/loadingState';
import emptyState from '@mapstore/components/misc/enhancers/emptyState';
import LoadingWithText from '@js/components/LoadingWithText';
import withLocal from "@mapstore/components/misc/enhancers/localizedProps";
import FilterComp from "@mapstore/components/misc/Filter";
const Filter = withLocal('filterPlaceholder')(FilterComp);

const SideGridWithLoadingState = compose(
    loadingState(({loading} ) => loading, {text: <Message msgId="sciadro.missions.loading" />}, LoadingWithText),
    emptyState(
        ({loading, items = []} ) => items.length === 0 && !loading,
        {
            title: <Message msgId="sciadro.noMissions" />
        })
)(SideGrid);
/**
 * Mission MissionList
 * @class
 * @memberof components.MissionList
*/
class MissionList extends React.Component {
    static propTypes = {
        assets: PropTypes.array,
        assetCurrent: PropTypes.object,
        dateFilterComponent: PropTypes.func,
        loadingMissions: PropTypes.bool,
        filterText: PropTypes.string,
        missions: PropTypes.array,
        onChangeCurrentMission: PropTypes.func,
        onFilterMission: PropTypes.func,
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
        onFilterMission: () => {},
        onSelectMission: () => {},
        dateFilterComponent: () => null
    };

    render() {
        const asset = this.props.assetCurrent;
        const MissionDateFilter = this.props.dateFilterComponent;
        return (
            <BorderLayout
                header={
                    <div style={{ textAlign: "center" }}>
                        <div className="mission-list-header">
                            {asset.name}
                        </div>
                        <div className="mission-list-header">
                            <Row style={{ textAlign: "center", paddingLeft: "15px", paddingRight: "15px" }}>
                                <Col xs={12} style={{marginTop: "15px"}}>
                                    <Message msgId="sciadro.missions.filterByName"/>
                                </Col>
                                <Col xs={12} style={{marginTop: "15px"}}>
                                    <Filter
                                        filterPlaceholder="sciadro.missions.filterByName"
                                        filterText={this.props.filterText}
                                        onFilter={this.props.onFilterMission}
                                    />
                                </Col>
                            </Row>
                        </div>
                        <div className="mission-list-header">
                            <MissionDateFilter/>
                        </div>
                    </div>
                }>
            <SideGridWithLoadingState
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
