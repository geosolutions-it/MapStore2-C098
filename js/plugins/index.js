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
import ToolbarGeometry from '@js/components/asset/ToolbarGeometry';
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
    saveAsset,
    addMission,
    drawAsset,
    hideAdditionalLayer,
    editAssetPermission,
    zoomToItem,
    createItem,
    editItem,
    addFeatureAsset,
    deleteAssetFeature
} from '@js/actions/sciadro';

import {
    assetsListSelector,
    missionsListSelector,
    anomaliesListSelector,
    modeSelector,
    drawMethodSelector,
    loadingAssetsSelector,
    loadingMissionsSelector,
    reloadAssetSelector,
    assetEditedSelector,
    assetSelectedSelector,
    missionSelectedSelector,
    toolbarButtonsVisibilitySelector,
    isAssetEditSelector
} from '@js/selectors/sciadro';
import {onShapeError, shapeLoading, onShapeChoosen, onSelectLayer, onLayerAdded, updateShapeBBox, onShapeSuccess} from '@mapstore/actions/shapefile';
import {zoomToExtent} from '@mapstore/actions/map';

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

import ShapeFile from '@mapstore/plugins/shapefile/ShapeFile';
export const ShapeFileConnected = connect((state) => (
    {
        mapType: "openlayers",
        visible: modeSelector(state) === "asset-edit",
        layers: state.shapefile && state.shapefile.layers || null,
        selected: state.shapefile && state.shapefile.selected || null,
        bbox: state.shapefile && state.shapefile.bbox || null,
        success: state.shapefile && state.shapefile.success || null,
        error: state.shapefile && state.shapefile.error || null,
        shapeStyle: state.style || {}
    }
), {
    onShapeChoosen: onShapeChoosen,
    onShapeError: onShapeError,
    onLayerAdded: onLayerAdded,
    onSelectLayer: onSelectLayer,
    onShapeSuccess: onShapeSuccess,
    addShapeLayer: addFeatureAsset,
    onZoomSelected: zoomToExtent,
    updateShapeBBox: updateShapeBBox,
    shapeLoading: shapeLoading
})(ShapeFile);

export const ToolbarGeomConnected = connect(createSelector([
    assetsListSelector,
    modeSelector,
    drawMethodSelector,
    assetEditedSelector,
    isAssetEditSelector
], (assets, mode, drawMethod, assetEdited, drawGeom) => ({
    assets, mode, drawMethod, assetEdited, drawGeom,
    buttonsVisibility: {
        drawGeom: drawGeom,
        deleteGeom: drawGeom,
        deleteGeomDisabled: !assetEdited.feature
    }
})), {
    onDrawAsset: drawAsset,
    onDeleteAssetFeature: deleteAssetFeature,
    onHideAdditionalLayer: hideAdditionalLayer
})(ToolbarGeometry);

export const AssetEditConnected = connect(createSelector([
    assetsListSelector,
    assetEditedSelector
], (assets, assetEdited) => ({
    assets, assetEdited,
    renderDropZone: ShapeFileConnected,
    renderToolbarGeom: ToolbarGeomConnected
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
    assetEditedSelector,
    assetSelectedSelector,
    missionSelectedSelector,
    toolbarButtonsVisibilitySelector
], (assets, missions, mode, drawMethod, assetEdited,
    assetSelected, missionSelected, buttonsVisibility) => ({

    assets, missions, mode, drawMethod, assetEdited,
    assetSelected, missionSelected, buttonsVisibility
})), {
    onChangeMode: changeMode,
    onResetCurrentAsset: resetCurrentAsset,
    onZoomToItem: zoomToItem,
    onCreateItem: createItem,
    onEditItem: editItem,
    onResetCurrentMission: resetCurrentMission,
    onSaveAsset: saveAsset,
    onAddMission: addMission,
    onHideAdditionalLayer: hideAdditionalLayer
})(Toolbar);
