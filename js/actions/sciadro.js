/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

export const ADD_FEATURE_ASSET = "SCIADRO:ADD_FEATURE_ASSET";
export const CLEAR_MISSION_DATE_FILTER = "SCIADRO:CLEAR_MISSION_DATE_FILTER";
export const CHANGE_CURRENT_ASSET = "SCIADRO:CHANGE_CURRENT_ASSET";
export const CHANGE_CURRENT_MISSION = "SCIADRO:CHANGE_CURRENT_MISSION";
export const CHANGE_MODE = "SCIADRO:CHANGE_MODE";
export const DELETE_FEATURE_ASSET = "SCIADRO:DELETE_FEATURE_ASSET";
export const DOWNLOAD_FRAME = "SCIADRO:DOWNLOAD_FRAME";
export const DOWNLOADING_FRAME = "SCIADRO:DOWNLOADING_FRAME";
export const DRAW_ASSET = "SCIADRO:DRAW_ASSET";
export const DROP_MISSION_FILES = "SCIADRO:DROP_MISSION_FILES";
export const DROP_MISSION_FILES_ERROR = "SCIADRO:DROP_MISSION_FILES_ERROR";
export const EDIT_ASSET_PERMISSION = "SCIADRO:EDIT_ASSET_PERMISSION";
export const EDIT_ASSET = "SCIADRO:EDIT_ASSET";
export const EDIT_MISSION = "SCIADRO:EDIT_MISSION";
export const END_SAVE_ASSET = "SCIADRO:END_SAVE_ASSET";
export const END_SAVE_MISSION = "SCIADRO:END_SAVE_MISSION";
export const ENTER_CREATE_ITEM = "SCIADRO:ENTER_CREATE_ITEM";
export const ENTER_EDIT_ITEM = "SCIADRO:ENTER_EDIT_ITEM";
export const HIDE_ADDITIONAL_LAYER = "SCIADRO:HIDE_ADDITIONAL_LAYER";
export const FILE_LOADING = "SCIADRO:FILE_LOADING";
export const FILTER_MISSION_BY_DATE = "SCIADRO:FILTER_MISSION_BY_DATE";
export const LOADED_ASSETS = "SCIADRO:LOADED_ASSETS";
export const LOADED_MISSIONS = "SCIADRO:LOADED_MISSIONS";
export const LOADING_ASSETS = "SCIADRO:LOADING_ASSETS";
export const LOADING_ASSET_FEATURE = "SCIADRO:LOADING_ASSET_FEATURE";
export const LOADING_MISSIONS = "SCIADRO:LOADING_MISSIONS";
export const LOADING_MISSION_FEATURE = "SCIADRO:LOADING_MISSION_FEATURE";
export const RESET_CURRENT_ASSET = "SCIADRO:RESET_CURRENT_ASSET";
export const RESET_CURRENT_MISSION = "SCIADRO:RESET_CURRENT_MISSION";
export const SAVE_ERROR = "SCIADRO:SAVE_ERROR";
export const SELECT_ASSET = "SCIADRO:SELECT_ASSET";
export const SELECT_MISSION = "SCIADRO:SELECT_MISSION";
export const SHOW_ON_MAP = "SCIADRO:SHOW_ON_MAP";
export const START_SAVING_ASSET = "SCIADRO:START_SAVING_ASSET";
export const START_SAVING_MISSION = "SCIADRO:START_SAVING_MISSION";
export const START_LOADING_ASSETS = "SCIADRO:START_LOADING_ASSETS";
export const START_LOADING_ASSETS_ERROR = "SCIADRO:START_LOADING_ASSETS_ERROR";
export const UPDATE_ASSET = "SCIADRO:UPDATE_ASSET";
export const UPDATE_DATE_FILTER_EXCEPTION = "SCIADRO:UPDATE_DATE_FILTER_EXCEPTION";
export const UPDATE_DATE_FILTER_VALUE = "SCIADRO:UPDATE_DATE_FILTER_VALUE";
export const UPDATE_DRONE_GEOMETRY = "SCIADRO:UPDATE_DRONE_GEOMETRY";
export const UPDATE_MISSION = "SCIADRO:UPDATE_MISSION";
export const ZOOM_TO_ITEM = "SCIADRO:ZOOM_TO_ITEM";

// Keep actions sorted alphabetically
/**
 * used to add asset feature taken layer generated from dropzone when editing
 * @param {object} layer in mapstore
*/
export const addFeatureAsset = (layer) => ({ type: ADD_FEATURE_ASSET, layer });
export const clearMissionDateFilter = () => ({ type: CLEAR_MISSION_DATE_FILTER });
export const changeCurrentAsset = (id) => ({ type: CHANGE_CURRENT_ASSET, id });
export const changeCurrentMission = (id) => ({ type: CHANGE_CURRENT_MISSION, id });
export const changeMode = (mode) => ({ type: CHANGE_MODE, mode });
export const deleteAssetFeature = (id) => ({ type: DELETE_FEATURE_ASSET, id});
export const downloadFrame = (frame) => ({ type: DOWNLOAD_FRAME, frame });
export const downloadingFrame = (downloading, frame) => ({ type: DOWNLOADING_FRAME, downloading, frame });
export const drawAsset = (id, drawMethod) => ({ type: DRAW_ASSET, id, drawMethod });
export const dropFiles = (files) => ({ type: DROP_MISSION_FILES, files });
export const dropError = (err) => ({ type: DROP_MISSION_FILES_ERROR, err });
export const editAsset = (id, prop, value) => ({ type: EDIT_ASSET, id, prop, value });
export const editAssetPermission = (id) => ({ type: EDIT_ASSET_PERMISSION, id });
export const editMission = (id, prop, value) => ({ type: EDIT_MISSION, id, prop, value });
export const endSaveAsset = (id) => ({ type: END_SAVE_ASSET, id });
export const endSaveMission = (id) => ({ type: END_SAVE_MISSION, id });
export const enterCreateItem = (mode) => ({ type: ENTER_CREATE_ITEM, mode });
export const enterEditItem = (mode, id) => ({ type: ENTER_EDIT_ITEM, mode, id });
export const fileLoading = (loading) => ({ type: FILE_LOADING, loading });
export const filterMissionByDate = () => ({ type: FILTER_MISSION_BY_DATE });
export const hideAdditionalLayer = (id) => ({ type: HIDE_ADDITIONAL_LAYER, id });
export const loadedAssets = (assets) => ({ type: LOADED_ASSETS, assets });
export const loadedMissions = (missions) => ({ type: LOADED_MISSIONS, missions });
export const loadingAssetFeature = (loading) => ({ type: LOADING_ASSET_FEATURE, loading });
export const loadingAssets = (loading) => ({ type: LOADING_ASSETS, loading });
export const loadingMissionFeature = (loading) => ({ type: LOADING_MISSION_FEATURE, loading });
export const loadingMissions = (loading) => ({ type: LOADING_MISSIONS, loading });
export const resetCurrentAsset = () => ({ type: RESET_CURRENT_ASSET });
export const resetCurrentMission = () => ({ type: RESET_CURRENT_MISSION });
export const saveError = (id, message) => ({ type: SAVE_ERROR, id, message: message || "sciadro.rest.saveError" });
export const selectAsset = (id) => ({ type: SELECT_ASSET, id });
export const selectMission = (id) => ({ type: SELECT_MISSION, id });
export const showOnMap = (frame) => ({ type: SHOW_ON_MAP, frame });
export const startLoadingAssets = () => ({ type: START_LOADING_ASSETS });
export const startSavingAsset = (id) => ({ type: START_SAVING_ASSET, id });
export const startSavingMission = (id) => ({ type: START_SAVING_MISSION, id });
export const updateAsset = (props, id) => ({ type: UPDATE_ASSET, props, id });
export const updateDateFilterException = (fieldRowId, error) => ({ type: UPDATE_DATE_FILTER_EXCEPTION, fieldRowId, error });
export const updateDateFilterValue = (fieldRowId, fieldName, value, attType) => ({ type: UPDATE_DATE_FILTER_VALUE, fieldRowId, fieldName, value, attType });
export const updateDroneGeometry = (telemetryId, yaw, geometry, missionId) => ({ type: UPDATE_DRONE_GEOMETRY, telemetryId, yaw, geometry, missionId});
export const updateMission = (props, id) => ({ type: UPDATE_MISSION, props, id });
export const zoomToItem = (zoomTo) => ({ type: ZOOM_TO_ITEM, zoomTo });

import {error, success} from "@mapstore/actions/notifications";

// feedbacks
// TODO we need to align the feedbacks to behave the same way
export const downloadingFrameError = (name) => error({message: "sciadro.missions.rest.downloadingFrameError", values: {name}, position: "tc", title: "Error"});
export const downloadingFrameSuccess = (name) => success({message: "sciadro.missions.rest.downloadingFrameSuccess", values: {name}, position: "tc", title: "Success"});
export const loadAssetError = (errorOptions) => error({message: "sciadro.rest.loadError", position: "tc", title: "Error", ...errorOptions});
export const loadMissionError = (errorOptions) => error({message: "sciadro.rest.loadError", position: "tc", title: "Error", ...errorOptions});
export const saveAssetSuccess = (name) => success({message: "sciadro.assets.rest.saveSuccess", values: {name}, position: "tc", title: "Success"});
export const saveMissionSuccess = (name) => success({message: "sciadro.missions.rest.saveSuccess", values: {name}, position: "tc", title: "Success"});
export const saveGeostoreError = (errorOptions) => error({message: "sciadro.assets.rest.saveError", position: "tc", title: "Error", ...errorOptions});
export const saveSciadroServerError = (errorOptions) => error({message: "sciadro.rest.saveError", position: "tc", title: "Error", ...errorOptions});
export const fetchFeatureSciadroServerError = (errorOptions) => error({message: "sciadro.rest.fetchFeatureError", position: "tc", title: "Error", ...errorOptions});
