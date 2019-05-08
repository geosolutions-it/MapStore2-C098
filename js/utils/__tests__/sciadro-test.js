/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import expect from "expect";
import { find } from "lodash";
import {
    getAdditionalLayerAction,
    getStyleFromType,
    getValidationState,
    getValidationFiles,
    isEditedItemValid,
    removeAdditionalLayerById,
    resetProps,
    toggleItemsProp,
    updateDroneProps,
    updateItemAndResetOthers,
    updateItemById
} from "@js/utils/sciadro";

describe('testing sciadro utils', () => {
    it('getAdditionalLayerAction', () => {
        const id = 3;
        const name = "name3";
        const feature = {type: "Feature", geometry: {type: "Point", coordinates: [0, 9]}};
        const action = getAdditionalLayerAction({id, name, feature});
        expect(action).toEqual( { type: 'ADDITIONALLAYER:UPDATE_ADDITIONAL_LAYER', id: 3, owner: 'sciadro', actionType: 'overlay', options: { id: 3, name: 'name3', style: { color: '#FF0000', weight: 3 }, type: 'vector', visibility: true, features: [ { type: 'Feature', geometry: { type: 'Point', coordinates: [0, 9] } } ] } });
    });
    it('getAdditionalLayerAction', () => {
        const id = 3;
        const name = "name3";
        const action = getAdditionalLayerAction({id, name});
        expect(action).toEqual( { type: 'ADDITIONALLAYER:REMOVE_ADDITIONAL_LAYER', id: 3, owner: undefined });
    });
    it('getStyleFromType', () => {
        const defaultStyle = getStyleFromType();
        const lineStyle = getStyleFromType("LineString");
        expect(defaultStyle).toEqual(lineStyle);
        expect(defaultStyle).toEqual({
            color: "#FF0000",
            weight: 3
        });
        const pointStyle = getStyleFromType("Point");
        const markerStyle = getStyleFromType("Marker");
        expect(pointStyle).toEqual(markerStyle);
        expect(markerStyle).toEqual({
            iconColor: "orange",
            iconShape: "circle",
            iconGlyph: "comment"
        });
    });
    it('getValidationState', () => {
        expect(getValidationState()).toBe("warning");
        expect(getValidationState("")).toBe("warning");
        expect(getValidationState("value")).toBe("success");
    });
    it('ggetValidationFiles', () => {
        expect(getValidationFiles()).toBe("success");
        expect(getValidationFiles({isNew: true, files: ""})).toBe("warning");
        expect(getValidationFiles({isNew: true, files: "blob::url"})).toBe("success");
    });
    it('isEditedItemValid', () => {
        const assetNonValid = {name: "a name"};
        const assetValid = {name: "a name", attributes: {type: "a name"}};
        const missionNonValid = {name: ""};
        const missionValid = {name: "a name", files: "blob"};
        expect(isEditedItemValid()).toBe(false);
        expect(isEditedItemValid("asset", assetNonValid)).toBe(false);
        expect(isEditedItemValid("asset", assetValid)).toBe(true);
        expect(isEditedItemValid("mission", missionNonValid)).toBe(false);
        expect(isEditedItemValid("mission", missionValid)).toBe(true);
        expect(isEditedItemValid("other")).toBe(false);
    });
    it('removeAdditionalLayerById', () => {
        const action = removeAdditionalLayerById(3);
        expect(action).toEqual( { type: 'ADDITIONALLAYER:REMOVE_ADDITIONAL_LAYER', id: 3, owner: undefined });
    });
    it('resetProps', () => {
        const assets = [{id: 2, selected: true, current: true, name: "name"}, {id: 3, selected: false, current: false, name: "name 3"}];
        const assetsReset = resetProps(assets);
        const asset = find(assetsReset, {id: 2});
        expect(asset.selected).toEqual(false);
        expect(asset.current).toEqual(false);
    });
    it('toggleItemsProp', () => {
        const id = 3;
        const name = "name3";
        const missions = [{id, name, selected: false}, {id: 4, name: "name 4", selected: true}];
        const newMissions = toggleItemsProp(missions, id);
        const mission3 = find(newMissions, {id: 3});
        const mission4 = find(newMissions, {id: 4});
        expect(mission3.selected).toBe(true);
        expect(mission4.selected).toBe(false);
    });
    it('updateItemAndResetOthers', () => {
        const id = 3;
        const assets = [{id, selected: true, current: true, name: "name"}, {id: 4, selected: false, current: false, name: "name 3"}];
        let state = {assets};
        state = updateItemAndResetOthers({id, state});
        const asset = find(state.assets, {id: 3});
        expect(asset.selected).toEqual(true);
        expect(asset.current).toEqual(true);
        const asset4 = find(state.assets, {id: 4});
        expect(asset4.selected).toEqual(false);
        expect(asset4.current).toEqual(false);
    });
    it('updateDroneProps', () => {
        const id = 3;
        const name = "name3";
        const missions = [{id, name}];
        const newMissions = updateDroneProps(missions, id, {isVisible: false});
        const mission = find(newMissions, {id: 3});
        expect(mission.drone.properties.isVisible).toBe(false);
    });
    it('updateItemById', () => {
        const id = 3;
        const name = "name3";
        const props = {feature: {type: "Feature"}};
        const missions = [{id, name, selected: false}, {id: 4, name: "name 4", selected: true}];
        const newMissions = updateItemById(missions, id, props);
        const mission3 = find(newMissions, {id: 3});
        expect(mission3.feature.type).toBe("Feature");
    });
});
