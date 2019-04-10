/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import {includes, head} from 'lodash';

export const enabledSelector = state => state.controls && state.controls.sciadro && state.controls.sciadro.enabled;

export const currentAssetSelector = state => state.sciadro && state.sciadro.currentAsset;
export const currentMissionSelector = state => state.sciadro && state.sciadro.currentMission;

export const assetsListSelector = state => state.sciadro && state.sciadro.assets;

export const selectedAssetSelector = state => state.sciadro && head(assetsListSelector(state).filter(a => a.id = currentAssetSelector(state)));
export const missionsListSelector = state => state.sciadro && state.sciadro.missions.filter(m => includes(selectedAssetSelector.missions, m.id));
