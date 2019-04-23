/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

export const LOAD_ASSETS = "SCIADRO:LOAD_ASSETS";
export const EDIT_ASSET_PERMISSION = "SCIADRO:EDIT_ASSET_PERMISSION";
export const SELECT_ASSET = "SCIADRO:SELECT_ASSET";
export const LOADING_ASSETS = "SCIADRO:LOADING_ASSETS";
export const LOAD_ASSETS_ERROR = "SCIADRO:LOAD_ASSETS_ERROR";
export const LOADED_ASSETS = "SCIADRO:LOADED_ASSETS";
export const HIDE_ADDITIONAL_LAYER = "SCIADRO:HIDE_ADDITIONAL_LAYER";
export const RESET_CURRENT_ASSET = "SCIADRO:RESET_CURRENT_ASSET";
export const RESET_CURRENT_MISSION = "SCIADRO:RESET_CURRENT_MISSION";
export const CHANGE_CURRENT_ASSET = "SCIADRO:CHANGE_CURRENT_ASSET";
export const CHANGE_CURRENT_MISSION = "SCIADRO:CHANGE_CURRENT_MISSION";
export const CHANGE_MODE = "SCIADRO:CHANGE_MODE";
export const SELECT_MISSION = "SCIADRO:SELECT_MISSION";
export const LOADING_MISSIONS = "SCIADRO:LOADING_MISSIONS";
export const EDIT_ASSET = "SCIADRO:EDIT_ASSET";
export const EDIT_MISSION = "SCIADRO:EDIT_MISSION";
export const START_SAVE_ASSET = "SCIADRO:START_SAVE_ASSET";
export const END_SAVE_ASSET = "SCIADRO:END_SAVE_ASSET";
export const ADD_FEATURE_ASSET = "SCIADRO:ADD_FEATURE_ASSET";
export const UPDATE_ASSET = "SCIADRO:UPDATE_ASSET";
export const DELETE_FEATURE_ASSET = "SCIADRO:DELETE_FEATURE_ASSET";
export const DRAW_ASSET = "SCIADRO:DRAW_ASSET";
export const ADD_MISSION = "SCIADRO:ADD_MISSION";
export const ENTER_CREATE_ITEM = "SCIADRO:ENTER_CREATE_ITEM";
export const ENTER_EDIT_ITEM = "SCIADRO:ENTER_EDIT_ITEM";
export const SAVE_ERROR = "SCIADRO:SAVE_ERROR";
export const ZOOM_TO_ITEM = "SCIADRO:ZOOM_TO_ITEM";
import {error, success} from "@mapstore/actions/notifications";

export const hideAdditionalLayer = (id) => ({ type: HIDE_ADDITIONAL_LAYER, id });
export const editAssetPermission = (id) => ({ type: EDIT_ASSET_PERMISSION, id });
export const loadAssets = () => ({ type: LOAD_ASSETS });
export const selectAssets = (id) => ({ type: SELECT_ASSET, id });
export const loadingAssets = (loading) => ({ type: LOADING_ASSETS, loading });
export const loadAssetError = (e) => ({ type: LOAD_ASSETS_ERROR, e });
export const loadedAssets = (assets) => ({ type: LOADED_ASSETS, assets });
export const resetCurrentAsset = () => ({ type: RESET_CURRENT_ASSET });
export const changeCurrentAsset = (id) => ({ type: CHANGE_CURRENT_ASSET, id });
export const editAsset = (id, prop, value) => ({ type: EDIT_ASSET, id, prop, value });
export const startSaveAsset = (id) => ({ type: START_SAVE_ASSET, id });
export const endSaveAsset = (id) => ({ type: END_SAVE_ASSET, id });
export const saveError = (id) => ({ type: SAVE_ERROR, id, message: "sciadro.rest.saveError" });
export const drawAsset = (id, drawMethod) => ({ type: DRAW_ASSET, id, drawMethod });
export const addMission = (id, prop, value) => ({ type: ADD_MISSION, id, prop, value });
export const editMission = (id, prop, value) => ({ type: EDIT_MISSION, id, prop, value });
export const loadingMissions = (loading) => ({ type: LOADING_MISSIONS, loading });
export const resetCurrentMission = () => ({ type: RESET_CURRENT_MISSION });
export const changeCurrentMission = (id) => ({ type: CHANGE_CURRENT_MISSION, id });
export const selectMission = (id) => ({ type: SELECT_MISSION, id });
export const changeMode = (mode) => ({ type: CHANGE_MODE, mode });
export const createItem = (mode) => ({ type: ENTER_CREATE_ITEM, mode });
export const editItem = (mode) => ({ type: ENTER_EDIT_ITEM, mode });
export const zoomToItem = (zoom) => ({ type: ZOOM_TO_ITEM, zoom });
export const addFeatureAsset = (layer) => ({ type: ADD_FEATURE_ASSET, layer });
export const updateAsset = (props, id) => ({ type: UPDATE_ASSET, props, id });
export const deleteAssetFeature = (id) => ({ type: DELETE_FEATURE_ASSET, id});
export const saveAssetSuccess = (name) => success({message: "sciadro.assets.rest.saveSuccess", values: {name}, position: "tc", title: "Success"});
export const saveGeostoreError = (errorOptions) => error({message: "sciadro.assets.rest.saveError", position: "tc", title: "Error", ...errorOptions});
export const saveSciadroServerError = (errorOptions) => error({message: "sciadro.assets.rest.saveError", position: "tc", title: "Error", ...errorOptions});
