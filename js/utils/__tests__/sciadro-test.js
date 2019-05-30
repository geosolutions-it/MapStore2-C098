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
    addStartingOffset,
    addStartingOffsetFrame,
    addTelemInterval,
    getAdditionalLayerAction,
    getTelemetryByTimePlayed,
    getStyleFromType,
    getValidationState,
    getValidationFiles,
    isEditedItemValid,
    removeAdditionalLayerById,
    resetProps,
    resetPropsAnomalies,
    toggleItemsProp,
    updateDrone,
    updateItemAndResetOthers,
    updateItem
} from "@js/utils/sciadro";
const telemetriesTest = [
    {
        "id": "aaaaaaaa-7cde-48f7-b5fd-4e8ba9ec5f88",
        "mission": "e4b678f6-0000-4aa7-86a4-f43f6697691d",
        "time": 2300,
        "roll": null,
        "pitch": null,
        "yaw": 0.52,
        "roll_speed": null,
        "pitch_speed": null,
        "yaw_speed": null,
        "altitude": null,
        "startingOffset": 0,
        "relative_altitude": null,
        "location": {
            "type": "Point",
            "coordinates": [10.39985, 43.71064]
        }
    }, {
        "id": "aaaabbbb-7cde-48f7-b5fd-4e8ba9ec5f88",
        "mission": "e4b678f6-0000-4aa7-86a4-f43f6697691d",
        "time": 3050,
        "roll": null,
        "pitch": null,
        "yaw": 1.04,
        "roll_speed": null,
        "pitch_speed": null,
        "yaw_speed": null,
        "altitude": null,
        "startingOffset": 4400,
        "relative_altitude": null,
        "location": {
            "type": "Point",
            "coordinates": [10.40085, 43.71064]
        }
    }, {
        "id": "aaaacccc-7cde-48f7-b5fd-4e8ba9ec5f88",
        "mission": "e4b678f6-0000-4aa7-86a4-f43f6697691d",
        "time": 5432,
        "roll": null,
        "pitch": null,
        "yaw": 1.57,
        "roll_speed": null,
        "pitch_speed": null,
        "yaw_speed": null,
        "altitude": null,
        "startingOffset": 8800,
        "relative_altitude": null,
        "location": {
        "type": "Point",
        "coordinates": [10.40184, 43.71064]
        }
    }, {
        "id": "aaaadddd-7cde-48f7-b5fd-4e8ba9ec5f88",
        "mission": "e4b678f6-0000-4aa7-86a4-f43f6697691d",
        "time": 8888,
        "roll": null,
        "pitch": null,
        "yaw": 2.09,
        "roll_speed": null,
        "pitch_speed": null,
        "yaw_speed": null,
        "altitude": null,
        "startingOffset": 13200,
        "relative_altitude": null,
        "location": {
        "type": "Point",
        "coordinates": [10.40284, 43.71064]
        }
    }];
const frameTest = [
{
    "id": "562a9ae4-2ed8-4cd9-91f1-66608dbd7ed2",
    "mission": "e4b678f6-0000-4aa7-86a4-f43f6697691d",
    "index": 20,
    "location": {
        "type": "Point",
        "coordinates": [
            10.40109,
            43.71064
        ]
    }
},
{
    "id": "562a9ae4-2ed8-4cd9-91f1-666087897ed3",
    "mission": "e4b678f6-0000-4aa7-86a4-f43f6697691d",
    "index": 240,
    "location": {
        "type": "Point",
        "coordinates": [
            10.40234,
            43.71064
        ]
    }
},
{
    "id": "562a9ae4-2ed8-4cd9-91f1-666087897ed5",
    "mission": "e4b678f6-0000-4aa7-86a4-f43f6697691d",
    "index": 400,
    "location": {
        "type": "Point",
        "coordinates": [
            10.40483,
            43.71064
        ]
    }
}
];

describe('testing sciadro utils', () => {
    it('addStartingOffset', () => {
        const telemetries = addStartingOffset(telemetriesTest);
        expect(telemetries[0].id).toBe("aaaaaaaa-7cde-48f7-b5fd-4e8ba9ec5f88");
        expect(telemetries[0].startingOffset).toBe(0);
        // 4400 is the time passed between the previous telem object
        expect(telemetries[1].startingOffset).toBe(750);
    });
    it('addStartingOffsetFrame', () => {
        const frames = addStartingOffsetFrame(frameTest);
        expect(frames[0].id).toBe("562a9ae4-2ed8-4cd9-91f1-66608dbd7ed2");
        expect(frames[0].startingOffset).toBe(571);
        // 4400 is the time passed between the previous telem object
        expect(frames[1].startingOffset).toBe(6857);
    });
    it('addTelemInterval', () => {
        const interval = addTelemInterval(telemetriesTest);
        expect(interval).toBe(750);
    });
    it('getAdditionalLayerAction', () => {
        const id = 3;
        const name = "name3";
        const feature = {type: "Feature", geometry: {type: "Point", coordinates: [0, 9]}};
        const action = getAdditionalLayerAction({id, name, feature});
        expect(action).toEqual( { type: 'ADDITIONALLAYER:UPDATE_ADDITIONAL_LAYER', id: 3, owner: 'sciadro', actionType: 'overlay', options: { id: 3, name: 'name3', style: null, type: 'vector', visibility: true, features: [ { type: 'Feature', geometry: { type: 'Point', coordinates: [0, 9] } } ] } });
    });
    it('getAdditionalLayerAction', () => {
        const id = 3;
        const name = "name3";
        const action = getAdditionalLayerAction({id, name});
        expect(action).toEqual( { type: 'ADDITIONALLAYER:REMOVE_ADDITIONAL_LAYER', id: 3, owner: undefined });
    });
    it('getTelemetryByTimePlayed', () => {
        let interval = 1500;
        let telem = getTelemetryByTimePlayed(telemetriesTest, 500, interval);
        expect(telem).toExist();
        expect(telem.id).toBe(telemetriesTest[0].id);
        telem = getTelemetryByTimePlayed(telemetriesTest, 5000, interval);
        expect(telem).toExist();
        expect(telem.id).toBe(telemetriesTest[1].id);
        telem = getTelemetryByTimePlayed(telemetriesTest, 9000, interval);
        expect(telem).toExist();
        expect(telem.id).toBe(telemetriesTest[2].id);
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
    it('getValidationFiles', () => {
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
    it('resetPropsAnomalies', () => {
        const anomalyId = 4;
        const frameId = 5;
        const missionId = 2;
        const missions = [{
            id: missionId,
            current: true,
            selected: true,
            name: "mission 2",
            frames: [{ id: frameId}],
            anomalies: [{ id: anomalyId, selected: true}]
        }];
        const missionsReset = resetPropsAnomalies(missions);
        const mission = find(missionsReset, {id: 2});
        expect(mission.anomalies[0].selected).toEqual(false);
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
    it('updateDrone', () => {
        const id = 3;
        const name = "name3";
        const missions = [{id, name}];
        const newMissions = updateDrone(missions, id, {isVisible: false});
        const mission = find(newMissions, {id: 3});
        expect(mission.drone.properties.isVisible).toBe(false);
    });
    it('updateDrone geometry', () => {
        const id = 3;
        const geometry = {type: "Point", coordinates: [0, 9]};
        const name = "name3";
        const missions = [{id, name}];
        const newMissions = updateDrone(missions, id, {}, geometry);
        const mission = find(newMissions, {id: 3});
        expect(mission.drone.geometry).toEqual(geometry);
    });
    it('updateItem', () => {
        const id = 3;
        const name = "name3";
        const props = {feature: {type: "Feature"}};
        const missions = [{id, name, selected: false}, {id: 4, name: "name 4", selected: true}];
        const newMissions = updateItem(missions, {id}, props);
        const mission3 = find(newMissions, {id: 3});
        expect(mission3.feature.type).toBe("Feature");
    });
    it('updateItem wrong id', () => {
        const id = 3;
        const name = "name3";
        const props = {feature: {type: "Feature"}};
        const missions = [{id, name, selected: false}, {id: 4, name: "name 4", selected: true}];
        const newMissions = updateItem(missions, {id: 99}, props);
        expect(newMissions).toEqual(missions);
    });
});
