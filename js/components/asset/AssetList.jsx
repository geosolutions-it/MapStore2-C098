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

import SideGrid from '@mapstore/components/misc/cardgrids/SideGrid';
import Toolbar from '@mapstore/components/misc/toolbar/Toolbar';
import BorderLayout from '@mapstore/components/layout/BorderLayout';
// import Filter from '@mapstore/components/misc/Filter';
import Message from '@mapstore/components/I18N/Message';
import emptyState from '@mapstore/components/misc/enhancers/emptyState';
import loadingState from '@mapstore/components/misc/enhancers/loadingState';
import LoadingWithText from '@js/components/LoadingWithText';
const SideGridWithLoadingState = compose(
    loadingState(({loading}) => loading, {text: "Loading Assets"}, LoadingWithText),
    emptyState( // TODO verify if we want this empty state enhancer
        ({loading, items = []} ) => items.length === 0 && !loading,
        {
            title: <Message msgId="sciadro.no-assets" />
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
        loadingAssets: PropTypes.bool,
        reloadAsset: PropTypes.bool,
        className: PropTypes.string,
        onStartLoadingAssets: PropTypes.func,
        onEditAssetPermission: PropTypes.func,
        onHideAdditionalLayer: PropTypes.func,
        onSelectAsset: PropTypes.func,
        onChangeCurrentAsset: PropTypes.func
    };
    static contextTypes = {
        messages: PropTypes.object
    };
    static defaultProps = {
        assets: [],
        loadingAssets: false,
        reloadAsset: true,
        onStartLoadingAssets: () => {},
        onSelectAsset: () => {},
        onEditAssetPermission: () => {},
        onHideAdditionalLayer: () => {},
        onChangeCurrentAsset: () => {},
        className: "asset-list-container"
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
                    <div style={{ padding: 8, textAlign: "center" }}>
                        Filter assets {/*<Filter filterPlaceholder="Filter assets..."/>*/}
                    </div>
                }>
                <SideGridWithLoadingState
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
                                    bsStyle: 'primary',
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
