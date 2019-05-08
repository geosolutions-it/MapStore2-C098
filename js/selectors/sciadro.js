/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import {get, find, includes} from 'lodash';

export const assetsListSelector = state => get(state, "sciadro.assets", []);
export const anomaliesListSelector = state => get(state, "sciadro.anomalies", []);
export const assetEditedSelector = state => find(assetsListSelector(state), a => a.edit) || null;
export const assetSelectedSelector = state => find(assetsListSelector(state), a => a.selected) || null;
export const assetSelectedFeatureSelector = state => get(assetSelectedSelector(state), "feature");
/*export const assetSelectedSciadroResourceIdSelector = state => {
    const assetSelected = assetSelectedSelector(state);
    return get(assetSelected, "attributes.sciadroResourceId");
};*/
export const drawMethodSelector = state => get(state, "sciadro.drawMethod", "");
export const enabledSelector = state => get(state, "controls.sciadro.enabled", false);
export const loadingAssetsSelector = state => state && get(state, "sciadro.loadingAssets", false);
export const loadingMissionsSelector = state => state && get(state, "sciadro.loadingMissions", false);
export const missionsIdSelector = state => {
    const assetSelected = assetSelectedSelector(state);
    const missionIds = get(assetSelected, "attributes.missionsId", "");
    return missionIds && `${missionIds}`.split(",").map(v => parseInt(v, 10)) || [];
};
export const missionsListSelector = state => {
    const missionsIds = missionsIdSelector(state);
    const missions = get(state, "sciadro.missions", []);
    return missions.filter(m => includes(missionsIds, m.id) || m.isNew);
};

export const missionLoadedSelector = state => {
    const asset = assetSelectedSelector(state);
    return asset ? asset.missionLoaded : false;
};
export const missionSelectedSelector = state => find(missionsListSelector(state), a => a.selected) || null;
export const missionSelectedFeatureSelector = state => get(missionSelectedSelector(state), "feature");
export const missionEditedSelector = state => find(missionsListSelector(state), a => a.edit) || null;
export const missionEditedFilesSelector = state => get(missionEditedSelector(state), "files", null);
export const missionSelectedDroneFeatureSelector = state => get(missionSelectedSelector(state), "drone.properties.isVisible", null) && get(missionSelectedSelector(state), "drone", null); // TODO verify this needs to be undefined instead of null
export const modeSelector = state => get(state, "sciadro.mode", "asset-list");
export const isAssetEditSelector = state => modeSelector(state) === "asset-edit";
export const restartLoadingAssetSelector = state => state && get(state, "sciadro.reloadAsset", true);
export const saveDisabledSelector = state => state && get(state, "sciadro.saveDisabled", true);
export const savingAssetSelector = state => state && get(state, "sciadro.savingAsset", false);
export const savingMissionSelector = state => get(state, "sciadro.savingMission", false);
export const saveErrorSelector = state => state && get(state, "sciadro.saveError");
export const showErrorMessageSelector = state => get(state, "sciadro.showErrorMessage", false);
export const showSuccessMessageSelector = state => get(state, "sciadro.showSuccessMessage", false);
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
        edit: (mode === "mission-list" && !!missionSelected || mode === "asset-list" && !!assetSelected),
        zoom: (missionSelected && mode === "mission-list" || assetSelected && mode === "asset-list"),
        zoomDisabled: ((missionSelected && !missionSelected.feature) || (assetSelected && !assetSelected.feature)),
        draw: isAssetEditSelector(state)
    };
};
