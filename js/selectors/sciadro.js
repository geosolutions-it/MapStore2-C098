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
export const modeSelector = state => get(state, "sciadro.mode", "asset-list");
export const assetEditedSelector = state => find(assetsListSelector(state), a => a.edit) || null;
export const assetSelectedSelector = state => find(assetsListSelector(state), a => a.selected) || null;
export const assetSelectedFeatureSelector = state => get(assetSelectedSelector(state), "feature");
export const missionSelectedSelector = state => find(missionsListSelector(state), a => a.selected) || null;
export const missionEditedSelector = state => find(missionsListSelector(state), a => a.edit) || null;
export const missionSelectedFeatureSelector = state => get(missionSelectedSelector(state), "feature");
export const missionSelectedDroneFeatureSelector = state => get(missionSelectedSelector(state), "drone.properties.isVisible", null) && get(missionSelectedSelector(state), "drone", null); // TODO verify this needs to be undefined instead of null
export const drawMethodSelector = state => get(state, "sciadro.drawMethod", "");
export const saveDisabledSelector = state => state && get(state, "sciadro.saveDisabled", true);
export const loadingAssetsSelector = state => state && get(state, "sciadro.loadingAssets", false);
export const loadingAssetFeatureSelector = state => state && get(state, "sciadro.loadingAssetFeature", false);
export const loadingMissionsSelector = state => state && get(state, "sciadro.loadingMissions", false);
export const savingAssetSelector = state => state && get(state, "sciadro.savingAsset", false);
export const savingMissionSelector = state => get(state, "sciadro.savingMission", false);
export const restartLoadingAssetselector = state => state && get(state, "sciadro.reloadAsset", true);
export const saveErrorSelector = state => state && get(state, "sciadro.saveError");
export const isAssetEditSelector = state => modeSelector(state) === "asset-edit";

export const toolbarButtonsStatusSelector = state => {
    const mode = modeSelector(state);
    const assetSelected = assetSelectedSelector(state);
    const missionSelected = missionSelectedSelector(state);
    return {
        back: mode !== "asset-list",
        add: mode.indexOf("list") !== -1,
        save: mode.indexOf("edit") !== -1,
        saveDisabled: saveDisabledSelector(state),
        saveError: {
            visible: !!saveErrorSelector(state) && mode.indexOf("edit") !== -1,
            message: saveErrorSelector(state)
        },
        edit: (mode === "mission-list" && missionSelected || mode === "asset-list" && assetSelected),
        zoom: (missionSelected && mode === "mission-list" || assetSelected && mode === "asset-list"),
        zoomDisabled: ((missionSelected && !missionSelected.feature) || (assetSelected && !assetSelected.feature)),
        draw: isAssetEditSelector(state)
    };
};
