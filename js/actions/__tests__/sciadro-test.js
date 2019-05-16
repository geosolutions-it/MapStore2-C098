/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import expect from "expect";
import {
    addFeatureAsset, ADD_FEATURE_ASSET,
    changeCurrentAsset, CHANGE_CURRENT_ASSET,
    changeCurrentMission, CHANGE_CURRENT_MISSION,
    changeMode, CHANGE_MODE,
    deleteAssetFeature, DELETE_FEATURE_ASSET,
    downloadFrame, DOWNLOAD_FRAME,
    downloadingFrame, DOWNLOADING_FRAME,
    drawAsset, DRAW_ASSET,
    dropFiles, DROP_MISSION_FILES,
    dropError, DROP_MISSION_FILES_ERROR,
    editAsset, EDIT_ASSET,
    editAssetPermission, EDIT_ASSET_PERMISSION,
    editMission, EDIT_MISSION,
    endSaveAsset, END_SAVE_ASSET,
    endSaveMission, END_SAVE_MISSION,
    enterCreateItem, ENTER_CREATE_ITEM,
    enterEditItem, ENTER_EDIT_ITEM,
    hideAdditionalLayer, HIDE_ADDITIONAL_LAYER,
    fileLoading, FILE_LOADING,
    loadedAssets, LOADED_ASSETS,
    loadedMissions, LOADED_MISSIONS,
    loadingAssets, LOADING_ASSETS,
    loadingAssetFeature, LOADING_ASSET_FEATURE,
    loadingMissionFeature, LOADING_MISSION_FEATURE,
    loadingMissions, LOADING_MISSIONS,
    resetCurrentAsset, RESET_CURRENT_ASSET,
    resetCurrentMission, RESET_CURRENT_MISSION,
    saveError, SAVE_ERROR,
    selectAsset, SELECT_ASSET,
    showOnMap, SHOW_ON_MAP,
    startLoadingAssets, START_LOADING_ASSETS,
    startSavingAsset, START_SAVING_ASSET,
    startSavingMission, START_SAVING_MISSION,
    selectMission, SELECT_MISSION,
    updateAsset, UPDATE_ASSET,
    updateDroneGeometry, UPDATE_DRONE_GEOMETRY,
    updateMission, UPDATE_MISSION,
    zoomToItem, ZOOM_TO_ITEM,
    downloadingFrameError,
    downloadingFrameSuccess,
    loadAssetError,
    loadMissionError,
    saveAssetSuccess,
    saveMissionSuccess,
    saveSciadroServerError,
    saveGeostoreError,
    fetchFeatureSciadroServerError
} from "@js/actions/sciadro";
import {SHOW_NOTIFICATION} from "@mapstore/actions/notifications";


describe('testing sciadro actions', () => {
    it('addFeatureAsset', () => {
        const layer = {};
        const action = addFeatureAsset(layer);
        expect(action.type).toEqual(ADD_FEATURE_ASSET);
        expect(action.layer).toEqual(layer);
    });
    it('changeCurrentAsset', () => {
        const id = 1;
        const action = changeCurrentAsset(id);
        expect(action.type).toEqual(CHANGE_CURRENT_ASSET);
        expect(action.id).toEqual(id);
    });
    it('changeCurrentMission', () => {
        const id = 1;
        const action = changeCurrentMission(id);
        expect(action.type).toEqual(CHANGE_CURRENT_MISSION);
        expect(action.id).toEqual(id);
    });
    it('changeMode', () => {
        const mode = "asset-edit";
        const action = changeMode(mode);
        expect(action.type).toEqual(CHANGE_MODE);
        expect(action.mode).toEqual(mode);
    });
    it('deleteAssetFeature', () => {
        const id = 1;
        const action = deleteAssetFeature(id);
        expect(action.type).toEqual(DELETE_FEATURE_ASSET);
        expect(action.id).toEqual(id);
    });
    it('downloadFrame', () => {
        const frame = "frame-id";
        const action = downloadFrame(frame);
        expect(action.type).toEqual(DOWNLOAD_FRAME);
        expect(action.frame).toEqual(frame);
    });
    it('downloadingFrame', () => {
        const frame = "frame-id";
        const downloading = true;
        const action = downloadingFrame(downloading, frame);
        expect(action.type).toEqual(DOWNLOADING_FRAME);
        expect(action.downloading).toEqual(downloading);
        expect(action.frame).toEqual(frame);
    });
    it('drawAsset', () => {
        const id = 1;
        const drawMethod = "Marker";
        const action = drawAsset(id, drawMethod);
        expect(action.type).toEqual(DRAW_ASSET);
        expect(action.id).toEqual(id);
        expect(action.drawMethod).toEqual(drawMethod);
    });
    it('dropFiles', () => {
        const files = "blob:url";
        const action = dropFiles(files);
        expect(action.type).toEqual(DROP_MISSION_FILES);
        expect(action.files).toEqual(files);
    });
    it('dropError', () => {
        const err = "error";
        const action = dropError(err);
        expect(action.type).toEqual(DROP_MISSION_FILES_ERROR);
        expect(action.err).toEqual(err);
    });
    it('editAsset', () => {
        const id = 1;
        const prop = "note";
        const value = "my note";
        const action = editAsset(id, prop, value);
        expect(action.type).toEqual(EDIT_ASSET);
        expect(action.id).toEqual(id);
        expect(action.prop).toEqual(prop);
        expect(action.value).toEqual(value);
    });
    it('editMission', () => {
        const id = 1;
        const prop = "note";
        const value = "my note";
        const action = editMission(id, prop, value);
        expect(action.type).toEqual(EDIT_MISSION);
        expect(action.id).toEqual(id);
        expect(action.prop).toEqual(prop);
        expect(action.value).toEqual(value);
    });
    it('editAssetPermission', () => {
        const id = 1;
        const action = editAssetPermission(id);
        expect(action.type).toEqual(EDIT_ASSET_PERMISSION);
        expect(action.id).toEqual(id);
    });
    it('endSaveAsset', () => {
        const id = 1;
        const action = endSaveAsset(id);
        expect(action.type).toEqual(END_SAVE_ASSET);
        expect(action.id).toEqual(id);
    });
    it('endSaveMission', () => {
        const id = 1;
        const action = endSaveMission(id);
        expect(action.type).toEqual(END_SAVE_MISSION);
        expect(action.id).toEqual(id);
    });
    it('enterCreateItem', () => {
        const mode = "asset-edit";
        const action = enterCreateItem(mode);
        expect(action.type).toEqual(ENTER_CREATE_ITEM);
        expect(action.mode).toEqual(mode);
    });
    it('enterEditItem', () => {
        const id = 1;
        const mode = "asset-edit";
        const action = enterEditItem(mode, id);
        expect(action.type).toEqual(ENTER_EDIT_ITEM);
        expect(action.mode).toEqual(mode);
        expect(action.id).toEqual(id);
    });
    it('hideAdditionalLayer', () => {
        const id = 1;
        const action = hideAdditionalLayer(id);
        expect(action.type).toEqual(HIDE_ADDITIONAL_LAYER);
        expect(action.id).toEqual(id);
    });
    it('fileLoading ', () => {
        const loading = true;
        const action = fileLoading(loading);
        expect(action.type).toEqual(FILE_LOADING);
        expect(action.loading).toEqual(loading);
    });
    it('loadedAssets', () => {
        const assets = [];
        const action = loadedAssets(assets);
        expect(action.type).toEqual(LOADED_ASSETS);
        expect(action.assets).toEqual(assets);
    });
    it('loadedMissions', () => {
        const missions = [{id: 3, name: "name 3"}];
        const action = loadedMissions(missions);
        expect(action.type).toEqual(LOADED_MISSIONS);
        expect(action.missions).toEqual(missions);
    });
    it('loadingAssets', () => {
        const loading = true;
        const action = loadingAssets(loading);
        expect(action.type).toEqual(LOADING_ASSETS);
        expect(action.loading).toEqual(loading);
    });
    it('loadingAssetFeature', () => {
        const loading = true;
        const action = loadingAssetFeature(loading);
        expect(action.type).toEqual(LOADING_ASSET_FEATURE);
        expect(action.loading).toEqual(loading);
    });
    it('loadingMissionFeature', () => {
        const loading = true;
        const action = loadingMissionFeature(loading);
        expect(action.type).toEqual(LOADING_MISSION_FEATURE);
        expect(action.loading).toEqual(loading);
    });
    it('loadingMissions', () => {
        const loading = true;
        const action = loadingMissions(loading);
        expect(action.type).toEqual(LOADING_MISSIONS);
        expect(action.loading).toEqual(loading);
    });
    it('resetCurrentAsset', () => {
        const action = resetCurrentAsset();
        expect(action.type).toEqual(RESET_CURRENT_ASSET);
    });
    it('resetCurrentMission', () => {
        const action = resetCurrentMission();
        expect(action.type).toEqual(RESET_CURRENT_MISSION);
    });
    it('selectAsset', () => {
        const id = 1;
        const action = selectAsset(id);
        expect(action.type).toEqual(SELECT_ASSET);
        expect(action.id).toEqual(id);
    });
    it('selectMission', () => {
        const id = 1;
        const action = selectMission(id);
        expect(action.type).toEqual(SELECT_MISSION);
        expect(action.id).toEqual(id);
    });
    it('showOnMap', () => {
        const frame = 1;
        const action = showOnMap(frame);
        expect(action.type).toEqual(SHOW_ON_MAP);
        expect(action.frame).toEqual(frame);
    });
    it('startLoadingAssets', () => {
        const action = startLoadingAssets();
        expect(action.type).toEqual(START_LOADING_ASSETS);
    });
    it('startSavingAsset', () => {
        const id = 1;
        const action = startSavingAsset(id);
        expect(action.type).toEqual(START_SAVING_ASSET);
        expect(action.id).toEqual(id);
    });
    it('startSavingMission', () => {
        const id = 1;
        const action = startSavingMission(id);
        expect(action.type).toEqual(START_SAVING_MISSION);
        expect(action.id).toEqual(id);
    });
    it('updateAsset', () => {
        const id = 1;
        const props = {};
        const action = updateAsset(props, id);
        expect(action.type).toEqual(UPDATE_ASSET);
        expect(action.id).toEqual(id);
        expect(action.props).toEqual(props);
    });
    it('updateDroneGeometry', () => {
        const telemetryId = 1;
        const yaw = 3.14;
        const geometry = {type: "Point", coordinates: [1, 3]};
        const missionId = 3;
        const action = updateDroneGeometry(telemetryId, yaw, geometry, missionId);
        expect(action.type).toEqual(UPDATE_DRONE_GEOMETRY);
        expect(action.telemetryId).toEqual(telemetryId);
        expect(action.yaw).toEqual(yaw);
        expect(action.geometry).toEqual(geometry);
        expect(action.missionId).toEqual(missionId);
    });
    it('updateMission', () => {
        const id = 1;
        const props = {};
        const action = updateMission(props, id);
        expect(action.type).toEqual(UPDATE_MISSION);
        expect(action.id).toEqual(id);
        expect(action.props).toEqual(props);
    });
    it('zoomToItem', () => {
        const zoomTo = "drone";
        const action = zoomToItem(zoomTo);
        expect(action.type).toEqual(ZOOM_TO_ITEM);
        expect(action.zoomTo).toEqual(zoomTo);
    });
    it('downloadingFrameError', () => {
        const name = "name";
        const action = downloadingFrameError(name);
        expect(action.type).toEqual(SHOW_NOTIFICATION);
        expect(action.values.name).toEqual(name);
        expect(action.message).toEqual("sciadro.missions.rest.downloadingFrameError");
    });
    it('downloadingFrameSuccess', () => {
        const name = "name";
        const action = downloadingFrameSuccess(name);
        expect(action.type).toEqual(SHOW_NOTIFICATION);
        expect(action.values.name).toEqual(name);
        expect(action.message).toEqual("sciadro.missions.rest.downloadingFrameSuccess");
    });
    it('loadAssetError', () => {
        const name = "name";
        const errorOptions = {name};
        const action = loadAssetError(errorOptions);
        expect(action.type).toEqual(SHOW_NOTIFICATION);
        expect(action.name).toEqual(name);
    });
    it('loadMissionError', () => {
        const name = "name";
        const errorOptions = {name};
        const action = loadMissionError(errorOptions);
        expect(action.type).toEqual(SHOW_NOTIFICATION);
        expect(action.name).toEqual(name);
    });
    it('saveAssetSuccess', () => {
        const name = "name";
        const action = saveAssetSuccess(name);
        expect(action.type).toEqual(SHOW_NOTIFICATION);
        expect(action.values).toEqual({name});
    });
    it('saveMissionSuccess', () => {
        const name = "name";
        const action = saveMissionSuccess(name);
        expect(action.type).toEqual(SHOW_NOTIFICATION);
        expect(action.values).toEqual({name});
    });
    it('saveSciadroServerError', () => {
        const action = saveSciadroServerError();
        expect(action.type).toEqual(SHOW_NOTIFICATION);
        expect(action.message).toEqual("sciadro.rest.saveError");
    });
    it('saveGeostoreError', () => {
        const action = saveGeostoreError();
        expect(action.type).toEqual(SHOW_NOTIFICATION);
        expect(action.message).toEqual("sciadro.assets.rest.saveError");
    });
    it('fetchFeatureSciadroServerError', () => {
        const action = fetchFeatureSciadroServerError();
        expect(action.type).toEqual(SHOW_NOTIFICATION);
        expect(action.message).toEqual("sciadro.rest.fetchFeatureError");
    });
    it('saveError', () => {
        const id = 1;
        const action = saveError(id);
        expect(action.type).toEqual(SAVE_ERROR);
        expect(action.message).toEqual("sciadro.rest.saveError");
    });
});
