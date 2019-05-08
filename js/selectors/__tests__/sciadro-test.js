/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import expect from "expect";
import {
    enabledSelector,
    assetsListSelector,
    anomaliesListSelector,
    missionsListSelector,
    modeSelector,
    assetEditedSelector,
    assetSelectedSelector,
    assetSelectedFeatureSelector,
    missionSelectedSelector,
    missionSelectedFeatureSelector,
    missionSelectedDroneFeatureSelector,
    drawMethodSelector,
    saveDisabledSelector,
    loadingAssetsSelector,
    loadingAssetFeatureSelector,
    loadingMissionsSelector,
    savingAssetSelector,
    restartLoadingAssetselector,
    saveErrorSelector,
    isAssetEditSelector,
    toolbarButtonsStatusSelector
} from "../sciadro";


describe('testing sciadro selectors', () => {

    it('enabledSelector', () => {
        expect(enabledSelector({})).toBe(false);
        expect(enabledSelector({controls: {sciadro: {enabled: true}}})).toBe(true);
    });
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
    it('missionsListSelector', () => {
        expect(missionsListSelector({})).toEqual([]);
        expect(missionsListSelector({sciadro: {
            assets: [{
                id: 1,
                missions: [{id: 1}]
            }],
            missions: [{id: 1}]
        }})).toEqual([{id: 1}]);
    });
    it('modeSelector', () => {
        expect(modeSelector({})).toEqual("asset-list");
        expect(modeSelector({
            sciadro: {
                mode: "mission-list"
            }})).toEqual("mission-list");
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
    it('missionSelectedSelector', () => {
        const mission = { id: 1, selected: true };
        expect(missionSelectedSelector({})).toEqual(null);
        expect(missionSelectedSelector({
            sciadro: {
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
                missions: [mission, { id: 4, selected: false }]
            }})).toEqual(feature);
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
                missions: [mission, { id: 4, selected: false }]
            }})).toEqual(drone);
    });
    it('drawMethodSelector', () => {
        const drawMethod = "Marker";
        expect(drawMethodSelector({})).toBe("");
        expect(drawMethodSelector({
            sciadro: {
                drawMethod
            }})).toEqual(drawMethod);
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
    it('loadingAssetsSelector', () => {
        const loadingAssets = false;
        expect(loadingAssetsSelector({})).toBe(false); // default
        expect(loadingAssetsSelector({
            sciadro: {
                loadingAssets
            }})).toEqual(loadingAssets);
    });
    it('loadingAssetFeatureSelector', () => {
        const loadingAssetFeature = false;
        expect(loadingAssetFeatureSelector({})).toBe(false); // default
        expect(loadingAssetFeatureSelector({
            sciadro: {
                loadingAssetFeature
            }})).toEqual(loadingAssetFeature);
    });
    it('loadingMissionsSelector', () => {
        const loadingMissions = false;
        expect(loadingMissionsSelector({})).toBe(false); // default
        expect(loadingMissionsSelector({
            sciadro: {
                loadingMissions
            }})).toEqual(loadingMissions);
    });
    it('savingAssetSelector', () => {
        const savingAsset = false;
        expect(savingAssetSelector({})).toBe(false); // default
        expect(savingAssetSelector({
            sciadro: {
                savingAsset
            }})).toEqual(savingAsset);
    });
    it('restartLoadingAssetselector', () => {
        const reloadAsset = false;
        expect(restartLoadingAssetselector({})).toBe(true); // default
        expect(restartLoadingAssetselector({
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
    it('isAssetEditSelector', () => {
        expect(isAssetEditSelector({})).toBe(false); // default
        expect(isAssetEditSelector({
            sciadro: {
                mode: "asset-edit"
            }})).toEqual(true);
    });
    it('toolbarButtonsStatusSelector', () => {
        expect(toolbarButtonsStatusSelector({})).toEqual({
            back: false,
            add: true,
            save: false,
            saveDisabled: true,
            saveError: {
                visible: false,
                message: undefined
            },
            edit: null,
            zoom: null,
            zoomDisabled: null,
            draw: false
        }); // default
        expect(toolbarButtonsStatusSelector({
            sciadro: {
                mode: "asset-edit"
            }}).back).toEqual(true);
        expect(toolbarButtonsStatusSelector({
            sciadro: {
                mode: "asset-list"
            }}).back).toEqual(false);
        expect(toolbarButtonsStatusSelector({
            sciadro: {
                mode: "asset-list"
            }}).add).toEqual(true);
        expect(toolbarButtonsStatusSelector({
            sciadro: {
                mode: "mission-list"
            }}).add).toEqual(true);
        expect(toolbarButtonsStatusSelector({
            sciadro: {
                mode: "mission-edit"
            }}).save).toEqual(true);
        expect(toolbarButtonsStatusSelector({
            sciadro: {
                mode: "mission-edit"
            }}).edit).toEqual(null);
        const mission = { id: 1, selected: true };
        expect(toolbarButtonsStatusSelector({
            sciadro: {
                missions: [mission, { id: 4, selected: true }],
                mode: "mission-list"
            }}).edit).toEqual(true);
        const asset = { id: 1, selected: true };
        expect(toolbarButtonsStatusSelector({
            sciadro: {
                assets: [asset, { id: 4, selected: true }],
                mode: "asset-list"
            }}).edit).toEqual(true);
        expect(toolbarButtonsStatusSelector({
            sciadro: {
                mode: "asset-edit"
            }}).draw).toEqual(true);
    });


});
