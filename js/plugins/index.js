/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import AnomaliesList from '@js/components/mission/AnomaliesList';
import AssetList from '@js/components/asset/AssetList';
import AssetListVirtualScroll from '@js/components/asset/AssetListVirtualScroll';
import AssetEdit from '@js/components/asset/AssetEdit';
import AssetPermission from '@js/components/asset/AssetPermission';
import MissionDetail from '@js/components/mission/MissionDetail';
import MissionEdit from '@js/components/mission/MissionEdit';
import MissionFileUpload from '@js/components/mission/MissionFileUpload';
import MissionList from '@js/components/mission/MissionList';
import Toolbar from '@js/components/Toolbar';
import ToolbarGeometry from '@js/components/asset/ToolbarGeometry';
import ToolbarDropzone from '@js/components/mission/ToolbarDropzone';
import MissionDateFilter from '@js/components/mission/MissionDateFilter';

import {
    addFeatureAsset,
    clearMissionDateFilter,
    changeCurrentAsset,
    changeCurrentMission,
    deleteAssetFeature,
    drawAsset,
    downloadFrame,
    dropError,
    dropFiles,
    editAsset,
    editAssetPermission,
    editMission,
    enterCreateItem,
    enterEditItem,
    fileLoading,
    filterMissionByDate,
    hideAdditionalLayer,
    highlightAnomaly,
    loadedAssets,
    pausePlayer,
    resetCurrentAsset,
    resetCurrentMission,
    selectAsset,
    selectMission,
    startLoadingAssets,
    startPlayer,
    startSavingAsset,
    startSavingMission,
    updateDateFilterValue,
    updateDateFilterException,
    updateDroneGeometry,
    zoomToItem
} from '@js/actions/sciadro';

import {
    anomalySelectedSelector,
    anomaliesListSelector,
    assetsListSelector,
    assetCurrentSelector,
    assetEditedSelector,
    assetSelectedSelector,
    dateFilterSelector,
    drawMethodSelector,
    isAssetEditSelector,
    loadingAssetsSelector,
    loadingMissionsSelector,
    missionsListSelector,
    missionCurrentSelector,
    missionSelectedSelector,
    missionEditedSelector,
    missionEditedFilesSelector,
    modeSelector,
    playingSelector,
    restartLoadingAssetSelector,
    savingAssetSelector,
    savingMissionSelector,
    showErrorMessageSelector,
    showSuccessMessageSelector,
    toolbarButtonsStatusSelector
} from '@js/selectors/sciadro';
import {userSelector} from '@mapstore/selectors/security';
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

export const AssetListVirtualScrollConnected = connect(createSelector([
    assetSelectedSelector,
    assetsListSelector
], (assetSelected, items ) => ({
    assetSelected, items
})), {
    onStartLoadingAssets: startLoadingAssets,
    onChangeCurrentAsset: changeCurrentAsset,
    onSelectAsset: selectAsset,
    onSetResults: loadedAssets,
    onHideAdditionalLayer: hideAdditionalLayer,
    onEditAssetPermission: editAssetPermission,
    onChangeCurrentMission: changeCurrentMission
})(AssetListVirtualScroll);

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

export const AssetPermissionConnected = connect(createSelector([
    assetEditedSelector,
    userSelector
], (assetEdited, user) => ({
    assetEdited, user
})), {
    // action: actionCreator
})(AssetPermission);

export const AssetEditConnected = connect(createSelector([
    assetsListSelector,
    assetEditedSelector,
    savingAssetSelector
], (assets, assetEdited, savingAsset) => ({
    assets, assetEdited, savingAsset,
    dropZoneComponent: ShapeFileConnected,
    assetPermissionComponent: AssetPermissionConnected,
    toolbarGeometryComponent: ToolbarGeomConnected
})), {
    onEditAsset: editAsset
})(AssetEdit);


export const MissionDateFilterConnected = connect(createSelector([
    dateFilterSelector
], (dateFilter) => ({
    dateFilter
})), {
    onUpdateDateFilterValue: updateDateFilterValue,
    onUpdateDateFilterException: updateDateFilterException
})(MissionDateFilter);

export const MissionListConnected = connect(createSelector([
    assetCurrentSelector,
    assetsListSelector,
    missionsListSelector,
    loadingMissionsSelector
], (assetCurrent, assets, missions, loadingMissions) => ({
    assetCurrent, assets, missions, loadingMissions,
    dateFilterComponent: MissionDateFilterConnected
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
    dropZoneComponent: MissionFileUploadConnected,
    toolbarDropzoneComponent: ToolbarDropzoneConnected
})), {
    onEditMission: editMission
})(MissionEdit);

export const AnomaliesListConnected = connect(createSelector([
    anomaliesListSelector,
    missionCurrentSelector
], (anomalies, missionCurrent) => ({
    anomalies, missionCurrent
})), {
    onDownloadFrame: downloadFrame,
    onHighlightAnomaly: highlightAnomaly
})(AnomaliesList);

export const MissionDetailConnected = connect(createSelector([
    modeSelector,
    missionsListSelector,
    missionSelectedSelector,
    playingSelector,
    anomalySelectedSelector
], (mode, missions, missionSelected, playing, anomalySelected) => ({
    mode, missions, missionSelected, playing, anomalySelected,
    anomaliesListComponent: AnomaliesListConnected
})), {
    onPausePlayer: pausePlayer,
    onStartPlayer: startPlayer,
    onUpdateDroneGeometry: updateDroneGeometry
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
    onClearMissionDateFilter: clearMissionDateFilter,
    onEnterCreateItem: enterCreateItem,
    onEnterEditItem: enterEditItem,
    onFilterMissionByDate: filterMissionByDate,
    onHideAdditionalLayer: hideAdditionalLayer,
    onResetCurrentAsset: resetCurrentAsset,
    onResetCurrentMission: resetCurrentMission,
    onStartSavingAsset: startSavingAsset,
    onStartSavingMission: startSavingMission,
    onZoomToItem: zoomToItem
})(Toolbar);
