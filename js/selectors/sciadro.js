/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import {get, find} from 'lodash';

export const enabledSelector = state => get(state, "controls.sciadro.enabled", false);

export const currentAssetSelector = state => get(state, "sciadro.currentAsset", null);
export const currentMissionSelector = state => get(state, "sciadro.currentMission", null);

export const assetsListSelector = state => get(state, "sciadro.assets", []);
export const anomaliesListSelector = state => get(state, "sciadro.anomalies", []);
export const missionsListSelector = state => get(state, "sciadro.missions", []);

export const selectedAssetSelector = state => state && find(assetsListSelector(state), a => a.id === currentAssetSelector(state)) || {};

export const assetNameSelector = state => selectedAssetSelector(state).name;


export const modeSelector = state => get(state, "sciadro.mode", "asset-list");
export const selectedMissionSelector = state => find(missionsListSelector(state), item => item.selected);
export const selectedMissionFeatureSelector = state => selectedMissionSelector(state) && selectedMissionSelector(state).feature || null;
export const selectedAssetFeatureSelector = state => selectedAssetSelector(state) && selectedAssetSelector(state).feature || null;
