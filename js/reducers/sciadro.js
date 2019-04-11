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
import {LOGOUT} from "@mapstore/actions/security";
import {findIndex} from "lodash";


// const getSelectedMissionIndex = (missions, id) => findIndex(missions, mission => mission.id === id);
const updateSelectedMission = (missions, id) => {
    let newMissions = missions;
    const selectedMissionIndex = findIndex(missions, mission => mission.id === id);
    if (selectedMissionIndex !== -1) {
        // reset selected property for all missions and toggle new one
        newMissions = newMissions.map((m, index) => ({...m, selected: index !== selectedMissionIndex ? false : !m.selected}));
    }
    return newMissions;
};

export default function sciadro(state = {
    assets: [],
    anomalies: [{
        id: 1,
        name: "insulator 1"
    },
    {
        id: 2,
        name: "insulator 2"
    }],
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
    },
    {
        id: 2,
        name: "Others Anomalies detection",
        description: "",
        attributes: [{
            note: "note for this mission",
            dateCreation: "2018-01-12T16:30:00.000Z"
        }],
        feature: {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [[0, 35], [10, 36], [20, 35]]
            },
            style: {
                color: "#FF00FF",
                weight: 2
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
                missions: state.missions.map(m => ({...m, selected: false})),
                currentAsset: null,
                mode: "asset-list"
            };
        case CHANGE_MODE:
            return {
                ...state,
                mode: action.mode
            };
        case CHANGE_CURRENT_MISSION: {
            const missions = state.missions.map(m => ({...m, selected: false}));
            return {
                ...state,
                missions: updateSelectedMission(missions, action.id),
                currentMission: action.id,
                mode: "mission-detail"
            };
        }
        case RESET_CURRENT_MISSION:
            return {
                ...state,
                currentMission: null,
                mode: "mission-list"
            };
        case SELECT_MISSION: {
            return {
                ...state,
                missions: updateSelectedMission(state.missions, action.id)
            };
        }
        case LOGOUT:
            return {
                ...state,
                currentMission: null,
                currentAsset: null,
                mode: "asset-list",
                // missions: [], TODO restore when missions are retrieved from geostore
                assets: []
            };
        default:
            return state;
    }
}
