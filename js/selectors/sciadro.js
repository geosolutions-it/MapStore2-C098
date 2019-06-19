/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import {get, find, isNil} from 'lodash';
import {userSelector} from '@mapstore/selectors/security';

export const filterTextAssetSelector = state => get(state, "sciadro.filterTextAsset", "");
export const allMissionsSelector = state => get(state, "sciadro.missions", []);
export const assetsListSelector = state => {
    const filterText = filterTextAssetSelector(state) || "\\w";
    const regexForFilteringName = new RegExp(`${filterText}`, "i");
    const filteredAssets = get(state, "sciadro.assets", [])
        .filter(a => a.name ? regexForFilteringName.test(a.name) : true); // filter assets by name
    return filteredAssets;
};

export const assetEditedSelector = state => find(assetsListSelector(state), a => a.edit) || null;
export const assetEditedFeatureSelector = state => get(assetEditedSelector(state), "feature");
export const assetCurrentSelector = state => find(assetsListSelector(state), a => a.current) || null;
export const assetSelectedSelector = state => find(assetsListSelector(state), a => a.selected) || null;
export const assetSelectedFeatureSelector = state => get(assetSelectedSelector(state), "feature");
export const assetZoomLevelSelector = state => get(state, "sciadro.assetZoomLevel", 10);
export const backendUrlSelector = state => get(state, "sciadro.backendUrl", "");

export const dateFilterSelector = state => get(state, "sciadro.dateFilter", {});
export const drawMethodSelector = state => get(state, "sciadro.drawMethod", "");

export const droneZoomLevelSelector = state => get(state, "sciadro.droneZoomLevel", 18);
export const enabledSelector = state => get(state, "controls.sciadro.enabled", false);
export const featureStyleSelector = (state, category, type) => get(state, `sciadro.styles.${category}.${type}`, { "color": "#0d912b", "weight": 2 });
export const filterTextMissionSelector = state => get(state, "sciadro.filterTextMission", "");
export const loadingAssetsSelector = state => get(state, "sciadro.loadingAssets", false);
export const deletingResourceSelector = state => get(state, "sciadro.deleting", false);
export const loadingAnomaliesSelector = state => get(state, "sciadro.loadingAnomalies", false);
export const loadingMissionsSelector = state => get(state, "sciadro.loadingMissions", false);

export const getMissiondDateFilter = (dateFilter = {}) => {
    if (dateFilter.dateValueForFilter && dateFilter.dateValueForFilter.startDate) {
        switch (dateFilter.operator) {
            case "><": {
                if (dateFilter.dateValueForFilter.endDate) {
                    return mission => {
                        const startDate = new Date(dateFilter.dateValueForFilter && dateFilter.dateValueForFilter.startDate);
                        const endDate = new Date(dateFilter.dateValueForFilter && dateFilter.dateValueForFilter.endDate);
                        const created = new Date(mission.attributes.created);
                        return startDate <= created && created <= endDate;
                    };
                }
            }
            case ">=": {
                return mission => {
                    const startDate = new Date(dateFilter.dateValueForFilter && dateFilter.dateValueForFilter.startDate);
                    const created = new Date(mission.attributes.created);
                    return startDate <= created;
                };
            }
            default: return m => m;
        }
    }
    return m => m;
};
export const missionsListSelector = state => {
    const assetCurrent = assetCurrentSelector(state);
    const assetId = assetCurrent && assetCurrent.attributes && assetCurrent.attributes.sciadroResourceId || null;
    const missions = allMissionsSelector(state);
    const filterText = filterTextMissionSelector(state) || "\\w";
    const dateFilter = dateFilterSelector(state);
    const missionDateFilter = getMissiondDateFilter(dateFilter);

    const regexForFilteringName = new RegExp(`${filterText}`, "i");
    return missions
        .filter(m => (assetId && m && m.attributes && m.attributes.assetId === assetId) || m.isNew) // filter missions of the selected asset
        .filter(missionDateFilter) // filter missions using date creation
        .filter(a => a.name ? regexForFilteringName.test(a.name) : true); // filter missions by name
};
/**
 * return all uuids (sciadro backend) of missions that are under current asset
*/
export const missionsIdSelector = state => {
    const assetCurrent = assetCurrentSelector(state);
    const assetId = assetCurrent && assetCurrent.attributes && assetCurrent.attributes.sciadroResourceId;
    const missions = allMissionsSelector(state);
    return missions.filter(m => (m.attributes.assetId === assetId)).map(m => m.attributes.sciadroResourceId);
};
export const missionLoadedSelector = state => {
    const asset = assetSelectedSelector(state);
    return asset ? asset.missionLoaded : false;
};
export const missionCurrentSelector = state => find(missionsListSelector(state), a => a.current) || null;
export const missionSelectedSelector = state => find(missionsListSelector(state), a => a.selected) || null;
export const missionSelectedFeatureSelector = state => get(missionSelectedSelector(state), "feature");
export const anomaliesListSelector = state => get(missionSelectedSelector(state), "anomalies", []);
export const anomalySelectedSelector = state => {
    const anomalies = anomaliesListSelector(state);
    return find(anomalies, a => a.selected) || null;
};
export const missionEditedSelector = state => find(missionsListSelector(state), a => a.edit) || null;
export const missionEditedFilesSelector = state => get(missionEditedSelector(state), "files", null);
export const missionSelectedDroneFeatureSelector = state => get(missionSelectedSelector(state), "drone.properties.isVisible") ? get(missionSelectedSelector(state), "drone", null) : undefined;
export const missionZoomLevelSelector = state => get(state, "sciadro.missionZoomLevel", 10);
export const modeSelector = state => get(state, "sciadro.mode", "asset-list");
export const isAssetEditSelector = state => modeSelector(state) === "asset-edit";

export const drawDisabledSelector = state => get(state, "sciadro.drawDisabled", false);
export const drawAssetEditSelector = state => ({
    visible: isAssetEditSelector(state),
    disabled: drawDisabledSelector(state)
});
export const playingSelector = state => get(state, "sciadro.playing", false);
export const restartLoadingAssetSelector = state => state && get(state, "sciadro.reloadAsset", true);
export const saveDisabledSelector = state => state && get(state, "sciadro.saveDisabled", true);
export const savingAssetSelector = state => state && get(state, "sciadro.savingAsset", false);
export const savingMissionSelector = state => get(state, "sciadro.savingMission", false);
export const saveErrorSelector = state => state && get(state, "sciadro.saveError");
export const showErrorMessageSelector = state => get(state, "sciadro.showErrorMessage", false);
export const showSuccessMessageSelector = state => get(state, "sciadro.showSuccessMessage", false);
export const toolbarButtonsStatusSelector = state => {
    const user = !isNil(userSelector(state)) ? userSelector(state) : false;
    const mode = modeSelector(state);
    const assetSelected = assetSelectedSelector(state);
    const missionSelected = missionSelectedSelector(state);
    const {error: dateError, fieldValue = {}} = dateFilterSelector(state);
    return {
        toolbarDisabled: savingMissionSelector(state) || savingAssetSelector(state) || loadingAssetsSelector(state) || loadingMissionsSelector(state),
        back: mode !== "asset-list",
        add: user && mode.indexOf("list") !== -1,
        save: mode.indexOf("edit") !== -1,
        saveDisabled: saveDisabledSelector(state),
        saveError: {
            visible: !!saveErrorSelector(state) && mode.indexOf("edit") !== -1,
            message: saveErrorSelector(state)
        },
        "delete": {
            visible: (mode === "mission-list" && !!missionSelected || mode === "asset-list" && !!assetSelected)
        },
        searchDate: {
            disabled: fieldValue && !fieldValue.startDate,
            error: dateError,
            visible: mode === "mission-list"
        },
        clearFilter: {
            disabled: fieldValue && !(fieldValue.startDate || fieldValue.endDate),
            visible: mode === "mission-list"
        },
        edit: (mode === "mission-list" && !!missionSelected || mode === "asset-list" && !!assetSelected),
        zoom: (missionSelected && (mode === "mission-list" || mode === "mission-detail") || assetSelected && mode === "asset-list"),
        zoomDisabled: ((missionSelected && !missionSelected.feature) || (assetSelected && !assetSelected.feature)),
        draw: drawAssetEditSelector(state)
    };
};
