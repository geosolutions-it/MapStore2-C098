/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

export const LOAD_ASSETS = "SCIADRO:LOAD_ASSETS";
export const LOAD_ASSETS_ERROR = "SCIADRO:LOAD_ASSETS_ERROR";
export const LOADED_ASSETS = "SCIADRO:LOADED_ASSETS";

export const RESET_CURRENT_ASSET = "SCIADRO:RESET_CURRENT_ASSET";
export const RESET_CURRENT_MISSION = "SCIADRO:RESET_CURRENT_MISSION";
export const CHANGE_CURRENT_ASSET = "SCIADRO:CHANGE_CURRENT_ASSET";
export const CHANGE_CURRENT_MISSION = "SCIADRO:CHANGE_CURRENT_MISSION";
export const CHANGE_MODE = "SCIADRO:CHANGE_MODE";
export const SELECT_MISSION = "SCIADRO:SELECT_MISSION";

export const loadAssets = () => ({ type: LOAD_ASSETS });
export const loadAssetError = (e) => ({ type: LOAD_ASSETS_ERROR, e });
export const loadedAssets = (assets) => ({ type: LOADED_ASSETS, assets });

export const resetCurrentAsset = () => ({ type: RESET_CURRENT_ASSET });
export const resetCurrentMission = () => ({ type: RESET_CURRENT_MISSION });

export const changeCurrentAsset = (id) => ({ type: CHANGE_CURRENT_ASSET, id });
export const changeMode = (mode) => ({ type: CHANGE_MODE, mode });
export const changeCurrentMission = (id) => ({ type: CHANGE_CURRENT_MISSION, id });

export const selectMission = (id) => ({ type: SELECT_MISSION, id });
