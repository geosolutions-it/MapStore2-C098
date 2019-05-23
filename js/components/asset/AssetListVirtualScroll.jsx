/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import {compose, setObservableConfig, mapPropsStreamWithConfig} from 'recompose';
import {isNil, castArray} from 'lodash';
import * as Rx from 'rxjs';
import Message from '@mapstore/components/I18N/Message';
import GeoStoreApi from "@mapstore/api/GeoStoreDAO";
import BorderLayout from '@mapstore/components/layout/BorderLayout';
import LoadingSpinner from '@mapstore/components/misc/LoadingSpinner';
import withInfiniteScroll from '@mapstore/components/misc/enhancers/infiniteScroll/withInfiniteScroll';
import loadingState from '@mapstore/components/misc/enhancers/loadingState';
import emptyState from '@mapstore/components/misc/enhancers/emptyState';
import withControllableState from '@mapstore/components/misc/enhancers/withControllableState';
import Toolbar from '@mapstore/components/misc/toolbar/Toolbar';

import AssetFilter from '@js/components/asset/AssetFilter';
import LoadingWithText from '@js/components/LoadingWithText';

import rxjsConfig from 'recompose/rxjsObservableConfig';
setObservableConfig(rxjsConfig);
const mapPropsStream = mapPropsStreamWithConfig(rxjsConfig);

import SideGrid from '@mapstore/components/misc/cardgrids/SideGrid';
const SideGridEnhanced = compose(
    loadingState(({loading}) => loading, {text: <Message msgId="sciadro.assets.loading" />}, LoadingWithText),
    emptyState(
        ({loading, items = []} ) => items.length === 0 && !loading,
        {
            title: <Message msgId="sciadro.no-assets" />
        })
)(SideGrid);
/*
 * converts record item into a item for SideGrid
 */
const resToProps = ({result = {}}) => {
    const {results, totalCount} = result;
    return {
        items: (totalCount > 0 ? castArray(results) : []).map((record = {}) => (record)),
        total: totalCount
    };
};
const PAGE_SIZE = 20;
/*
 * retrieves data from a the sciadro backend and converts to props
 */
const loadPage = ({text}, page = 0) => Rx.Observable
    .fromPromise(GeoStoreApi.getResourcesByCategory("ASSET", text, {params: {start: page * PAGE_SIZE, limit: PAGE_SIZE, includeAttributes: true}}))
    .map((result) => ({result}))
    .map(resToProps);
// TODO manage errors here

const scrollSpyOptions = {querySelector: ".ms2-border-layout-body-asset", pageSize: PAGE_SIZE};
/**
 * AssetList component, with infinite scroll.
 * You can simply pass the catalog to browse and the handler onSelectAsset.
 * @example
 * <AssetList catalog={type: "csw", url: "..."} onSelected={selected => console.log(selected)} />
 * @name AssetList
 * @memberof components.catalog
 * @prop {object} catalog the definition of the selected catalog as `{type: "wms"|"wmts"|"csw", url: "..."}`
 * @prop {object} selected the record selected. Passing this will show it as selected (highlighted) in the list. It will compare record's `identifier` property to guess the selected record in the list
 * @prop {function} onSelectAsset
 * @prop {string} [searchText] the search text (if you want to control it)
 * @prop {function} [setSearchText] handler to get search text changes (if not defined, the component will control the text by it's own)
 */
module.exports = compose(
        withControllableState('searchText', "setSearchText", ""),
        withInfiniteScroll({loadPage, scrollSpyOptions, hasMore: ({total, items}) => total > items.length}),
        mapPropsStream( props$ =>
            props$
            .merge(props$.take(1)
                .switchMap(({asset, loadFirst = () => {} }) =>
                props$
                    .debounceTime(500)
                    .startWith({searchText: "", asset})
                    .distinctUntilKeyChanged('searchText')
                    .do(({searchText, asset: nextAsset} = {}) => loadFirst({text: searchText, asset: nextAsset}))
                    .ignoreElements() // don't want to emit props
                )
            ).merge(
                props$
                .distinctUntilKeyChanged('items')
                .do(({items, onSetResults}) => onSetResults(items))
            )
        )
)(({
    setSearchText = () => {},
    onSelectAsset = () => {},
    onChangeCurrentAsset = () => {},
    assetSelected,
    loading,
    searchText,
    items = [],
    total,
    title
}) => {
    return (<BorderLayout
                className="asset-list"
                bodyClassName="ms2-border-layout-body-asset"
                header={<AssetFilter title={title} searchText={searchText} onSearchTextChange={(t) => {
                    setSearchText(t);
                }}/>}
                footer={<div className="asset-footer">
                    <span>{loading ? <LoadingSpinner /> : null}</span>
                    {!isNil(total) ? <span className="res-info"><Message msgId="sciadro.pageInfoInfinite" msgParams={{loaded: items.length, total}}/></span> : null}
                </div>}>
                <SideGridEnhanced
                    loading={loading}
                    onItemClick={(item = {}) => onSelectAsset(item.id)}
                    size="sm"
                    items={items.map(item => ({
                        id: item.id,
                        title: item.name,
                        selected: assetSelected && item.id === assetSelected.id,
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
                                            onChangeCurrentAsset(item.id);
                                        }
                                    }
                                ]
                            }/>
                    }))}
                />
            </BorderLayout>);
});
