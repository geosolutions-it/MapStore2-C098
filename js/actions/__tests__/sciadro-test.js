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
    enterCreateItem, ENTER_CREATE_ITEM,
    deleteAssetFeature, DELETE_FEATURE_ASSET,
    drawAsset, DRAW_ASSET,
    editAsset, EDIT_ASSET,
    editMission, EDIT_MISSION,
    editAssetPermission, EDIT_ASSET_PERMISSION,
    enterEditItem, ENTER_EDIT_ITEM,
    endSaveAsset, END_SAVE_ASSET,
    hideAdditionalLayer, HIDE_ADDITIONAL_LAYER,
    loadedAssets, LOADED_ASSETS,
    loadingAssets, LOADING_ASSETS,
    loadingAssetFeature, LOADING_ASSET_FEATURE,
    loadingMissions, LOADING_MISSIONS,
    resetCurrentAsset, RESET_CURRENT_ASSET,
    resetCurrentMission, RESET_CURRENT_MISSION,
    selectAssets, SELECT_ASSET,
    startLoadingAssets, START_LOADING_ASSETS,
    startSavingAsset, START_SAVING_ASSET,
    startSavingMission, START_SAVING_MISSION,
    selectMission, SELECT_MISSION,
    updateAsset, UPDATE_ASSET,
    zoomToItem, ZOOM_TO_ITEM,
    saveAssetSuccess,
    saveSciadroServerError,
    saveGeostoreError,
    fetchFeatureSciadroServerError,
    saveError, SAVE_ERROR
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
    it('enterCreateItem', () => {
        const mode = "asset-edit";
        const action = enterCreateItem(mode);
        expect(action.type).toEqual(ENTER_CREATE_ITEM);
        expect(action.mode).toEqual(mode);
    });
    it('deleteAssetFeature', () => {
        const id = 1;
        const action = deleteAssetFeature(id);
        expect(action.type).toEqual(DELETE_FEATURE_ASSET);
        expect(action.id).toEqual(id);
    });
    it('drawAsset', () => {
        const id = 1;
        const drawMethod = "Marker";
        const action = drawAsset(id, drawMethod);
        expect(action.type).toEqual(DRAW_ASSET);
        expect(action.id).toEqual(id);
        expect(action.drawMethod).toEqual(drawMethod);
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
    it('enterEditItem', () => {
        const id = 1;
        const mode = "asset-edit";
        const action = enterEditItem(mode, id);
        expect(action.type).toEqual(ENTER_EDIT_ITEM);
        expect(action.mode).toEqual(mode);
        expect(action.id).toEqual(id);
    });
    it('endSaveAsset', () => {
        const id = 1;
        const action = endSaveAsset(id);
        expect(action.type).toEqual(END_SAVE_ASSET);
        expect(action.id).toEqual(id);
    });
    it('hideAdditionalLayer', () => {
        const id = 1;
        const action = hideAdditionalLayer(id);
        expect(action.type).toEqual(HIDE_ADDITIONAL_LAYER);
        expect(action.id).toEqual(id);
    });
    it('loadedAssets', () => {
        const assets = [];
        const action = loadedAssets(assets);
        expect(action.type).toEqual(LOADED_ASSETS);
        expect(action.assets).toEqual(assets);
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
    it('selectAssets', () => {
        const id = 1;
        const action = selectAssets(id);
        expect(action.type).toEqual(SELECT_ASSET);
        expect(action.id).toEqual(id);
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
    it('selectMission', () => {
        const id = 1;
        const action = selectMission(id);
        expect(action.type).toEqual(SELECT_MISSION);
        expect(action.id).toEqual(id);
    });
    it('updateAsset', () => {
        const id = 1;
        const props = {};
        const action = updateAsset(props, id);
        expect(action.type).toEqual(UPDATE_ASSET);
        expect(action.id).toEqual(id);
    });
    it('zoomToItem', () => {
        const zoom = 1;
        const action = zoomToItem(zoom);
        expect(action.type).toEqual(ZOOM_TO_ITEM);
        expect(action.zoom).toEqual(zoom);
    });
    it('saveAssetSuccess', () => {
        const name = "name";
        const action = saveAssetSuccess(name);
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
