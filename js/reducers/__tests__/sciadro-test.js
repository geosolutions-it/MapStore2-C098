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
    enterCreateItem,
    loadedAssets
} from "@js/actions/sciadro";

import { last } from "lodash";

describe('testing sciadro reducers', () => {
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
    it('ENTER_CREATE_ITEM', () => {
        const mode = "asset-edit";
        const state = sciadro({assets: []}, enterCreateItem(mode));
        expect(state.mode).toEqual(mode);
    });
    it('LOADED_ASSETS', () => {
        const assets = [];
        const state = sciadro({assets: []}, loadedAssets(assets));
        expect(state.assets).toEqual(assets);
        expect(state.loadingAssets).toEqual(false);
    });
});
