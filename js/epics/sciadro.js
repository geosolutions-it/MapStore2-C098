/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { sortBy, isArray, includes/*, camelCase*/ } from 'lodash';
import { saveAs } from 'file-saver';
import * as Rx from 'rxjs';
import {
    ADD_FEATURE_ASSET,
    CHANGE_CURRENT_ASSET,
    CHANGE_CURRENT_MISSION,
    DRAW_ASSET,
    DOWNLOAD_FRAME,
    ENTER_CREATE_ITEM,
    HIDE_ADDITIONAL_LAYER,
    RESET_CURRENT_ASSET,
    RESET_CURRENT_MISSION,
    SELECT_ASSET,
    SELECT_MISSION,
    START_LOADING_ASSETS,
    START_SAVING_ASSET,
    START_SAVING_MISSION,
    UPDATE_DRONE_GEOMETRY,
    ZOOM_TO_ITEM,
    changeMode,
    downloadingFrame,
    downloadingFrameError,
    downloadingFrameSuccess,
    endSaveAsset,
    endSaveMission,
    fetchFeatureSciadroServerError,
    loadAssetError,
    loadedAssets,
    loadedMissions,
    loadingAnomalies,
    loadingAssetFeature,
    loadingAssets,
    loadingMissionFeature,
    loadingMissions,
    loadMissionError,
    saveAssetSuccess,
    saveMissionSuccess,
    saveError,
    updateAsset,
    updateMission,
    zoomToItem
} from '@js/actions/sciadro';
import {saveResource, getMissionData, getAssetResource, getMissionResource, getFrameImage} from "@js/API/Persistence";
import {
    assetEditedSelector,
    assetSelectedFeatureSelector,
    assetSelectedSelector,
    assetZoomLevelSelector,
    backendUrlSelector,
    droneZoomLevelSelector,
    featureStyleSelector,
    missionEditedSelector,
    missionLoadedSelector,
    missionSelectedFeatureSelector,
    missionSelectedDroneFeatureSelector,
    missionSelectedSelector,
    missionZoomLevelSelector,
    missionsIdSelector
} from '@js/selectors/sciadro';
import {addTelemInterval, addStartingOffset, addStartingOffsetFrame, getStyleFromType, getAdditionalLayerAction, removeAdditionalLayerById} from '@js/utils/sciadro';
import {
    zoomToPoint, zoomToExtent
} from '@mapstore/actions/map';
import {
    onShapeSuccess
} from '@mapstore/actions/shapefile';
import {
    UPDATE_MAP_LAYOUT, updateMapLayout
} from '@mapstore/actions/maplayout';
import {
    getGeoJSONExtent
} from '@mapstore/utils/CoordinatesUtils';
import GeoStoreApi from "@mapstore/api/GeoStoreDAO";
import {LOGIN_SUCCESS} from "@mapstore/actions/security";
import * as Persistence from "@mapstore/api/persistence/index";
import {changeDrawingStatus} from '@mapstore/actions/draw';

const ADDITIONAL_LAYERS = {
    asset: {
        id: "assets"
    },
    mission: {
        id: "missions"
    }
};
/**
 * it adds to the additinalAssetlayer the feature dropped in the dropzone
 * @param {external:Observable} action$ manages `ADD_FEATURE_ASSET`
 * @memberof epics.sciadro
 * @return {external:Observable}
**/
export const addFeatureAssetEpic = (action$, store) =>
    action$.ofType(ADD_FEATURE_ASSET)
        .switchMap((a) => {
            const state = store.getState();
            const assetEdit = assetEditedSelector(state);

            const feature = a.layer.features && a.layer.features.length && a.layer.features[0];
            const featureWithStyle = {...feature, style: a.layer.style };
            return Rx.Observable.from([
                getAdditionalLayerAction({feature: featureWithStyle, id: "assets", name: "assets", style: a.layer.style}),
                updateAsset({feature: featureWithStyle}, assetEdit.id)
            ]);
        });

/**
 * download the frame retrieved on the server
 * @param {external:Observable} action$ manages `DOWNLOAD_FRAME`
 * @memberof epics.sciadro
 * @return {external:Observable}
 **/
export const downloadFrameEpic = (action$, store) =>
    action$.ofType(DOWNLOAD_FRAME)
        .switchMap((a) => {
            const state = store.getState();
            const asset = assetSelectedSelector(state);
            const mission = missionSelectedSelector(state);
            return getFrameImage({
                missionId: mission.attributes && mission.attributes.sciadroResourceId,
                frameId: a.frame,
                assetId: asset.attributes && asset.attributes.sciadroResourceId
            })
            .switchMap(({data}) => {
                fetch(data)
                .then(res => res.blob())
                .then( (image) => {
                    saveAs(new Blob([(image)], {type: "image/png"}), `${a.frame}.png`); // TODO ASK this must be configurable?
                });
                return Rx.Observable.from([downloadingFrameSuccess(), downloadingFrame(false, a.frame)]);
            })
            .catch(() => {
                return Rx.Observable.from([downloadingFrameError(), downloadingFrame(false, a.frame)]); // error on sciadro backend
            });
        });

/**
 * trigger draw of the asset feature
 * @param {external:Observable} action$ manages `DRAW_ASSET`
 * @memberof epics.sciadro
 * @return {external:Observable}
 **/
export const drawAssetFeatureEpic = (action$) =>
    action$.ofType(DRAW_ASSET)
        .switchMap((a) => {
            const drawOptions = {
                stopAfterDrawing: true,
                editEnabled: false,
                selectEnabled: false,
                drawEnabled: true,
                translateEnabled: false,
                transformToFeatureCollection: false
            };
            return Rx.Observable.of(
                removeAdditionalLayerById(ADDITIONAL_LAYERS.asset.id),
                changeDrawingStatus("start", a.drawMethod, "sciadro", [], drawOptions, getStyleFromType(a.drawMethod)));
        });

/**
 * fetch the asset feature from sciadro backend if it is undefined,
 * otherwise it returns directly the actions to dispatch
 * @param {external:Observable} action$ manages `SELECT_ASSET`, `CHANGE_CURRENT_ASSET`
 * @memberof epics.sciadro
 * @return {external:Observable}
 */
export const getAssetFeatureEpic = (action$, store) =>
    action$.ofType(SELECT_ASSET, CHANGE_CURRENT_ASSET)
    .flatMap((a) => {
        let actions = [];
        let state = store.getState();
        const backendUrl = backendUrlSelector(state);
        const asset = assetSelectedSelector(state);
        const featureAsset = assetSelectedFeatureSelector(state);

        if (asset && featureAsset === undefined) {
            // go fetch it
            const errorsActions = () => [fetchFeatureSciadroServerError(), loadingAssetFeature(false)];
            const postProcessActions = (item) => {
                const assetFeature = {
                    "type": "Feature",
                    "geometry": item.geometry ? item.geometry : {
                        "type": "LineString",
                        "coordinates": [[10.39985, 43.71074], [10.40483, 43.71074]]
                    },
                    "style": featureStyleSelector(state, "asset", item.geometry && item.geometry.type || "LineString" )

                };
                actions = [updateAsset({ feature: assetFeature, loadingFeature: false }, a.id)];
                state = store.getState();
                const assetSelected = assetSelectedSelector(state);
                if (assetSelected.name === item.name) {
                    actions.push(getAdditionalLayerAction({ feature: {...item.feature, ...assetFeature, id: a.id}, id: "assets", name: "assets", visibility: !!item.feature }));
                    if (a.type === CHANGE_CURRENT_ASSET) {
                        actions.push(changeMode("mission-list"));
                    }
                }
                return actions;
            };
            return getAssetResource({ id: asset.attributes.sciadroResourceId, postProcessActions, errorsActions, backendUrl })
                .startWith(
                    loadingAssetFeature(true),
                    getAdditionalLayerAction({feature: null, id: "assets", name: "assets", visibility: false})
                );
        }
        // if null, or object it means we have already fetched it. We just update the assets additional layer
        const postProcessActions = (item) => {
            if (a.type === CHANGE_CURRENT_ASSET) {
                actions.push(changeMode("mission-list"));
            }
            actions.push(getAdditionalLayerAction({feature: item.feature, id: "assets", name: "assets", visibility: !!item.feature}));
            return actions;
        };
        return Rx.Observable.from(postProcessActions({feature: featureAsset}));
    });

/**
 * fetch the mission feature from sciadro backend
 * @param {external:Observable} action$ manages `SELECT_MISSION`
 * @memberof epics.sciadro
 * @return {external:Observable}
 */
export const getMissionFeatureEpic = (action$, store) =>
    action$.ofType(SELECT_MISSION)
        .flatMap((a) => {
            let actions = [];
            const state = store.getState();
            const mission = missionSelectedSelector(state);
            const backendUrl = backendUrlSelector(state);

            const featureMission = missionSelectedFeatureSelector(state);
            const asset = assetSelectedSelector(state);
            const errorsActions = () => [fetchFeatureSciadroServerError(), loadingMissionFeature(false)];
            const postProcessActions = (item) => {
                const fakeFeature = {
                    "type": "Feature",
                    "geometry": {
                        "type": "LineString",
                        "coordinates": [
                            [ 10.39985, 43.71064 ],
                            [ 10.40483, 43.71064 ]
                        ]
                    },
                    "style": {
                        "color": "#FF0000",
                        "weight": 5
                    }
                };
                if (item.feature || fakeFeature) {
                    actions = [...actions, updateMission({
                        feature: item.feature || fakeFeature,
                        videoUrl: item.video_file,
                        loadingFeature: false
                    }, a.id)];
                }
                actions = [...actions, getAdditionalLayerAction({feature: item.feature || fakeFeature, id: "missions", name: "missions", visibility: !!item.feature})];
                actions = [...actions, loadingMissionFeature(false)];
                return actions;
            };
            if (mission && featureMission === undefined) {
                // go fetch it
                return getMissionResource({
                    assetId: asset.attributes.sciadroResourceId,
                    backendUrl,
                    id: mission.attributes.sciadroResourceId,
                    errorsActions,
                    postProcessActions
                }).startWith(
                    loadingMissionFeature(true),
                    getAdditionalLayerAction({feature: null, id: "missions", name: "missions", visibility: false})
                );
            }
            // if null, or object it means we have already fetched it. We just update the missions additional layer
            return Rx.Observable.from(postProcessActions({feature: featureMission}));
        });

/**
 * hide additional layer
 * @param {external:Observable} action$ manages `HIDE_ADDITIONAL_LAYER`
 * @memberof epics.sciadrfoldo
 * @return {external:Observable}
 **/

export const hideAdditionalLayerEpic = (action$) =>
    action$.ofType(HIDE_ADDITIONAL_LAYER)
        .switchMap((a) => {
            return Rx.Observable.of(removeAdditionalLayerById(a.id));
        });
/**
 * hide assets layer
 * @param {external:Observable} action$ manages `ENTER_CREATE_ITEM`
 * @memberof epics.sciadro
 * @return {external:Observable}
 **/
export const hideAssetsLayerEpic = (action$) =>
    action$.ofType(ENTER_CREATE_ITEM)
        .switchMap(() => {
            // TODO handle mode from action here
            return Rx.Observable.of(removeAdditionalLayerById("assets"));
        });

/**
 * override map layout in order to consider the always opened panel
 * @param {external:Observable} action$ manages `ZOOM_TO_ITEM`
 * @memberof epics.sciadro
 * @return {external:Observable}
**/
export const overrideMapLayoutEpic = (action$) =>
    action$.ofType(UPDATE_MAP_LAYOUT)
        .take(1)
        .switchMap(() => {
            return Rx.Observable.of(updateMapLayout({
                left: 500,
                right: 0,
                bottom: 30,
                transform: 'none',
                height: 'calc(100% - 30px)',
                boundingMapRect: {
                    left: 500,
                    right: 0,
                    bottom: 30
                }
            }));
        });


/**
 * get assets Resources
 * @param {external:Observable} action$ manages `START_LOADING_ASSETS`, `LOGIN_SUCCESS`
 * @memberof epics.sciadro
 * @return {external:Observable}
 */
export const startLoadingAssetsEpic = (action$) =>
    action$.ofType(START_LOADING_ASSETS, LOGIN_SUCCESS)
        .switchMap(() => {
            // get all assets moved into componens
            return Rx.Observable.defer( () =>
                GeoStoreApi.getResourcesByCategory("ASSET").then(data => data)
            )
            .switchMap(({results = []}) => {
                 // if 1 result geostore returns an object
                const resources = isArray(results) ? results : [results];
                if (resources.length && results) {
                    // observables object that will retrieve all the info of the reosurces
                    const getResourcesObs = resources.map(({id}) => {
                        return Persistence.getResource(id, {withPermissions: true})
                            .catch(() => Rx.Observable.of("loadError"));
                    });
                    return Rx.Observable.forkJoin(getResourcesObs);
                }
                return Rx.Observable.of([null]);
            })
            .switchMap((assets = []) => {
                if (assets.length === 1 && assets[0] === "loadError") {
                    return Rx.Observable.from([
                        loadAssetError(),
                        loadingAssets(false)]);
                }
                if (assets.length === 1 && !assets[0]) {
                    return Rx.Observable.of(loadingAssets(false));
                }
                const assetsSorted = sortBy(assets, ["id"]).map(a => {
                    return {...a, permissions: {SecurityRuleList: { SecurityRule: a.permissions}}, attributes: {...a.attributes, missions: `${a.attributes.missions || "801"}`}};
                    // TODO remove when mission creation is fixed
                });
                return Rx.Observable.of(loadedAssets( assetsSorted));
                 // if 1 result geostore returns an object
            })
            .catch(() => Rx.Observable.of(loadAssetError()))
            .startWith(loadingAssets(true));
        });


/**
 * get related missions Resources
 * @param {external:Observable} action$ manages `CHANGE_CURRENT_ASSET`
 * @memberof epics.sciadro
 * @return {external:Observable}
 */
export const startLoadingMissionsEpic = (action$, {getState = () => {} }) =>
    action$.ofType(CHANGE_CURRENT_ASSET)
        .filter(() => {
            const state = getState();
            const missionAlreadyLoaded = missionLoadedSelector(state);
            const missionsIds = missionsIdSelector(state);
            return !missionAlreadyLoaded && missionsIds.length;
        })
        .switchMap(() => {
            // get all missions from selectedAsset
            const state = getState();
            const missionsIds = missionsIdSelector(state);

            // observables object that will retrieve all the info of the reosurces
            const getResourcesObs = missionsIds.map((id) => {
                return Persistence.getResource(id)
                    .catch(() => Rx.Observable.of("loadError"));
            });
            return Rx.Observable.forkJoin(getResourcesObs)
                .switchMap((missions = []) => {
                    if (missions.length === 1 && missions[0] === "loadError") {
                        return Rx.Observable.from([
                            loadMissionError(),
                            loadingMissions(false)]);
                    }
                    if (missions.length === 1 && !missions[0]) {
                        return Rx.Observable.of(loadingMissions(false));
                    }
                    const missionsSorted = sortBy(missions, ["id"]);
                    const asset = assetSelectedSelector(state);
                    return Rx.Observable.from([
                        loadedMissions( missionsSorted),
                        updateAsset({missionLoaded: true}, asset.id)
                    ]);
                }).startWith(loadingMissions(true));
        })
        .catch(() => Rx.Observable.of(loadMissionError()));
/**
 * get missions details
 * @param {external:Observable} action$ manages `CHANGE_CURRENT_MISSION`
 * @memberof epics.sciadro
 * @return {external:Observable}
 */
export const startLoadingMissionsDetailsEpic = (action$, {getState = () => {} }) =>
    action$.ofType(CHANGE_CURRENT_MISSION)
        .switchMap((action) => {
            const state = getState();
            const mission = missionSelectedSelector(state);
            const asset = assetSelectedSelector(state);
            const backendUrl = backendUrlSelector(state);

            return getMissionData({
                missionId: mission.attributes.sciadroResourceId,
                assetId: asset.attributes.sciadroResourceId,
                backendUrl
            })
            .switchMap((data = {}) => {

                let frames = addStartingOffsetFrame(data.frames || []);
                let telemetries;
                let attUndensified = [];
                let attUndensifiedTimes = [];
                data.telemetries.telemetry_attributes.forEach(a => {
                    if ( !includes(attUndensifiedTimes, Math.floor(a.time / 1000))) {
                        attUndensified = attUndensified.concat([a]);
                        attUndensifiedTimes = attUndensifiedTimes.concat([Math.floor(a.time / 1000)]);
                    }
                });
                let posUndensified = [];
                let posUndensifiedTimes = [];
                data.telemetries.telemetry_positions.forEach(a => {
                    if ( !includes(posUndensifiedTimes, Math.floor(a.time / 1000))) {
                        posUndensifiedTimes = posUndensifiedTimes.concat([Math.floor(a.time / 1000)]);
                        posUndensified = posUndensified.concat([a]);
                    }
                });
                if (attUndensified.length === posUndensified.length) {
                    telemetries = attUndensified.map((item, i) => {
                        let attData = attUndensified[i];
                        let posData = posUndensified[i];
                        return {
                            ...attData,
                            ...posData
                        };
                    });
                }

                telemetries = addStartingOffset(sortBy(telemetries, ["time"]) || []);

                let missionGeom = telemetries.reduce((p, t) => {
                    return {
                        type: "LineString",
                        coordinates: p.coordinates.concat([[t.longitude, t.latitude]])
                    };
                }, {coordinates: []});
                let anomalies = data.anomalies;
                let actions = [updateMission({
                        loadingData: false,
                        size: data.size || [1024, 768],
                        frames,
                        telemetries,
                        anomalies,
                        feature: {...mission.feature, geometry: missionGeom},
                        drone: {
                            type: "Feature",
                            geometry: {
                                type: "Point",
                                coordinates: [ 10.39985, 43.71064 ]
                            },
                            style: {
                                iconUrl: "/localAssets/images/drone-nord.svg",
                                size: [24, 24],
                                iconAnchor: [0.5, 0.5]
                            },
                            properties: {
                                isVisible: true
                            }
                        },
                        telemInterval: 200 || addTelemInterval(telemetries)
                    }, action.id),
                    loadingAnomalies(false)
                ];
                return Rx.Observable.from(actions);
            }).startWith(loadingAnomalies(true));
        })
        .catch(() => Rx.Observable.of(loadMissionError()));

/**
 * it sends request to save the asset metadata and geom in the backend servers
 * @param {external:Observable} action$ manages `START_SAVING_ASSET`
 * @memberof epics.sciadro
 * @return {external:Observable}
**/
export const saveAssetEpic = (action$, store) =>
    action$.ofType(START_SAVING_ASSET)
        .switchMap((a) => {
            const state = store.getState();
            const backendUrl = backendUrlSelector(state);
            const asset = assetEditedSelector(state);
            const resource = {
                id: asset.id,
                name: asset.name,
                feature: asset.feature,
                description: asset.description,
                note: asset.attributes && asset.attributes.note || "",
                type: asset.attributes && asset.attributes.type || ""
            };
            const postProcessActions = (sciadroData, idResourceGeostore) =>[
                saveAssetSuccess(resource.name),
                updateAsset({
                    attributes: {
                        ...asset.attributes,
                        sciadroResourceId: sciadroData.id,
                        created: sciadroData.created,
                        modified: sciadroData.modified,
                        note: sciadroData.note,
                        type: sciadroData.type,
                        missions: sciadroData.missions.join(",")
                    },
                    id: idResourceGeostore,
                    feature: sciadroData.feature // what if backend returns a malformed/corrupted feature?
                }, a.id),
                endSaveAsset()
            ];
            const errorsActions = (id, message) => [saveError(id, message)];
            return saveResource({resource, category: "ASSET", resourcePermissions: {}, postProcessActions, errorsActions, backendUrl});
        });

/**
* it sends request to save the mission with files to sciadroBackend and also in geostore
* @param {external:Observable} action$ manages `START_SAVING_MISSION`
* @memberof epics.sciadro
* @return {external:Observable}
**/
export const saveMissionEpic = (action$, store) =>
    action$.ofType(START_SAVING_MISSION)
    .switchMap((a) => {
        const state = store.getState();
        const mission = missionEditedSelector(state);
        const backendUrl = backendUrlSelector(state);
        const asset = assetSelectedSelector(state); // TODO EVALUATE LATER: instead of taking the info from the asset selected we can save this id into the mission object and retrieving from there
        const resource = {
            name: mission.name/*,
            id: mission.id,
            description: mission.description,
            /*assetId: asset.id,
            missions: asset.attributes.missions,
            note: mission.attributes.note // TODO TEST THIS*/
        };
        const postProcessActions = (sciadroData, idResourceGeostore) => [
            saveMissionSuccess(resource.name),
            updateMission({
                // TODO VERIFY we are not missing anything
                attributes: {
                    ...mission.attributes,
                    sciadroResourceId: sciadroData.id,
                    created: sciadroData.created,
                    modified: sciadroData.modified,
                    note: sciadroData.note
                },
                id: idResourceGeostore,
                anomalies: sciadroData.anomalies || [],
                telemetries: sciadroData.telemetries || [],
                feature: sciadroData.feature // what if backend returns a malformed/corrupted feature?
            }, a.id),
            updateAsset({
                missionLoaded: true,
                // TODO VERIFY we are not missing anything
                attributes: {...asset.attributes, missions: asset.attributes && asset.attributes.missions ? `${asset.attributes.missions},${idResourceGeostore}` : `${idResourceGeostore}`}
            }, asset.id),
            endSaveMission()
        ];
        const errorsActions = (id, message) => [saveError(id, message)];
        return saveResource({
            backendUrl,
            resource,
            category: "MISSION",
            resourcePermissions: {},
            fileUrl: mission.files,
            updateAssetAttribute: true,
            path: `assets/${asset.attributes.sciadroResourceId}/missions/`,
            postProcessActions,
            errorsActions });
    });

/**
 * Shows in the map the asset's and/or mission's features and drone
 * @param {external:Observable} action$ manages `RESET_CURRENT_ASSET`, `RESET_CURRENT_MISSION`, START_SAVING_ASSET`
 * @memberof epics.sciadro
 * @return {external:Observable}
 */
export const updateAdditionalLayerEpic = (action$, store) =>
    action$.ofType(RESET_CURRENT_ASSET, RESET_CURRENT_MISSION, START_SAVING_ASSET )
        .switchMap((a) => {
            let actions = [];
            const state = store.getState();

            const featureAsset = assetSelectedFeatureSelector(state);
            const featureMission = missionSelectedFeatureSelector(state);
            const featureDrone = missionSelectedDroneFeatureSelector(state);

            if (a.type === RESET_CURRENT_ASSET || a.type === START_SAVING_ASSET ) {
                actions.push(changeDrawingStatus("clean", "", "sciadro", [], {}, {}));
                actions.push(onShapeSuccess(null));
            }

            // remove or update features for assets, missions and drones
            actions.push(getAdditionalLayerAction({feature: featureAsset, id: "assets", name: "assets", visibility: !!featureAsset}));
            actions.push(getAdditionalLayerAction({feature: featureMission, id: "missions", name: "missions", visibility: !!featureMission}));
            actions.push(getAdditionalLayerAction({feature: featureDrone, id: "drone", name: "drone", visibility: !!featureDrone}));

            return Rx.Observable.from(actions);
        });

/**
 * Shows in the map the asset's and/or mission's features and drone
 * @param {external:Observable} action$ manages `RESET_CURRENT_ASSET`, `RESET_CURRENT_MISSION`, START_SAVING_ASSET`
 * @memberof epics.sciadro
 * @return {external:Observable}
 */
export const updateDroneAdditionalLayerEpic = (action$, store) =>
    action$.ofType(UPDATE_DRONE_GEOMETRY )
        .switchMap(() => {
            let actions = [];
            const state = store.getState();
            const featureDrone = missionSelectedDroneFeatureSelector(state);
            actions.push(zoomToItem("missions"));
            actions.push(getAdditionalLayerAction({feature: featureDrone, id: "drone", name: "drone", visibility: !!featureDrone}));
            return Rx.Observable.from(actions);
        });

/**
 * hide assets layer
 * @param {external:Observable} action$ manages `ZOOM_TO_ITEM`
 * @memberof epics.sciadro
 * @return {external:Observable}
 **/
export const zoomToItemEpic = (action$, store) =>
    action$.ofType(ZOOM_TO_ITEM)
        .switchMap((a) => {
            let feature;
            let zoom;
            const state = store.getState();
            const featureMission = missionSelectedFeatureSelector(state);
            const featureAsset = assetSelectedFeatureSelector(state);
            const featureDrone = missionSelectedDroneFeatureSelector(state);
            if (a.zoomTo === "drone") {
                feature = featureDrone;
                zoom = droneZoomLevelSelector(state);
            } else {
                zoom = featureMission ? missionZoomLevelSelector(state) : assetZoomLevelSelector(state);
                feature = featureMission || featureAsset;
            }
            if (feature) {
                if (feature.geometry.type === "Point") {
                    return Rx.Observable.of(zoomToPoint(feature.geometry.coordinates, zoom, "EPSG:4326"));
                }
                return Rx.Observable.of(zoomToExtent(getGeoJSONExtent(feature), "EPSG:4326"));
            }
            return Rx.Observable.empty();
        });
