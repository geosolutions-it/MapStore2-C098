/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const {
    LOADED_ASSETS,
    CHANGE_CURRENT_ASSET,
    RESET_CURRENT_ASSET,
    RESET_CURRENT_MISSION,
    CHANGE_MODE,
    SELECT_MISSION,
    CHANGE_CURRENT_MISSION
} = require('../actions/sciadro');


export default function sciadro(state = {
    assets: [],
    missions: [{
        id: 1,
        name: "Anomalies detection",
        description: "",
        attributes: [{
            note: "",
            dateCreation: "2019-01-12T16:30:00.000Z"
        }],
        feature: {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [[0, 40], [28, 49]]
            },
            style: {
                color: "#0000FF ",
                weight: 5
            }
        }
    }]
}, action) {
    switch (action.type) {
        case LOADED_ASSETS:
            return {
                ...state,
                assets: action.assets
            };
        case CHANGE_CURRENT_ASSET:
            return {
                ...state,
                currentAsset: action.id,
                mode: "mission-list"
            };
        case RESET_CURRENT_ASSET:
            return {
                ...state,
                currentAsset: null,
                mode: "asset-list"
            };
        case CHANGE_MODE:
            return {
                ...state,
                mode: action.id
            };
        case CHANGE_CURRENT_MISSION:
            return {
                ...state,
                selectedMission: action.id,
                mode: "mission-detail"
            };
        case RESET_CURRENT_MISSION:
            return {
                ...state,
                currentMission: null,
                mode: "mission-list"
            };
        case SELECT_MISSION:
            return {
                ...state,
                currentMission: action.id
            };
        default:
            return state;
    }
}
