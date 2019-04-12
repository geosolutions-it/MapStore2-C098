/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import {get, find} from 'lodash';

export const enabledSelector = state => get(state, "controls.sciadro.enabled", false);

export const assetsListSelector = state => get(state, "sciadro.assets", []);
export const anomaliesListSelector = state => get(state, "sciadro.anomalies", []);
export const missionsListSelector = state => get(state, "sciadro.missions", []);

export const modeSelector = state => state && get(state, "sciadro.mode", "asset-list");

export const selectedMissionSelector = state => state && find(missionsListSelector(state), item => item.selected);
export const selectedAssetSelector = state => state && find(assetsListSelector(state), item => item.selected) || {};

export const selectedMissionFeatureSelector = state => selectedMissionSelector(state) && selectedMissionSelector(state).feature || null;
export const selectedAssetFeatureSelector = state => selectedAssetSelector(state) && selectedAssetSelector(state).feature || null;

export const drawMethodSelector = state => state && get(state, "sciadro.drawMethod", "");
