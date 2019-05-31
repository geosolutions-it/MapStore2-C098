/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import {
    CLEAR_MISSION_DATE_FILTER,
    CHANGE_CURRENT_ASSET,
    CHANGE_CURRENT_MISSION,
    CHANGE_MODE,
    CHANGE_PLAYING,
    DELETE_FEATURE_ASSET,
    DRAW_ASSET,
    DOWNLOAD_FRAME,
    DOWNLOADING_FRAME,
    DROP_MISSION_FILES,
    DROP_MISSION_FILES_ERROR,
    EDIT_ASSET,
    // EDIT_ASSET_PERMISSION,
    EDIT_MISSION,
    END_SAVE_ASSET,
    END_SAVE_MISSION,
    ENTER_CREATE_ITEM,
    ENTER_EDIT_ITEM,
    FILTER_MISSION_BY_DATE,
    FILTER_ASSETS,
    FILTER_MISSIONS,
    HIGHLIGHT_ANOMALY,
    LOADED_ASSETS,
    LOADED_MISSIONS,
    LOADING_ANOMALIES,
    LOADING_ASSETS,
    LOADING_ASSET_FEATURE,
    LOADING_MISSIONS,
    LOADING_MISSION_FEATURE,
    LOADING_MISSION_DATA,
    RESET_CURRENT_ASSET,
    RESET_CURRENT_MISSION,
    RESET_HIGHLIGHT_ANOMALY,
    SAVE_ERROR,
    SELECT_ASSET,
    SELECT_MISSION,
    START_SAVING_ASSET,
    START_SAVING_MISSION,
    UPDATE_ASSET,
    UPDATE_DATE_FILTER_EXCEPTION,
    UPDATE_DATE_FILTER_VALUE,
    UPDATE_DRONE_GEOMETRY,
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
    updateItem,
    updateDrone,
    resetProps,
    isEditedItemValid,
    resetPropsAnomalies
} from "@js/utils/sciadro";
import { reproject, reprojectBbox } from "@mapstore/utils/CoordinatesUtils";
import { findIndex, find } from "lodash";
import uuidv1 from 'uuid/v1';

export default function sciadro(state = {
    defaultDroneStyle: {
        iconUrl: "/localAssets/images/drone-nord.svg",
        size: [24, 24],
        iconAnchor: [0.5, 0.5]
    },
    assets: [],
    anomalies: [],
    missions: []
}, action) {
    switch (action.type) {
        case CLEAR_MISSION_DATE_FILTER: {
            return {
                ...state,
                missionDateFilter: m => m,
                dateFilter: {
                    ...state.dateFilter,
                    error: null,
                    fieldValue: {
                        startDate: null,
                        endDate: null
                    },
                    dateValueForFilter: {
                        startDate: null,
                        endDate: null
                    }
                }
            };
        }
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
            let missions = newState.missions;
            const mission = find(missions, item => item.current);
            if (mission.anomalies) {
                const anomalies = mission.anomalies.map((a => {
                    return {...a, selected: false};
                }));
                missions = updateItem(newState.missions, {id: mission.id}, {anomalies});
            }
            return {
                ...newState,
                missions,
                mode: "mission-detail"
            };
        }
        case CHANGE_MODE: {
            return {
                ...state,
                mode: action.mode
            };
        }
        case CHANGE_PLAYING: {
            let missions = state.missions;
            if (action.playing) {
                missions = resetPropsAnomalies(state.missions);
            }
            return {
                ...state,
                missions,
                playing: action.playing
            };
        }
        case DELETE_FEATURE_ASSET: {
            return {
                ...state,
                assets: updateItem(state.assets, {id: action.id}, { feature: null })
            };
        }
        case DOWNLOAD_FRAME: {
            const mission = find(state.missions, item => item.current);
            const anomalies = updateItem(mission.anomalies, {frame: action.frame}, {downloading: true});
            return {
                ...state,
                missions: updateItem(state.missions, {id: mission.id}, {anomalies})
            };
        }
        case DOWNLOADING_FRAME: {
            const mission = find(state.missions, item => item.current);
            const anomalies = updateItem(mission.anomalies, {frame: action.frame}, {downloading: action.downloading});
            return {
                ...state,
                missions: updateItem(state.missions, {id: mission.id}, {anomalies})
            };
        }
        case DRAW_ASSET: {
            return {
                ...state,
                drawMethod: action.drawMethod,
                assets: updateItem(state.assets, {id: action.id}, { draw: true })
                // potentially useless, see edit property
            };
        }
        case DROP_MISSION_FILES: {
            const itemIndex = findIndex(state.missions, item => item.edit);
            const missions = updateItem(state.missions, {id: state.missions[itemIndex].id}, { files: action.files });
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
                    assets: updateItem(state.assets, {id: idAsset}, {feature, draw: false})
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
                        type: "POW",
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
                assets = updateItem(assets, {id: selectedAsset.id}, {edit: true});
            }
            if (action.mode === "mission-edit") {
                missions = updateItem(missions, {id: selectedMission.id}, {edit: true});
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
        case FILTER_MISSION_BY_DATE: {
            return {
                ...state,
                dateFilter: {
                    ...state.dateFilter,
                    dateValueForFilter: state.dateFilter.fieldValue
                }
            };
        }
        case FILTER_ASSETS: {
            return {
                ...state,
                filterTextAsset: action.filterText
            };
        }
        case FILTER_MISSIONS: {
            return {
                ...state,
                filterTextMission: action.filterText
            };
        }
        case HIGHLIGHT_ANOMALY: {
            const mission = find(state.missions, item => item.current);
            const anomalies = mission.anomalies.map((a => {
                return {...a, selected: action.anomalyId === a.id};
            }));
            return {
                ...state,
                missions: updateItem(state.missions, {id: mission.id}, {anomalies})
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
        case LOADING_ANOMALIES: {
            return {
                ...state,
                loadingAnomalies: action.loading
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
        case LOADING_MISSION_DATA: {
            const item = find(state.missions, i => i.selected);
            return arrayUpdate("missions", {...item, loadingData: action.loading}, i => i.selected, state);
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
                missions = updateDrone(missions, missions[currentMissionIndex].id, { isVisible: false }, null);
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
        case RESET_HIGHLIGHT_ANOMALY: {
            const mission = find(state.missions, item => item.current);
            const anomalies = mission.anomalies.map((a => {
                return {...a, selected: false};
            }));
            return {
                ...state,
                missions: updateItem(state.missions, {id: mission.id}, {anomalies})
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
                assets: updateItem(state.assets, {id: action.id}, action.props)
            };
        }
        case UPDATE_DATE_FILTER_EXCEPTION: {
            return set("dateFilter.error", action.error, state);
        }
        case UPDATE_DATE_FILTER_VALUE: {
            let operator = action.value.endDate ? "><" : ">=";
            return {
                ...state,
                dateFilter: {
                    ...state.dateFilter,
                    fieldValue: action.value,
                    operator
                }
            };
        }
        case UPDATE_DRONE_GEOMETRY: {
            return {
                ...state,
                missions: updateDrone(state.missions, action.missionId, {}, action.geometry, { rotation: action.yaw })
            };
        }
        case UPDATE_MISSION: {
            return {
                ...state,
                missions: updateItem(state.missions, {id: action.id}, action.props)
            };
        }
        default:
            return state;
    }
}
