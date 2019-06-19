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
import emptyState from '@mapstore/components/misc/enhancers/emptyState';
import loadingState from '@mapstore/components/misc/enhancers/loadingState';
import LoadingWithText from '@js/components/LoadingWithText';
import withLocal from "@mapstore/components/misc/enhancers/localizedProps";
import FilterComp from "@mapstore/components/misc/Filter";
const Filter = withLocal('filterPlaceholder')(FilterComp);

const SideGridWithLoadingState = compose(
    loadingState(({loading}) => loading, {text: <Message msgId="sciadro.assets.loading"/>}, LoadingWithText),
    loadingState(({deleting}) => deleting, {text: <Message msgId="sciadro.assets.deleting"/>}, LoadingWithText),
    emptyState(
        ({loading, items = []} ) => items.length === 0 && !loading,
        {
            title: <Message msgId="sciadro.noAssets" />
        })
)(SideGrid);

/**
 * Asset List
 * @class
 * @memberof components.AssetList
*/
class AssetList extends React.Component {
    static propTypes = {
        assets: PropTypes.array,
        className: PropTypes.string,
        filterText: PropTypes.string,
        deleting: PropTypes.bool,
        loadingAssets: PropTypes.bool,
        onChangeCurrentAsset: PropTypes.func,
        onEditAssetPermission: PropTypes.func,
        onFilterAsset: PropTypes.func,
        onHideAdditionalLayer: PropTypes.func,
        onSelectAsset: PropTypes.func,
        onStartLoadingAssets: PropTypes.func,
        reloadAsset: PropTypes.bool
    };
    static contextTypes = {
        messages: PropTypes.object
    };
    static defaultProps = {
        assets: [],
        className: "asset-list-container",
        filterText: "a",
        deleting: false,
        loadingAssets: false,
        onChangeCurrentAsset: () => {},
        onEditAssetPermission: () => {},
        onFilterAsset: () => {},
        onHideAdditionalLayer: () => {},
        onStartLoadingAssets: () => {},
        onSelectAsset: () => {},
        reloadAsset: true
    };

    componentWillMount() {
        if (this.props.reloadAsset) {
            this.props.onStartLoadingAssets();
        }
    }
    render() {

        return (
            <BorderLayout
                header={
                    <Row style={{ textAlign: "center", paddingLeft: "30px", paddingRight: "30px" }}>
                        <Col xs={12}>
                            <Message msgId="sciadro.assets.filterByName"/>
                        </Col>
                        <Col xs={12} style={{marginTop: "15px"}}>
                            <Filter
                                filterPlaceholder="sciadro.assets.filterByName"
                                filterText={this.props.filterText}
                                onFilter={this.props.onFilterAsset}
                                />
                        </Col>
                    </Row>
                }>
                <SideGridWithLoadingState
                    deleting={this.props.deleting}
                    loading={this.props.loadingAssets}
                    className={this.props.className}
                    size="sm"
                    onItemClick= {(item) => {
                        this.props.onSelectAsset(item.id);
                    }}
                    items={
                        this.props.assets.map(item => ({
                            id: item.id,
                            title: item.name,
                            selected: item.selected,
                            tools: <Toolbar
                                btnDefaultProps={{
                                    bsStyle: item.selected ? 'success' : 'primary',
                                    className: 'square-button-md'
                                }}
                                buttons={
                                    [
                                        {
                                            tooltipId: "sciadro.assets.detail",
                                            glyph: 'arrow-right',
                                            loading: item.loadingFeature,
                                            disabled: item.loadingFeature,
                                            onClick: (e) => {
                                                e.stopPropagation();
                                                this.props.onChangeCurrentAsset(item.id);
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

export default AssetList;
