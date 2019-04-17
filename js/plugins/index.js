/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import Toolbar from '@js/components/Toolbar';
import AssetList from '@js/components/asset/AssetList';
import AssetEdit from '@js/components/asset/AssetEdit';
import AssetPermission from '@js/components/asset/AssetPermission';
import MissionList from '@js/components/mission/MissionList';
import AnomaliesList from '@js/components/mission/AnomaliesList';
import MissionDetail from '@js/components/mission/MissionDetail';
import MissionEdit from '@js/components/mission/MissionEdit';

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
    editAssetPermission,
    zoomToItem,
    createItem,
    editItem
} from '@js/actions/sciadro';

import {
    assetsListSelector,
    missionsListSelector,
    anomaliesListSelector,
    modeSelector,
    drawMethodSelector,
    saveDisabledSelector,
    loadingAssetsSelector,
    loadingMissionsSelector,
    reloadAssetSelector,
    assetEditedSelector,
    assetSelectedSelector,
    assetNewSelector,
    missionSelectedSelector,
    toolbarButtonsVisibilitySelector
} from '@js/selectors/sciadro';

export const AssetListConnected = connect(createSelector([
    assetsListSelector,
    loadingAssetsSelector,
    reloadAssetSelector
], (assets, loadingAssets, reloadAsset ) => ({
    assets, loadingAssets, reloadAsset
})), {
    onLoadAssets: loadAssets,
    onChangeCurrentAsset: changeCurrentAsset,
    onSelectAsset: selectAssets,
    onHideAdditionalLayer: hideAdditionalLayer,
    onEditAssetPermission: editAssetPermission,
    onChangeCurrentMission: changeCurrentMission
})(AssetList);

export const AssetEditConnected = connect(createSelector([
    assetsListSelector,
    assetEditedSelector,
    assetNewSelector
], (assets, assetEdited, assetNew) => ({
    assets, assetEdited, assetNew
})), {
    onEditAsset: editAsset
})(AssetEdit);

export const AssetPermissionConnected = connect(createSelector([
    assetsListSelector
], (assets) => ({
    assets
})), {
     // action: actionCreator
})(AssetPermission);

export const MissionListConnected = connect(createSelector([
    assetsListSelector,
    missionsListSelector,
    loadingMissionsSelector
], (assets, missions, loadingMissions) => ({
    assets, missions, loadingMissions
})), {
    onSelectMission: selectMission,
    onChangeCurrentMission: changeCurrentMission
})(MissionList);

export const MissionEditConnected = connect(createSelector([
    missionsListSelector
], (missions) => ({
    missions
})), {
    onEditMission: editMission
})(MissionEdit);

export const AnomaliesListConnected = connect(createSelector([
    anomaliesListSelector
], (anomalies) => ({
    anomalies
})), {
    // action: actionCreator
})(AnomaliesList);

export const MissionDetailConnected = connect(createSelector([
    modeSelector,
    missionsListSelector
], (mode, missions) => ({
    mode, missions,
    renderAnomaliesList: AnomaliesListConnected
})), {
    // action: actionCreator
})(MissionDetail);


export const ToolbarConnected = connect(createSelector([
    assetsListSelector,
    missionsListSelector,
    modeSelector,
    drawMethodSelector,
    saveDisabledSelector,
    assetEditedSelector,
    assetNewSelector,
    assetSelectedSelector,
    missionSelectedSelector,
    toolbarButtonsVisibilitySelector
], (assets, missions, mode, drawMethod, saveDisabled, assetEdited,
    assetNew, assetSelected, missionSelected, buttonsVisibility) => ({

    assets, missions, mode, drawMethod, saveDisabled, assetEdited,
    assetNew, assetSelected, missionSelected, buttonsVisibility
})), {
    onChangeMode: changeMode,
    onResetCurrentAsset: resetCurrentAsset,
    onZoomToItem: zoomToItem,
    onCreateItem: createItem,
    onEditItem: editItem,
    onResetCurrentMission: resetCurrentMission,
    onAddAsset: addAsset,
    onAddMission: addMission,
    onDrawAsset: drawAsset,
    onHideAdditionalLayer: hideAdditionalLayer
})(Toolbar);
