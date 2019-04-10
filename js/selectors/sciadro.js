/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import {head, get} from 'lodash';

export const enabledSelector = state => get(state, "controls.sciadro.enabled", false);

export const currentAssetSelector = state => get(state, "sciadro.currentAsset", null);
export const currentMissionSelector = state => get(state, "sciadro.currentMission", null);

export const assetsListSelector = state => get(state, "sciadro.assets", []);
// missions related to the actual asset opened
export const missionsListSelector = state => get(state, "sciadro.missions", []);

export const selectedAssetSelector = state => state && head(assetsListSelector(state).filter(a => a.id = currentAssetSelector(state)));
