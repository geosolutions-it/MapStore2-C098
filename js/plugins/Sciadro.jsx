/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import assign from 'object-assign';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import Container from '../components/Container';
import sciadro from '../reducers/sciadro';
import * as sciadroEpics from '../epics/sciadro';
import {
    loadAssets,
    selectAssets,
    changeCurrentAsset,
    changeMode,
    resetCurrentAsset,
    resetCurrentMission,
    selectMission,
    changeCurrentMission,
    editAsset,
    editMission,
    addAsset,
    addMission,
    drawAsset,
    hideAdditionalLayer,
    editAssetPermission
} from '../actions/sciadro';
import {
    enabledSelector,
    assetsListSelector,
    missionsListSelector,
    anomaliesListSelector,
    modeSelector,
    drawMethodSelector,
    saveDisabledSelector,
    loadingAssetsSelector,
    loadingMissionsSelector,
    reloadAssetSelector
} from '../selectors/sciadro';

/**
 * Sciadro plugins allows to manage Assets and Missions
 * @class
 * @memberof plugins
 * @prop {boolean} [show] show the opened main panel default true
*/

const Sciadro = connect(createSelector([
    enabledSelector,
    assetsListSelector,
    missionsListSelector,
    anomaliesListSelector,
    modeSelector,
    drawMethodSelector,
    saveDisabledSelector,
    loadingAssetsSelector,
    loadingMissionsSelector,
    reloadAssetSelector
], (show, assets, missions, anomalies, mode, drawMethod, saveDisabled, loadingAssets, loadingMissions,
    reloadAsset ) => ({
    show, assets, missions, anomalies, mode, drawMethod, saveDisabled, loadingAssets, loadingMissions,
    reloadAsset
})), {
    onLoadAssets: loadAssets,
    onSelectAsset: selectAssets,
    onChangeCurrentAsset: changeCurrentAsset,
    onChangeMode: changeMode,
    onAddAsset: addAsset,
    onAddMission: addMission,
    onEditAsset: editAsset,
    onEditMission: editMission,
    onDrawAsset: drawAsset,
    onResetCurrentAsset: resetCurrentAsset,
    onResetCurrentMission: resetCurrentMission,
    onSelectMission: selectMission,
    onHideAdditionalLayer: hideAdditionalLayer,
    onChangeCurrentMission: changeCurrentMission,
    onEditAssetPermission: editAssetPermission
})(Container);

export const SciadroPlugin = assign(Sciadro);
export const reducers = { sciadro };
export const epics = sciadroEpics;
