/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import expect from "expect";
import sciadro from "@js/reducers/sciadro";
import {
    changeCurrentAsset,
    changeCurrentMission,
    changeMode,
    deleteAssetFeature,
    drawAsset,
    dropFiles,
    dropError,
    editAsset,
    // editAssetPermission,
    editMission,
    endSaveAsset,
    endSaveMission,
    enterCreateItem,
    enterEditItem,
    loadedAssets,
    loadedMissions,
    loadingAssets,
    loadingAssetFeature,
    loadingMissions,
    loadingMissionFeature,
    resetCurrentAsset,
    resetCurrentMission,
    saveError,
    selectAsset,
    selectMission,
    startSavingAsset,
    startSavingMission,
    updateAsset,
    updateMission
} from "@js/actions/sciadro";
import { logout, loginSuccess } from "@mapstore/actions/security";
import { endDrawing } from '@mapstore/actions/draw';


import { last, pick, find } from "lodash";

describe('testing sciadro reducers', () => {
    it('DEFAULT', () => {
        const assets = [{id: 2, name: "asset2"}, {id: 3, name: "asset3", selected: true}];
        const stateBefore = {assets};
        const stateAfter = sciadro(stateBefore, {type: 'UNKNOWN'});
        expect(stateBefore).toBe(stateAfter);
    });
    it('CHANGE_CURRENT_ASSET, one is selected then view detail of another one', () => {
        const assets = [{id: 2, name: "asset2"}, {id: 3, name: "asset3", selected: true}];
        const state = sciadro({assets}, changeCurrentAsset(2));
        expect(state.assets.length).toBe(2);
        state.assets.forEach(a => {
            if (a.id === 2) {
                expect(a.selected).toBe(true);
                expect(a.current).toBe(true);
            } else {
                expect(a.selected).toBe(false);
                expect(a.current).toBe(false);
            }
        });
    });
    it('CHANGE_CURRENT_ASSET, view detail of selected one', () => {
        const assets = [{id: 2, name: "asset2"}, {id: 3, name: "asset3", selected: true}];
        const id = 3;
        const state = sciadro({assets}, changeCurrentAsset(id));
        expect(state.assets.length).toBe(2);
        state.assets.forEach(a => {
            if (a.id === id) {
                expect(a.selected).toBe(true);
                expect(a.current).toBe(true);
            } else {
                expect(a.selected).toBe(false);
                expect(a.current).toBe(false);
            }
        });
    });
    it('CHANGE_CURRENT_MISSION, one is selected then view detail of another one', () => {
        const missions = [{id: 2, name: "mission2", drone: {}}, {id: 3, name: "mission3", selected: false}];
        const state = sciadro({missions}, changeCurrentMission(2));
        expect(state.missions.length).toBe(2);
        state.missions.forEach(a => {
            if (a.id === 2) {
                expect(a.selected).toBe(true);
                expect(a.current).toBe(true);
                expect(a.drone.properties.isVisible).toBe(true);
            } else {
                expect(a.selected).toBe(false);
                expect(a.current).toBe(false);
            }
        });
    });
    it('CHANGE_CURRENT_MISSION, view detail of selected one', () => {
        const missions = [{id: 2, name: "mission2"}, {id: 3, name: "mission3", selected: true}];
        const state = sciadro({missions}, changeCurrentMission(3));
        expect(state.missions.length).toBe(2);
        state.missions.forEach(a => {
            if (a.id === 3) {
                expect(a.selected).toBe(true);
                expect(a.current).toBe(true);
            } else {
                expect(a.selected).toBe(false);
                expect(a.current).toBe(false);
            }
        });
    });
    it('CHANGE_MODE', () => {
        const mode = "asset-edit";
        const state = sciadro({assets: []}, changeMode(mode));
        expect(state.mode).toEqual(mode);
    });
    it('DELETE_FEATURE_ASSET', () => {
        const assets = [{id: 2, name: "asset2"}, {id: 3, name: "asset3", selected: true, feature: {}}];
        const id = 3;
        const state = sciadro({assets}, deleteAssetFeature(id));
        state.assets.forEach(a => {
            if (a.id === id) {
                expect(a.selected).toBe(true);
                expect(a.feature).toBe(null);
            }
        });
    });
    it('DRAW_ASSET', () => {
        const assets = [{id: 2, name: "asset2"}, {id: 3, name: "asset3", edit: true, selected: true, feature: {}}];
        const drawMethod = "Marker";
        const id = 3;
        const state = sciadro({assets, missions: []}, drawAsset(id, drawMethod));
        expect(state.drawMethod).toEqual(drawMethod);
        expect(state.assets[1].draw).toEqual(true);
    });
    it('DROP_MISSION_FILES', () => {
        const files = "blob:url";
        const missions = [{id: 2, name: "mission2"}, {id: 3, name: "miss1", edit: true, selected: true}];
        const state = sciadro({assets: [], missions}, dropFiles(files));
        expect(state.missions[1].files).toEqual(files);
        expect(state.showSuccessMessage).toEqual(true);
        expect(state.saveDisabled).toEqual(false);
        expect(state.showErrorMessage).toEqual(false);
    });
    it('DROP_MISSION_FILES_ERROR ', () => {
        const missions = [{id: 2, name: "mission2"}, {id: 3, name: "miss1", edit: true, selected: true}];
        const state = sciadro({assets: [], missions}, dropError());
        expect(state.showSuccessMessage).toEqual(false);
        expect(state.showErrorMessage).toEqual(true);
    });
    it('EDIT_ASSET description, save remains disabled', () => {
        // type and name are mandatory for asset
        const id = 3;
        const prop = "description";
        const value = "the description of the asset";
        const assets = [{id: 2, name: "asset2"}, {id: 3, name: "", attributes: {type: "powerline"}, edit: true, selected: true}];
        const state = sciadro({assets, missions: []}, editAsset(id, prop, value));
        const asset = find(state.assets, item => item.id === id);
        expect(asset[prop]).toEqual(value);
        expect(state.saveDisabled).toEqual(true);

    });
    it('EDIT_ASSET name, save becomes enabled', () => {
        const id = 3;
        const prop = "name";
        const value = "the name of the asset";
        const assets = [{id: 2, name: "asset2"}, {id: 3, name: "asset3", attributes: {type: "powerline"}, edit: true, selected: true}];
        const state = sciadro({assets, missions: []}, editAsset(id, prop, value));
        const asset = find(state.assets, item => item.id === id);
        expect(asset[prop]).toEqual(value);
        expect(state.saveDisabled).toEqual(false);
    });
    it('EDIT_MISSION description, save remains disabled', () => {
        // name is mandatory for mission
        const id = 3;
        const prop = "description";
        const value = "the description of the asset";
        const missions = [{id: 2, name: "mission2"}, {id: 3, name: "", edit: true, selected: true}];
        const state = sciadro({missions}, editMission(id, prop, value));
        const mission = find(state.missions, item => item.id === id);
        expect(mission[prop]).toEqual(value);
        expect(state.saveDisabled).toEqual(true);
    });
    it('EDIT_MISSION name, save becomes enabled', () => {
        // name is mandatory for mission
        const id = 3;
        const prop = "name";
        const value = "the name of the mission";
        const missions = [{id: 2, name: "mission2"},
        {id: 3, name: "MISSION1", edit: true, selected: true, files: "blob:url"}];
        const state = sciadro({missions}, editMission(id, prop, value));
        const mission = find(state.missions, item => item.id === id);
        expect(mission[prop]).toEqual(value);
        expect(state.saveDisabled).toEqual(false);
    });
    it('ENTER_CREATE_ITEM of an asset', () => {
        const mode = "asset-edit";
        const state = sciadro({assets: [], missions: []}, enterCreateItem(mode));
        expect(state.mode).toEqual(mode);
        expect(state.saveDisabled).toEqual(true);
        expect(state.missions).toEqual([]);
        expect(state.assets.length).toEqual(1);
        const asset = pick( last(state.assets), ["name", "description", "edit", "isNew", "attributes"] );
        expect(asset).toEqual({
            name: "",
            description: "",
            edit: true,
            isNew: true,
            attributes: {
                type: "powerline",
                note: "",
                created: null,
                modified: null
            }});
    });
    it('ENTER_CREATE_ITEM of a mission', () => {
        const mode = "mission-edit";
        const state = sciadro({assets: [], missions: []}, enterCreateItem(mode));
        expect(state.mode).toEqual(mode);
        expect(state.saveDisabled).toEqual(true);
        expect(state.assets).toEqual([]);
        expect(state.missions.length).toEqual(1);
        const mission = pick( last(state.missions), ["name", "description", "edit", "isNew", "attributes"] );
        expect(mission).toEqual({
            name: "",
            description: "",
            edit: true,
            isNew: true,
            attributes: {
                note: "",
                created: null,
                modified: null
            }});
    });
    it('ENTER_EDIT_ITEM of an asset', () => {
        const mode = "asset-edit";
        const id = 3;
        const oldAsset = {id: 3, name: "", type: "powerline", selected: true};
        const assets = [{id: 2, name: "asset2"}, oldAsset];
        const state = sciadro({assets}, enterEditItem(mode, id));
        const asset = find(state.assets, item => item.id === id);
        expect(asset.edit).toEqual(true);
        expect(state.saveDisabled).toEqual(false);
        expect(state.oldItem).toEqual(oldAsset);
        expect(state.mode).toEqual(mode);
    });
    it('ENTER_EDIT_ITEM of an mission', () => {
        const mode = "mission-edit";
        const id = 4;
        const oldAsset = {id: 3, name: "", selected: true, attributes: {type: "powerline", missionsId: "4"}};
        const assets = [{id: 2, name: "asset2"}, oldAsset];
        const oldMission = {id: 4, name: "mission4", selected: true};
        const missions = [{id: 5, name: "mission5", selected: false}, oldMission];
        const state = sciadro({missions, assets}, enterEditItem(mode, id));
        const mission = find(state.missions, item => item.id === id);
        expect(mission.edit).toEqual(true);
        expect(state.saveDisabled).toEqual(false);
        expect(state.oldItem).toEqual(oldMission);
        expect(state.mode).toEqual(mode);
    });
    it('END_DRAWING a point for sciadro layers', () => {
        const owner = "sciadro";
        const id = 3;
        const oldAsset = {id, name: "asset 3", type: "powerline", selected: true, draw: true};
        const assets = [{id: 2, name: "asset2"}, oldAsset];
        const geometry = {
            id: "8cdb09b0-6ce0-11e9-917c-db7c1743ad0d",
            type: 'Point',
            extent: [
                807175.0186914615,
                5985325.062842442,
                807175.0186914615,
                5985325.062842442
            ],
            center: [
                807175.0186914615,
                5985325.062842442
            ],
            coordinates: [
                807175.0186914615,
                5985325.062842442
            ],
            style: {},
            projection: 'EPSG:3857'
        };
        const state = sciadro({assets}, endDrawing(geometry, owner));
        const asset = find(state.assets, item => item.id === id);
        expect(state.drawMethod).toEqual("");
        expect(asset.feature).toEqual({ type: 'Feature', geometry: { type: 'Point', coordinates: [ 7.250976562500003, 47.264320080254784 ] }, properties: { id: '8cdb09b0-6ce0-11e9-917c-db7c1743ad0d', extent: [ 7.250976562500003, 47.264320080254784, 7.250976562500003, 47.264320080254784 ], center: [ 7.250976562500003, 47.264320080254784 ] }, style: { iconColor: 'orange', iconShape: 'circle', iconGlyph: 'comment' } });
    });
    it('END_DRAWING a line for sciadro layers', () => {
        const owner = "sciadro";
        const id = 3;
        const oldAsset = {id, name: "", type: "powerline", selected: true, draw: true};
        const assets = [{id: 2, name: "asset2"}, oldAsset];
        const geometry = {
            id: 'b9b12820-6ce0-11e9-917c-db7c1743ad0d',
            type: 'LineString',
            extent: [
                362005.7659585946,
                5324909.138458518,
                1570322.309090661,
                6655524.926846867
            ],
            center: [
                966164.0375246278,
                5990217.032652693
            ],
            coordinates: [
                [
                    797391.0790709583,
                    6655524.926846867
                ],
                [
                    362005.7659585946,
                    5368936.8667507805
                ],
                [
                    1570322.309090661,
                    5324909.138458518
                ]
            ],
            style: {},
            projection: 'EPSG:3857'
        };
        const state = sciadro({assets}, endDrawing(geometry, owner));
        expect(state.drawMethod).toEqual("");
        const asset = find(state.assets, item => item.id === id);
        expect(asset.feature).toEqual({ type: 'Feature', geometry: { type: 'LineString', coordinates: [ [ 7.163085937499998, 51.19311524464588 ], [ 3.251953124999999, 43.37311218382001 ], [ 14.1064453125, 43.084937427075914 ] ] }, properties: { id: 'b9b12820-6ce0-11e9-917c-db7c1743ad0d', extent: [ 3.251953124999999, 43.084937427075914, 14.1064453125, 51.19311524464588 ], center: [ 8.67919921875, 47.29413372501023 ] }, style: { color: '#FF0000', weight: 3 } });

    });
    it('END_DRAWING for other layers', () => {
        const oldAsset = {id: 3, name: "", type: "powerline", selected: true};
        const assets = [{id: 2, name: "asset2"}, oldAsset];
        const owner = "non-sciadro";
        const state = sciadro({assets}, endDrawing(null, owner));
        expect(state.assets).toEqual(assets);
    });
    it('END_SAVE_ASSET', () => {
        const id = 3;
        const oldAsset = {id: 3, name: "", type: "powerline", selected: true};
        const assets = [{id: 2, name: "asset2"}, {...oldAsset, edit: true}];
        const state = sciadro({assets}, endSaveAsset(id));
        const asset = find(state.assets, item => item.id === id);
        expect(asset.edit).toEqual(false);
        expect(asset.isNew).toEqual(false);
        expect(state.savingAsset).toEqual(false);
        expect(state.saveDisabled).toEqual(false);
        expect(state.mode).toEqual("asset-list");
    });
    it('END_SAVE_MISSION', () => {
        const id = 3;
        const oldMission = {id: 3, name: "miss3", selected: true};
        const missions = [{id: 2, name: "mission 2"}, {...oldMission, edit: true}];
        const state = sciadro({missions}, endSaveMission(id));
        const mission = find(state.missions, item => item.id === id);
        expect(mission.edit).toEqual(false);
        expect(mission.isNew).toEqual(false);
        expect(state.savingMission).toEqual(false);
        expect(state.saveDisabled).toEqual(false);
        expect(state.mode).toEqual("mission-list");
    });
    it('LOADED_ASSETS', () => {
        const assets = [];
        const state = sciadro({assets: []}, loadedAssets(assets));
        expect(state.assets).toEqual(assets);
        expect(state.loadingAssets).toEqual(false);
    });
    it('LOADED_MISSIONS', () => {
        const missions = [{id: 1, name: "miss1"}];
        const state = sciadro({missions: []}, loadedMissions(missions));
        expect(state.missions).toEqual(missions);
        expect(state.loadingMissions).toEqual(false);
    });
    it('LOADING_ASSETS', () => {
        const state = sciadro({assets: []}, loadingAssets(true));
        expect(state.loadingAssets).toEqual(true);
        const state2 = sciadro({assets: []}, loadingAssets(false));
        expect(state2.loadingAssets).toEqual(false);
    });
    it('LOADING_ASSET_FEATURE', () => {
        const id = 3;
        const name = "asset3";
        const assets = [{id: 2, name: "asset2"}, {id, name, selected: true, feature: {}}];
        const state = sciadro({assets}, loadingAssetFeature(true));
        const asset = find(state.assets, item => item.id === id);
        expect(asset.loadingFeature).toEqual(true);
        expect(asset.id).toEqual(id);
        expect(asset.name).toEqual(name);
    });
    it('LOADING_MISSION_FEATURE', () => {
        const id = 3;
        const name = "mission3";
        const missions = [{id: 2, name: "mission2"}, {id, name, selected: true, feature: {}}];
        const state = sciadro({missions}, loadingMissionFeature(true));
        const mission = find(state.missions, item => item.id === id);
        expect(mission.loadingFeature).toEqual(true);
        expect(mission.id).toEqual(id);
        expect(mission.name).toEqual(name);
    });
    it('LOADING_MISSIONS', () => {
        const state = sciadro({missions: []}, loadingMissions(true));
        expect(state.loadingMissions).toEqual(true);
        const state2 = sciadro({missions: []}, loadingMissions(false));
        expect(state2.loadingMissions).toEqual(false);
    });
    it('LOGIN_SUCCESS', () => {
        const state = sciadro({assets: []}, loginSuccess());
        expect(state.loadingAssets).toEqual(true);
    });
    it('LOGOUT', () => {
        const assets = [{id: 2, name: "asset2"}, {id: 3, name: "asset3", selected: true, feature: {}}];
        const state = sciadro({assets}, logout());
        expect(state.assets).toEqual([]);
        expect(state.mode).toEqual("asset-list");
    });
    it('RESET_CURRENT_ASSET, from asset-edit (new asset) to asset-list', () => {
        const mode = "asset-edit";
        const state = sciadro({assets: [], missions: []}, enterCreateItem(mode));
        const nextState = sciadro(state, resetCurrentAsset());
        expect(nextState.assets).toEqual([]);
        expect(nextState.mode).toEqual("asset-list");
        expect(nextState.drawMethod).toEqual("");
        expect(nextState.reloadAsset).toEqual(false);
        expect(nextState.oldItem).toEqual(null);
        expect(nextState.saveError).toEqual(null);
    });
    it('RESET_CURRENT_ASSET, from asset-edit (editing asset) to asset-list', () => {
        const mode = "asset-edit";
        const id = 3;
        const assets = [{id: 2, name: "asset2"}, {id: 3, name: "asset 4", type: "powerline", selected: true}];
        const oldItem = {id: 3, name: "asset 3", type: "powerline", selected: true};
        const state = sciadro({assets, missions: []}, enterEditItem(mode, id));
        const nextState = sciadro({...state, oldItem}, resetCurrentAsset());
        const asset = find(nextState.assets, item => item.id === id);
        expect(asset.name).toEqual(oldItem.name);
        expect(nextState.mode).toEqual("asset-list");
        expect(nextState.drawMethod).toEqual("");
        expect(nextState.reloadAsset).toEqual(false);
        expect(nextState.oldItem).toEqual(null);
        expect(nextState.saveError).toEqual(null);

    });
    it('RESET_CURRENT_ASSET, from mission-list to asset-list', () => {
        // reset only current asset
        const mode = "mission-list";
        const id = 3;
        const assets = [{id: 2, name: "asset2"}, {id, name: "asset 3", type: "powerline", selected: true, current: true}];
        const state = sciadro({assets, missions: [], mode}, resetCurrentAsset());
        const asset = find(state.assets, item => item.id === id);
        expect(asset.current).toEqual(false);
        expect(state.reloadAsset).toEqual(false);
        expect(state.oldItem).toEqual(null);
        expect(state.saveError).toEqual(null);
        expect(state.mode).toEqual("asset-list");
    });
    it('RESET_CURRENT_MISSION, from mission-edit (new) to mission-list', () => {
        const mode = "mission-edit";
        const state = sciadro({assets: [], missions: []}, enterCreateItem(mode));
        const nextState = sciadro(state, resetCurrentMission());
        expect(nextState.missions).toEqual([]);
        expect(nextState.mode).toEqual("mission-list");
    });
    it('RESET_CURRENT_MISSION, from mission-edit (edit) to mission-list', () => {
        const mode = "mission-edit";
        const missions = [{id: 2, name: "mission2"}, {id: 3, name: "mission 4", selected: true}];
        const id = 3;
        const oldAsset = {id: 1, name: "", selected: true, attributes: {type: "powerline", missionsId: "3"}};

        const oldItem = {id: 3, name: "mission 3", selected: true};
        const state = sciadro({assets: [oldAsset], missions}, enterEditItem(mode, id));
        const nextState = sciadro({...state, oldItem}, resetCurrentMission());
        expect(nextState.mode).toEqual("mission-list");
        const mission = find(nextState.missions, item => item.id === id);
        expect(mission.name).toEqual("mission 3");
    });
    it('RESET_CURRENT_MISSION, from mission-detail to mission-list', () => {
        const mode = "mission-detail";
        const missions = [{id: 2, name: "mission2"}, {id: 3, name: "mission 4", selected: true, current: true, drone: {properties: {isVisible: true}}}];
        const id = 3;
        const state = sciadro({missions, mode }, resetCurrentMission());
        expect(state.mode).toEqual("mission-list");
        const mission = find(state.missions, item => item.id === id);
        expect(mission.current).toEqual(false);
        expect(mission.drone.properties.isVisible).toEqual(false);
    });
    it('SAVE_ERROR', () => {
        const mode = "asset-edit";
        const id = 3;
        const message = "sciadro.rest.saveError";
        const state = sciadro({missions: [], mode }, saveError(id, message));
        expect(state.mode).toEqual(mode);
        expect(state.savingAsset).toEqual(false);
        expect(state.saveError).toEqual("sciadro.rest.saveError");
    });
    it('SELECT_ASSET', () => {
        const mode = "asset-list";
        const assets = [{selected: true, id: 2, name: "asset2"}, {id: 3, name: "", type: "powerline"}];
        const id = 3;
        const state = sciadro({assets, missions: [], mode }, selectAsset(id));
        expect(state.mode).toEqual(mode);
        const asset = find(state.assets, item => item.id === id);
        const assetPreviouslySelected = find(state.assets, item => item.id === 2);
        expect(asset.selected).toEqual(true);
        expect(assetPreviouslySelected.selected).toEqual(false);
    });
    it('SELECT_MISSION', () => {
        const mode = "mission-list";
        const missions = [{selected: true, id: 2, name: "mission2"}, {id: 3, name: "mission3", type: "powerline"}];
        const id = 3;
        const state = sciadro({assets: [], missions, mode }, selectMission(id));
        expect(state.mode).toEqual(mode);
        const mission = find(state.missions, item => item.id === id);
        const missionPreviouslySelected = find(state.missions, item => item.id === 2);
        expect(mission.selected).toEqual(true);
        expect(missionPreviouslySelected.selected).toEqual(false);
    });
    it('START_SAVING_ASSET', () => {
        const assets = [{selected: true, id: 2, name: "asset2"}, {id: 3, name: "", type: "powerline"}];
        const id = 3;
        const state = sciadro({assets, missions: []}, startSavingAsset(id));
        expect(state.reloadAsset).toEqual(false);
        expect(state.savingAsset).toEqual(true);
    });
    it('START_SAVING_MISSION', () => {
        const missions = [{id: 2, name: "mission2"}, {id: 3, selected: true, edit: true, name: "mission3"}];
        const id = 3;
        const state = sciadro({assets: [], missions}, startSavingMission(id));
        expect(state.savingMission).toEqual(true);
    });
    it('UPDATE_ASSET', () => {
        const assets = [{selected: true, id: 2, name: "asset2"}, {id: 3, name: "", type: "powerline"}];
        const id = 3;
        const props = {feature: {type: "Feature"}, name: "tre"};
        const state = sciadro({assets, missions: []}, updateAsset(props, id));
        const asset = find(state.assets, item => item.id === id);
        expect(asset.feature).toEqual({type: "Feature"});
        expect(asset.name).toEqual("tre");
    });
    it('UPDATE_MISSION', () => {
        const missions = [{selected: true, id: 2, name: "mission2"}, {id: 3, name: "", type: "powerline"}];
        const id = 3;
        const props = {feature: {type: "Feature"}, name: "tre"};
        const state = sciadro({missions, assets: []}, updateMission(props, id));
        const mission = find(state.missions, item => item.id === id);
        expect(mission.feature).toEqual({type: "Feature"});
        expect(mission.name).toEqual("tre");
    });
});
