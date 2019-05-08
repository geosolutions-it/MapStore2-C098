/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import expect from "expect";
import {
    assetsListSelector,
    anomaliesListSelector,
    assetEditedSelector,
    assetSelectedSelector,
    assetSelectedFeatureSelector,
    drawMethodSelector,
    enabledSelector,
    loadingAssetsSelector,
    loadingMissionsSelector,
    missionsIdSelector,
    // assetSelectedSciadroResourceIdSelector,
    missionsListSelector,
    missionLoadedSelector,
    missionSelectedSelector,
    missionSelectedFeatureSelector,
    missionEditedSelector,
    missionEditedFilesSelector,
    missionSelectedDroneFeatureSelector,
    modeSelector,
    isAssetEditSelector,
    restartLoadingAssetSelector,
    saveDisabledSelector,
    savingAssetSelector,
    savingMissionSelector,
    saveErrorSelector,
    showErrorMessageSelector,
    showSuccessMessageSelector,
    toolbarButtonsStatusSelector
} from "../sciadro";


describe('testing sciadro selectors', () => {

    it('assetsListSelector', () => {
        expect(assetsListSelector({})).toEqual([]);
        expect(assetsListSelector({sciadro: {assets: [{id: 1}]}})).toEqual([{id: 1}]);
    });
    it('anomaliesListSelector', () => {
        expect(anomaliesListSelector({})).toEqual([]);
        expect(anomaliesListSelector({
            sciadro: {
                anomalies: [{
                    id: "anomaly-1",
                    otherProps: {}
                }]
            }})).toEqual([{
                id: "anomaly-1",
                otherProps: {}
            }]);
    });
    it('assetEditedSelector', () => {
        const asset = { id: 1, edit: true };
        expect(assetEditedSelector({})).toEqual(null);
        expect(assetEditedSelector({
            sciadro: {
                assets: [asset, { id: 4, edit: false }]
            }})).toEqual(asset);
    });
    it('assetSelectedSelector', () => {
        const asset = { id: 1, selected: true };
        expect(assetSelectedSelector({})).toEqual(null);
        expect(assetSelectedSelector({
            sciadro: {
                assets: [asset, { id: 4, selected: false }]
            }})).toEqual(asset);
    });
    it('assetSelectedFeatureSelector', () => {
        const feature = {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": [[0, 39], [28, 48]]
            },
            "id": "feature-id"
        };
        const asset = { id: 1, selected: true, feature };
        expect(assetSelectedFeatureSelector({})).toBe(undefined);
        expect(assetSelectedFeatureSelector({
            sciadro: {
                assets: [asset, { id: 4, selected: false }]
            }})).toEqual(feature);
    });
    it('drawMethodSelector', () => {
        const drawMethod = "Marker";
        expect(drawMethodSelector({})).toBe("");
        expect(drawMethodSelector({
            sciadro: {
                drawMethod
            }})).toEqual(drawMethod);
    });
    it('enabledSelector', () => {
        expect(enabledSelector({})).toBe(false);
        expect(enabledSelector({controls: {sciadro: {enabled: true}}})).toBe(true);
    });
    it('loadingAssetsSelector', () => {
        const loadingAssets = false;
        expect(loadingAssetsSelector({})).toBe(false); // default
        expect(loadingAssetsSelector({
            sciadro: {
                loadingAssets
            }})).toEqual(loadingAssets);
    });
    it('loadingMissionsSelector', () => {
        const loadingMissions = false;
        expect(loadingMissionsSelector({})).toBe(false); // default
        expect(loadingMissionsSelector({
            sciadro: {
                loadingMissions
            }})).toEqual(loadingMissions);
    });
    it('missionsIdSelector', () => {
        expect(missionsIdSelector({})).toEqual([]);
        expect(missionsIdSelector({sciadro: {
            assets: [{
                id: 1,
                selected: true,
                attributes: { missionsId: "1" }
            }],
            missions: [{id: 1}]
        }})).toEqual(1);
    });
    it('missionsListSelector', () => {
        expect(missionsListSelector({})).toEqual([]);
        expect(missionsListSelector({sciadro: {
            assets: [{
                id: 1,
                selected: true,
                attributes: { missionsId: "1" }
            }],
            missions: [{id: 1}]
        }})).toEqual([{id: 1}]);
    });
    it('missionLoadedSelector', () => {
        expect(missionLoadedSelector({})).toEqual(false);
        expect(missionLoadedSelector({sciadro: {
            assets: [{
                id: 1,
                selected: true,
                attributes: { missionsId: "1" },
                missionLoaded: true
            }],
            missions: [{id: 1}]
        }})).toEqual(true);
    });
    it('missionSelectedSelector', () => {
        const mission = { id: 1, selected: true };
        expect(missionSelectedSelector({})).toEqual(null);
        expect(missionSelectedSelector({
            sciadro: {
                assets: [{
                    id: 1,
                    selected: true,
                    attributes: { missionsId: "1" }
                }],
                missions: [mission, { id: 4, selected: false }]
            }})).toEqual(mission);
    });
    it('missionSelectedFeatureSelector', () => {
        const feature = {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": [[0, 39], [28, 48]]
            },
            "id": "feature-id"
        };
        const mission = { id: 1, selected: true, feature };
        expect(missionSelectedFeatureSelector({})).toBe(undefined);
        expect(missionSelectedFeatureSelector({
            sciadro: {
                assets: [{
                    id: 1,
                    selected: true,
                    attributes: { missionsId: "1" }
                }],
                missions: [mission, { id: 4, selected: false }]
            }})).toEqual(feature);
    });
    it('missionEditedSelector', () => {
        const mission = { id: 1, selected: true, edit: true };
        expect(missionEditedSelector({})).toEqual(null);
        expect(missionEditedSelector({
            sciadro: {
                assets: [{
                    id: 1,
                    selected: true,
                    attributes: { missionsId: "1" }
                }],
                missions: [mission, { id: 4, selected: false }]
            }})).toEqual(mission);
    });
    it('missionEditedFilesSelector', () => {
        const files = "blob:url";
        const mission = { id: 1, selected: true, edit: true, files };
        expect(missionEditedFilesSelector({})).toEqual(null);
        expect(missionEditedFilesSelector({
            sciadro: {
                assets: [{
                    id: 1,
                    selected: true,
                    attributes: { missionsId: "1" }
                }],
                missions: [mission, { id: 4, selected: false }]
            }})).toEqual(files);
    });
    it('missionSelectedDroneFeatureSelector', () => {
        const drone = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [28, 48]
            },
            "properties": {
                "isVisible": true
            },
            "id": "drone-feature-id"
        };
        const mission = { id: 1, selected: true, drone };
        expect(missionSelectedDroneFeatureSelector({})).toBe(null);
        expect(missionSelectedDroneFeatureSelector({
            sciadro: {
                assets: [{
                id: 1,
                selected: true,
                attributes: { missionsId: "1" }
            }],
                missions: [mission, { id: 4, selected: false }]
            }})).toEqual(drone);
    });
    it('modeSelector', () => {
        expect(modeSelector({})).toEqual("asset-list");
        expect(modeSelector({
            sciadro: {
                mode: "mission-list"
            }})).toEqual("mission-list");
    });
    it('saveDisabledSelector', () => {
        const saveDisabled = false;
        expect(saveDisabledSelector({})).toBe(true); // default
        expect(saveDisabledSelector({
            sciadro: {
                saveDisabled
            }})).toEqual(saveDisabled);
        expect(saveDisabledSelector({
            sciadro: {
                saveDisabled: true
            }})).toEqual(true);
    });
    it('savingAssetSelector', () => {
        const savingAsset = false;
        expect(savingAssetSelector({})).toBe(false); // default
        expect(savingAssetSelector({
            sciadro: {
                savingAsset
            }})).toEqual(savingAsset);
    });
    it('savingMissionSelector', () => {
        const savingMission = false;
        expect(savingMissionSelector({})).toBe(false); // default
        expect(savingMissionSelector({
            sciadro: {
                savingMission
            }})).toEqual(savingMission);
    });
    it('restartLoadingAssetSelector', () => {
        const reloadAsset = false;
        expect(restartLoadingAssetSelector({})).toBe(true); // default
        expect(restartLoadingAssetSelector({
            sciadro: {
                reloadAsset
            }})).toEqual(reloadAsset);
    });
    it('saveErrorSelector', () => {
        const saveError = "sciadro.rest.save.error";
        expect(saveErrorSelector({})).toBe(undefined); // default
        expect(saveErrorSelector({
            sciadro: {
                saveError
            }})).toEqual(saveError);
    });
    it('showErrorMessageSelector', () => {
        const showErrorMessage = true;
        expect(showErrorMessageSelector({})).toBe(false); // default
        expect(showErrorMessageSelector({
            sciadro: {
                showErrorMessage
            }})).toEqual(showErrorMessage);
    });
    it('showSuccessMessageSelector', () => {
        const showSuccessMessage = true;
        expect(showSuccessMessageSelector({})).toBe(false); // default
        expect(showSuccessMessageSelector({
            sciadro: {
                showSuccessMessage
            }})).toEqual(showSuccessMessage);
    });
    it('isAssetEditSelector', () => {
        expect(isAssetEditSelector({})).toBe(false); // default
        expect(isAssetEditSelector({
            sciadro: {
                mode: "asset-edit"
            }})).toEqual(true);
    });
    it('toolbarButtonsStatusSelector default', () => {
        expect(toolbarButtonsStatusSelector({})).toEqual({
            back: false,
            add: true,
            save: false,
            saveDisabled: true,
            saveError: {
                visible: false,
                message: undefined
            },
            edit: false,
            zoom: null,
            zoomDisabled: null,
            draw: false
        });
    });
    it('toolbarButtonsStatusSelector back', () => {
        expect(toolbarButtonsStatusSelector({
            sciadro: {
                mode: "asset-edit"
            }}).back).toEqual(true);
        expect(toolbarButtonsStatusSelector({
                sciadro: {
                    mode: "asset-list"
                }}).back).toEqual(false);
    });
    it('toolbarButtonsStatusSelector add', () => {
        expect(toolbarButtonsStatusSelector({
            sciadro: {
                mode: "asset-list"
            }}).add).toEqual(true);
        expect(toolbarButtonsStatusSelector({
            sciadro: {
                mode: "mission-list"
            }}).add).toEqual(true);
    });
    it('toolbarButtonsStatusSelector save', () => {
        expect(toolbarButtonsStatusSelector({
            sciadro: {
                mode: "mission-edit"
            }}).save).toEqual(true);
    });
    it('toolbarButtonsStatusSelector edit', () => {
        expect(toolbarButtonsStatusSelector({
            sciadro: {
                mode: "asset-list"
            }}).edit).toEqual(false);

        const mission = { id: 1, selected: true };
        expect(toolbarButtonsStatusSelector({
            sciadro: {
                assets: [{
                    id: 1,
                    selected: true,
                    attributes: { missionsId: "1" }
                }],
                missions: [mission, { id: 4, selected: true }],
                mode: "mission-list"
            }}).edit).toEqual(true);
        const asset = { id: 1, selected: true };
        expect(toolbarButtonsStatusSelector({
            sciadro: {
                assets: [asset, { id: 4, selected: true }],
                mode: "asset-list"
            }}).edit).toEqual(true);
    });
    it('toolbarButtonsStatusSelector draw', () => {
        expect(toolbarButtonsStatusSelector({
            sciadro: {
                mode: "asset-edit"
            }}).draw).toEqual(true);
    });

});
