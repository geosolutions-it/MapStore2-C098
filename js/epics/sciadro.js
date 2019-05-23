/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { sortBy, isArray, camelCase } from 'lodash';
import { saveAs } from 'file-saver';
import * as Rx from 'rxjs';
import {
    ADD_FEATURE_ASSET,
    CHANGE_CURRENT_ASSET,
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
import {saveResource, getAssetResource, getMissionResource, getFrameImage} from "@js/API/Persistence";
import {
    assetEditedSelector,
    assetSelectedFeatureSelector,
    assetSelectedSelector,
    assetZoomLevelSelector,
    droneZoomLevelSelector,
    missionEditedSelector,
    missionLoadedSelector,
    missionSelectedFeatureSelector,
    missionSelectedDroneFeatureSelector,
    missionSelectedSelector,
    missionZoomLevelSelector,
    missionsIdSelector
} from '@js/selectors/sciadro';
import {addStartingOffsetFrame, addStartingOffset, getStyleFromType, addTelemInterval, getAdditionalLayerAction, removeAdditionalLayerById} from '@js/utils/sciadro';
// mapstore
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
        const backendUrl = state.sciadro && state.sciadro.sciadroBackendUrl;
        const asset = assetSelectedSelector(state);
        const featureAsset = assetSelectedFeatureSelector(state);
        if (asset && featureAsset === undefined) {
            // go fetch it
            const errorsActions = () => [fetchFeatureSciadroServerError()];
            const postProcessActions = (item) => {
                const fakeFeature = {
                    "type": "Feature",
                    "geometry": {
                        "type": "LineString",
                        "coordinates": [[10.39985, 43.71074], [10.40483, 43.71074]]
                    },
                    "style": {
                        "color": "#00FF00",
                        "weight": 2
                    }
                };
                actions = [updateAsset({ feature: item.feature || fakeFeature, loadingFeature: false }, a.id)];
                state = store.getState();
                const assetSelected = assetSelectedSelector(state);
                if (assetSelected.name === item.name) {
                    actions.push(getAdditionalLayerAction({ feature: {...item.feature, ...fakeFeature, id: a.id}, id: "assets", name: "assets", visibility: !!item.feature }));
                    if (a.type === CHANGE_CURRENT_ASSET) {
                        actions.push(changeMode("mission-list"));
                    }
                }
                return actions;
            };
            return getAssetResource({ id: asset.sciadroResourceId, postProcessActions, errorsActions, backendUrl })
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

            const featureMission = missionSelectedFeatureSelector(state);
            const asset = assetSelectedSelector(state);
            const errorsActions = () => [fetchFeatureSciadroServerError()];
            const postProcessActions = (item) => {
                if (item.feature) {
                    let telemetries = mission.telemetries || addStartingOffset(item.telemetries || []);
                    let frames = mission.telemetries || addStartingOffsetFrame(item.frames || []);
                    let anomalies = mission.anomalies || item.anomalies;
                    actions = [...actions, updateMission({
                        feature: item.feature,
                        loadingFeature: false,
                        frames: frames,
                        size: mission.size || item.size,
                        anomalies: anomalies.map(anomaly => {
                            return Object.keys(anomaly).reduce((p, c) => {
                                return {...p, [camelCase(c)]: anomaly[c]};
                            }, {});
                        }),
                        telemetries: telemetries,
                        telemInterval: addTelemInterval(telemetries)
                    },
                    a.id)];
                }
                actions = [...actions, getAdditionalLayerAction({feature: item.feature, id: "missions", name: "missions", visibility: !!item.feature})];
                return actions;
            };
            if (mission && featureMission === undefined) {
                // go fetch it
                return getMissionResource({
                    id: mission.attributes.sciadroResourceId,
                    assetId: asset.attributes.sciadroResourceId,
                    postProcessActions,
                    errorsActions
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
            // .combineAll()
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
                    return {...a, permissions: {SecurityRuleList: { SecurityRule: a.permissions}}, attributes: {...a.attributes, missionsId: `${a.attributes.missionsId || ""}`}};
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
 * it sends request to save the asset metadata and geom in the backend servers
 * @param {external:Observable} action$ manages `START_SAVING_ASSET`
 * @memberof epics.sciadro
 * @return {external:Observable}
**/
export const saveAssetEpic = (action$, store) =>
    action$.ofType(START_SAVING_ASSET)
        .switchMap((a) => {
            const state = store.getState();
            const asset = assetEditedSelector(state);
            const resource = {
                id: asset.id,
                name: asset.name,
                feature: asset.feature,
                description: asset.description,
                note: asset.note,
                type: asset.type
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
                        missionsId: sciadroData.missions.join(",")
                    },
                    id: idResourceGeostore,
                    feature: sciadroData.feature // what if backend returns a malformed/corrupted feature?
                }, a.id),
                endSaveAsset()
            ];
            const errorsActions = (id, message) => [saveError(id, message)];
            return saveResource({resource, category: "ASSET", resourcePermissions: {}, postProcessActions, errorsActions});
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
        const asset = assetSelectedSelector(state); // TODO EVALUATE LATER: instead of taking the info from the asset selected we can save this id into the mission object and retrieving from there
        const resource = {
            id: mission.id,
            name: mission.name,
            description: mission.description,
            assetId: asset.id,
            missionsId: asset.attributes.missionsId,
            note: mission.attributes.note // TODO TEST THIS
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
                attributes: {...asset.attributes, missionsId: asset.attributes && asset.attributes.missionsId ? `${asset.attributes.missionsId},${idResourceGeostore}` : `${idResourceGeostore}`}
            }, asset.id),
            endSaveMission()
        ];
        const errorsActions = (id, message) => [saveError(id, message)];
        return saveResource({
            resource,
            category: "MISSION",
            resourcePermissions: {},
            fileUrl: mission.files,
            updateAssetAttribute: true,
            path: `assets/${asset.attributes.sciadroResourceId}/missions`,
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
            actions.push(zoomToItem("drone"));
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
