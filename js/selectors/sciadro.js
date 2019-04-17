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

export const assetEditedSelector = state => {
    const assets = state && assetsListSelector(state);
    return assets && find(assets, a => a.edit) || null;
};
export const assetNewSelector = state => {
    const assets = state && assetsListSelector(state);
    return assets && find(assets, a => a.isNew) || null;
};
export const assetSelectedSelector = state => {
    const assets = state && assetsListSelector(state);
    return assets && find(assets, a => a.selected) || null;
};
export const missionSelectedSelector = state => {
    const missions = state && missionsListSelector(state);
    return missions && find(missions, a => a.selected) || null;
};

export const selectedMissionFeatureSelector = state => missionSelectedSelector(state) && missionSelectedSelector(state).feature || null;
export const selectedDroneFeatureSelector = state => missionSelectedSelector(state) && get(missionSelectedSelector(state), "drone.properties.isVisible", false) && get(missionSelectedSelector(state), "drone", null) || null;
export const selectedAssetFeatureSelector = state => assetSelectedSelector(state) && assetSelectedSelector(state).feature || null;

export const drawMethodSelector = state => state && get(state, "sciadro.drawMethod", "");
export const saveDisabledSelector = state => state && get(state, "sciadro.saveDisabled", true);
export const loadingAssetsSelector = state => state && get(state, "sciadro.loadingAssets", false);
export const loadingMissionsSelector = state => state && get(state, "sciadro.loadingMissions", false);
export const reloadAssetSelector = state => state && get(state, "sciadro.reloadAsset", true);

export const toolbarButtonsVisibilitySelector = state => {
    const mode = modeSelector(state);
    const assetSelected = assetSelectedSelector(state);
    const missionSelected = missionSelectedSelector(state);
    return state && {
        back: mode !== "asset-list",
        add: mode.indexOf("list") !== -1,
        save: mode.indexOf("edit") !== -1,
        edit: (missionSelected && mode === "mission-list" || assetSelected && mode === "asset-list"),
        zoom: (missionSelected && mode === "mission-list" || assetSelected && mode === "asset-list"),
        zoomDisabled: (missionSelected && !missionSelected.feature || assetSelected && !assetSelected.feature) && mode.indexOf("edit") !== -1,
        draw: mode === "asset-edit"
    };
};
