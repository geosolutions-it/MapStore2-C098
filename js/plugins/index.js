/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import MissionFileUpload from '@js/components/mission/MissionFileUpload';
import Toolbar from '@js/components/Toolbar';
import ToolbarGeometry from '@js/components/asset/ToolbarGeometry';
import AssetList from '@js/components/asset/AssetList';
import AssetEdit from '@js/components/asset/AssetEdit';
import AssetPermission from '@js/components/asset/AssetPermission';
import MissionList from '@js/components/mission/MissionList';
import AnomaliesList from '@js/components/mission/AnomaliesList';
import ToolbarDropzone from '@js/components/mission/ToolbarDropzone';
import MissionDetail from '@js/components/mission/MissionDetail';
import MissionEdit from '@js/components/mission/MissionEdit';

import {
    addFeatureAsset,
    changeCurrentAsset,
    changeCurrentMission,
    changeMode,
    deleteAssetFeature,
    drawAsset,
    dropError,
    dropFiles,
    editAsset,
    editAssetPermission,
    editMission,
    enterCreateItem,
    enterEditItem,
    fileLoading,
    hideAdditionalLayer,
    resetCurrentAsset,
    resetCurrentMission,
    selectAsset,
    selectMission,
    startLoadingAssets,
    startSavingAsset,
    startSavingMission,
    zoomToItem
} from '@js/actions/sciadro';

import {
    anomaliesListSelector,
    assetsListSelector,
    assetEditedSelector,
    assetSelectedSelector,
    drawMethodSelector,
    isAssetEditSelector,
    loadingAssetsSelector,
    loadingMissionsSelector,
    missionsListSelector,
    missionSelectedSelector,
    missionEditedSelector,
    missionEditedFilesSelector,
    modeSelector,
    restartLoadingAssetSelector,
    savingAssetSelector,
    savingMissionSelector,
    showErrorMessageSelector,
    showSuccessMessageSelector,
    toolbarButtonsStatusSelector
} from '@js/selectors/sciadro';
import {onShapeError, shapeLoading, onShapeChoosen, onSelectLayer, onLayerAdded, updateShapeBBox, onShapeSuccess} from '@mapstore/actions/shapefile';
import {zoomToExtent} from '@mapstore/actions/map';

export const AssetListConnected = connect(createSelector([
    assetsListSelector,
    loadingAssetsSelector,
    restartLoadingAssetSelector
], (assets, loadingAssets, reloadAsset ) => ({
    assets, loadingAssets, reloadAsset
})), {
    onStartLoadingAssets: startLoadingAssets,
    onChangeCurrentAsset: changeCurrentAsset,
    onSelectAsset: selectAsset,
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
    buttonsStatus: {
        drawGeom: drawGeom,
        deleteGeom: drawGeom,
        deleteGeomDisabled: !assetEdited.feature
    }
})), {
    onDrawAsset: drawAsset,
    onDeleteAssetFeature: deleteAssetFeature,
    onHideAdditionalLayer: hideAdditionalLayer
})(ToolbarGeometry);

export const ToolbarDropzoneConnected = connect(createSelector([
    missionEditedSelector,
    missionEditedFilesSelector
], (missionEdited, files) => ({
    missionEdited, files,
    buttonsStatus: {
        deleteFiles: true,
        deleteFilesDisabled: !files
    }
})), {
    onDropFiles: dropFiles
})(ToolbarDropzone);

export const AssetEditConnected = connect(createSelector([
    assetsListSelector,
    assetEditedSelector,
    savingAssetSelector
], (assets, assetEdited, savingAsset) => ({
    assets, assetEdited, savingAsset,
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

export const MissionFileUploadConnected = connect(createSelector([
    showErrorMessageSelector,
    showSuccessMessageSelector
], (showErrorMessage, showSuccessMessage) => ({
    showErrorMessage, showSuccessMessage
})), {
    onDropError: dropError,
    onDropFiles: dropFiles,
    onDropSuccess: () => {},
    onFileLoading: fileLoading
})(MissionFileUpload);

export const MissionEditConnected = connect(createSelector([
    missionsListSelector, missionEditedSelector, savingMissionSelector
], (missions, missionEdited, savingMission) => ({
    missions, missionEdited, savingMission,
    renderDropZone: MissionFileUploadConnected,
    renderToolbarDropzone: ToolbarDropzoneConnected
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
    toolbarButtonsStatusSelector,
    missionEditedSelector
], (assets, missions, mode, drawMethod, assetEdited,
    assetSelected, missionSelected, buttonsStatus, missionEdited) => ({

    assets, missions, mode, drawMethod, assetEdited,
    assetSelected, missionSelected, buttonsStatus, missionEdited
})), {
    onChangeMode: changeMode,
    onResetCurrentAsset: resetCurrentAsset,
    onZoomToItem: zoomToItem,
    onEnterenterCreateItem: enterCreateItem,
    onEnterEditItem: enterEditItem,
    onResetCurrentMission: resetCurrentMission,
    onStartSavingAsset: startSavingAsset,
    onStartSavingMission: startSavingMission,
    onHideAdditionalLayer: hideAdditionalLayer
})(Toolbar);
