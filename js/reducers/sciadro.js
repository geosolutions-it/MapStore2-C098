/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import {
    CHANGE_CURRENT_ASSET,
    CHANGE_CURRENT_MISSION,
    CHANGE_MODE,
    DELETE_FEATURE_ASSET,
    DRAW_ASSET,
    DROP_MISSION_FILES,
    DROP_MISSION_FILES_ERROR,
    EDIT_ASSET,
    // EDIT_ASSET_PERMISSION,
    EDIT_MISSION,
    END_SAVE_ASSET,
    END_SAVE_MISSION,
    ENTER_CREATE_ITEM,
    ENTER_EDIT_ITEM,
    LOADED_ASSETS,
    LOADED_MISSIONS,
    LOADING_ASSETS,
    LOADING_ASSET_FEATURE,
    LOADING_MISSIONS,
    LOADING_MISSION_FEATURE,
    RESET_CURRENT_ASSET,
    RESET_CURRENT_MISSION,
    SAVE_ERROR,
    SELECT_ASSET,
    SELECT_MISSION,
    START_SAVING_ASSET,
    START_SAVING_MISSION,
    UPDATE_ASSET,
    UPDATE_MISSION
} from '@js/actions/sciadro';

import { assetSelectedSelector, missionSelectedSelector } from '@js/selectors/sciadro';
import { END_DRAWING } from '@mapstore/actions/draw';
import { LOGOUT, LOGIN_SUCCESS } from "@mapstore/actions/security";
import { set, arrayUpdate } from "@mapstore/utils/ImmutableUtils";
import {
    getStyleFromType,
    updateItemAndResetOthers,
    toggleItemsProp,
    updateItemById,
    updateDroneProps,
    resetProps,
    isEditedItemValid
} from "@js/utils/sciadro";
import { reproject, reprojectBbox } from "@mapstore/utils/CoordinatesUtils";
import { findIndex, find } from "lodash";
import uuidv1 from 'uuid/v1';

export default function sciadro(state = {
    assets: [],
    anomalies: [] || [{
        id: 1,
        name: "insulator 1"
    },
    {
        id: 2,
        name: "insulator 2"
    }],
    missions: [] || [{
        id: 1,
        name: "Anomalies detection",
        description: "",
        attributes: [{
            note: "",
            created: "2019-01-12T16:30:00.000Z"
        }],
        feature: {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [[0.20, 40], [28, 49]]
            },
            style: {
                color: "#FF0000",
                weight: 5
            }
        },
        drone: {
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [0.20, 40]
            },
            style: {
                iconAnchor: [0.5, 1.1],
                iconUrl: "assets/images/pointing-up-arrow.svg",
                rotation: 0
            },
            properties: {
                rotation: 0,
                isVisible: false
            }
        }
    },
    {
        id: 2,
        name: "Others Anomalies detection",
        description: "",
        attributes: [{
            note: "note for this mission",
            created: "2018-01-12T16:30:00.000Z"
        }],
        feature: {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [[0, 35], [10, 36], [20, 35]]
            },
            style: {
                color: "#FF0000",
                weight: 2
            }
        }
    }]
}, action) {
    switch (action.type) {
        case CHANGE_CURRENT_ASSET: {
            return updateItemAndResetOthers({
                id: action.id,
                items: "assets",
                propsToReset: ["selected", "current"],
                state
            });
        }
        case CHANGE_CURRENT_MISSION: {
            const newState = updateItemAndResetOthers({
                id: action.id,
                items: "missions",
                state
            });
            return {
                ...newState,
                missions: updateDroneProps(newState.missions, action.id, { isVisible: true }),
                mode: "mission-detail"
            };
        }
        case CHANGE_MODE: {
            return {
                ...state,
                mode: action.mode
            };
        }
        case DELETE_FEATURE_ASSET: {
            return {
                ...state,
                assets: updateItemById(state.assets, action.id, { feature: null })
            };
        }
        case DRAW_ASSET: {
            return {
                ...state,
                drawMethod: action.drawMethod,
                assets: updateItemById(state.assets, action.id, { draw: true })
                // potentially useless, see edit property
            };
        }
        case DROP_MISSION_FILES: {
            const itemIndex = findIndex(state.missions, item => item.edit);
            const missions = updateItemById(state.missions, state.missions[itemIndex].id, { files: action.files });
            return {
                ...state,
                showSuccessMessage: true,
                showErrorMessage: false,
                saveDisabled: !isEditedItemValid("mission", missions[itemIndex]),
                missions
            };
        }
        case DROP_MISSION_FILES_ERROR: {
            return {
                ...state,
                showErrorMessage: true,
                showSuccessMessage: false
            };
        }
        case EDIT_ASSET: {
            const itemIndex = findIndex(state.assets, item => item.id === action.id);
            const assets = set(`[${itemIndex}][${action.prop}]`, action.value, state.assets);
            return {
                ...state,
                saveDisabled: !isEditedItemValid("asset", assets[itemIndex]),
                assets
            };
        }
        /*
        //   TODO when doing issue #22
        case EDIT_ASSET_PERMISSION: {
            return {
                ...state,
                assets: toggleItemsProp(state.assets, action.id, "permission")
            };
        }*/
        case EDIT_MISSION: {
            const itemIndex = findIndex(state.missions, item => item.id === action.id);
            const missions = set(`[${itemIndex}][${action.prop}]`, action.value, state.missions);
            return {
                ...state,
                saveDisabled: !isEditedItemValid("mission", missions[itemIndex]),
                missions
            };
        }
        case END_DRAWING: {
            if (action.owner === "sciadro") {
                const idAsset = find(state.assets, item => item.draw).id;
                const {type, coordinates, id, extent} = action.geometry;
                let center = reproject(action.geometry.center, "EPSG:3857", "EPSG:4326");
                const feature = {
                    type: "Feature",
                    geometry: {
                        type,
                        coordinates: type === "Point" ? [reproject(coordinates, "EPSG:3857", "EPSG:4326").x, reproject(coordinates, "EPSG:3857", "EPSG:4326").y]
                        : coordinates.map(c => {
                            const p = reproject(c, "EPSG:3857", "EPSG:4326");
                            return [p.x, p.y];
                        })
                    },
                    properties: {
                        id,
                        extent: reprojectBbox(extent, "EPSG:3857", "EPSG:4326"),
                        center: [center.x, center.y]
                    },
                    style: getStyleFromType(type) // style shoould be configurable
                };
                return {
                    ...state,
                    drawMethod: "",
                    assets: updateItemById(state.assets, idAsset, {feature, draw: false})
                };
            }
            return state;
        }
        case END_SAVE_ASSET: {
            return {
                ...state,
                savingAsset: false,
                saveDisabled: false,
                assets: resetProps(state.assets, ["edit", "isNew"]),
                mode: "asset-list"
            };
        }
        case END_SAVE_MISSION: {
            return {
                ...state,
                savingMission: false,
                saveDisabled: false,
                missions: resetProps(state.missions, ["edit", "isNew"]),
                mode: "mission-list"
            };
        }
        case ENTER_CREATE_ITEM: {
            let assets = [...(state.assets || [])];
            let missions = [...(state.missions || [])];
            return {
                ...state,
                assets: action.mode === "asset-edit" ? assets.concat([{
                    id: uuidv1(),
                    name: "",
                    description: "",
                    edit: true,
                    isNew: true,
                    attributes: {
                        type: "powerline",
                        note: "",
                        created: null,
                        modified: null
                    }
                }]) : state.assets,
                missions: action.mode === "mission-edit" ? missions.concat([{
                    id: uuidv1(),
                    name: "",
                    description: "",
                    edit: true,
                    isNew: true,
                    attributes: {
                        note: "",
                        created: null,
                        modified: null
                    }
                }]) : state.missions,
                saveDisabled: true,
                showErrorMessage: false,
                showSuccessMessage: false,
                mode: action.mode
            };
        }
        case ENTER_EDIT_ITEM: {
            // TODO TEST IT WORKS AS EXPECTED
            let assets = [...(state.assets || [])];
            let missions = [...(state.missions || [])];
            const selectedAsset = assetSelectedSelector({sciadro: state});
            const selectedMission = missionSelectedSelector({sciadro: state});
            if (action.mode === "asset-edit") {
                assets = updateItemById(assets, selectedAsset.id, {edit: true});
            }
            if (action.mode === "mission-edit") {
                missions = updateItemById(missions, selectedMission.id, {edit: true});
            }
            return {
                ...state,
                assets,
                missions,
                oldItem: selectedMission || selectedAsset,
                saveDisabled: false,
                mode: action.mode
            };
        }
        case LOADED_ASSETS: {
            return {
                ...state,
                loadingAssets: false,
                assets: action.assets
            };
        }
        case LOADED_MISSIONS: {
            // adding new missions to the actual list
            return {
                ...state,
                loadingMissions: false,
                missions: state.missions.concat(action.missions)
            };
        }
        case LOADING_ASSETS: {
            return {
                ...state,
                loadingAssets: action.loading
            };
        }
        case LOADING_ASSET_FEATURE: {
            const item = find(state.assets, i => i.selected);
            return arrayUpdate("assets", {...item, loadingFeature: action.loading}, i => i.selected, state);
        }
        case LOADING_MISSION_FEATURE: {
            const item = find(state.missions, i => i.selected);
            return arrayUpdate("missions", {...item, loadingFeature: action.loading}, i => i.selected, state);
        }
        case LOADING_MISSIONS: {
            return {
                ...state,
                loadingMissions: action.loading
            };
        }
        case LOGIN_SUCCESS: {
            return {
                ...state,
                loadingAssets: true
            };
        }
        case LOGOUT: {
            // reset all data on logout
            return {
                ...state,
                missions: resetProps(state.missions), // TODO remove this when backend works
                mode: "asset-list",
                // missions: [], TODO restore this when missions are retrieved from geostore
                // anomalies: [], TODO restore this when missions are retrieved from sciadro backend
                assets: []
            };
        }
        case RESET_CURRENT_ASSET: {
            let assets = [...state.assets];
            if (state.mode === "asset-edit") {
                // exclude the one that was in edit mode as new item
                assets = assets.filter(a => !a.isNew);
                const oldAsset = state.oldItem;
                if (oldAsset && oldAsset.id) {
                    const selectedItemIndex = findIndex(assets, item => item.id === oldAsset.id);
                    assets[selectedItemIndex] = oldAsset;
                }
            }
            return {
                ...state,
                assets: resetProps(assets, ["current"]),
                drawMethod: "",
                missions: resetProps(state.missions),
                mode: "asset-list",
                oldItem: null,
                reloadAsset: false,
                saveError: null
            };
        }
        case RESET_CURRENT_MISSION: {
            let missions = [...state.missions];
            if (state.mode === "mission-edit") {
                // exclude the one that was in edit mode
                missions = missions.filter(a => !a.isNew);
                const oldMission = state.oldItem;
                if (oldMission && oldMission.id) {
                    const selectedItemIndex = findIndex(missions, item => item.id === oldMission.id);
                    missions[selectedItemIndex] = oldMission;
                }
            }
            const currentMissionIndex = findIndex(missions, item => item.current);
            if (currentMissionIndex !== -1) {
                missions = updateDroneProps(missions, missions[currentMissionIndex].id, { isVisible: false });
                missions = toggleItemsProp(missions, missions[currentMissionIndex].id, "current");
            }
            return {
                ...state,
                missions,
                mode: "mission-list",
                showErrorMessage: false,
                showSuccessMessage: false
            };
        }
        case SAVE_ERROR: {
            return {
                ...state,
                savingAsset: false,
                saveError: action.message
            };
        }
        case SELECT_ASSET: {
            return {
                ...state,
                assets: toggleItemsProp(state.assets, action.id, "selected")
            };
        }
        case SELECT_MISSION: {
            return {
                ...state,
                missions: toggleItemsProp(state.missions, action.id, "selected")
            };
        }
        case START_SAVING_ASSET: {
            return {
                ...state,
                reloadAsset: false,
                savingAsset: true
            };
        }
        case START_SAVING_MISSION: {
            // TODO some work needs to be done here
            return {
                ...state,
                savingMission: true
            };
        }
        case UPDATE_ASSET: {
            return {
                ...state,
                assets: updateItemById(state.assets, action.id, action.props)
            };
        }
        case UPDATE_MISSION: {
            return {
                ...state,
                missions: updateItemById(state.missions, action.id, action.props)
            };
        }
        default:
            return state;
    }
}
