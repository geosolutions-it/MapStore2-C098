/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import * as Rx from 'rxjs';
import {sortBy} from 'lodash';
import {
    START_LOADING_ASSETS,
    DRAW_ASSET,
    SELECT_ASSET,
    SELECT_MISSION,
    RESET_CURRENT_ASSET,
    RESET_CURRENT_MISSION,
    CHANGE_CURRENT_ASSET,
    START_SAVING_ASSET,
    ENTER_CREATE_ITEM,
    HIDE_ADDITIONAL_LAYER,
    ZOOM_TO_ITEM,
    ADD_FEATURE_ASSET,
    loadedAssets,
    updateAsset,
    loadingAssets,
    endSaveAsset,
    changeMode,
    loadingAssetFeature,
    // error/success feedbacks
    loadAssetError,
    saveError,
    saveAssetSuccess,
    fetchFeatureSciadroServerError
} from '@js/actions/sciadro';
import {getStyleFromType} from "@js/utils/sciadro";
import {saveResource, getAssetResource} from "@js/API/Persistence";
import {
    missionSelectedFeatureSelector,
    assetSelectedFeatureSelector,
    missionSelectedDroneFeatureSelector,
    assetEditedSelector,
    assetSelectedSelector,
    missionSelectedSelector
} from '@js/selectors/sciadro';
import {getAdditionalLayerAction, removeAdditionalLayerById} from '@js/utils/sciadro';
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

const mockAssetsGeojson = [{
    type: "Feature",
    geometry: {
        type: "Point",
        coordinates: [9, 45]
    },
    style: {
        iconColor: "orange",
        iconShape: "circle",
        iconGlyph: "comment"
    },
    id: 36
},
{
    type: "Feature",
    geometry: {
        type: "LineString",
        coordinates: [[9, 44], [4, 44]]
    },
    style: {
        color: "#FF0000",
        weight: 3
    },
    id: 10
},
{
    type: "Feature",
    geometry: {
        type: "Point",
        coordinates: [9, 42]
    },
    style: {
        iconColor: "orange",
        iconShape: "circle",
        iconGlyph: "comment"
    },
    id: 28
}];


/**
 * get assets Resources
 * @param {external:Observable} action$ manages `START_LOADING_ASSETS`, `LOGIN_SUCCESS`
 * @memberof epics.sciadro
 * @return {external:Observable}
 */
export const startLoadingAssetsEpic = (action$, store) =>
    action$.ofType(START_LOADING_ASSETS, LOGIN_SUCCESS)
        .switchMap(() => {
            // get all assets
            return Rx.Observable.defer( () =>
                GeoStoreApi.getResourcesByCategory("ASSET").then(data => data)
            )
            .switchMap(({results = []}) => {
                if (results.length) {
                    // observables object that will retrieve all the info of the reosurces
                    const getResourcesObs = results.map(({id}) => {
                        return Persistence.getResource(id)
                            .catch(() => Rx.Observable.of("loadError"));
                    });
                    return getResourcesObs;
                }
                return Rx.Observable.of([null]);
            })
            .combineAll()
            .switchMap((assets = []) => {
                if (assets.length === 1 && assets[0] === "loadError") {
                    return Rx.Observable.from([
                        loadAssetError(),
                        loadingAssets(false)]);
                }
                if (assets.length === 1 && !assets[0]) {
                    return Rx.Observable.of(loadingAssets(false));
                }
                // adding a fake asset geom and a fake mission to each asset
                const state = store.getState();
                const assetSelected = assetSelectedSelector(state);


                // TODO retrieve the feature from sciadro backend only on select
                const assetsWithMission = sortBy(assets, ["id"]).map((a, i) => ({
                    ...a,
                    type: "PIP",
                    feature: a.id === (assetSelected && assetSelected.id) ? assetSelected.feature : mockAssetsGeojson[i],
                    missionsId: [1],
                    selected: a.id === (assetSelected && assetSelected.id)}));
                return Rx.Observable.of(loadedAssets(assetsWithMission));
            })
            .catch(() => Rx.Observable.of(loadAssetError()));// this is probably unneeded
        }).startWith(loadingAssets(true));


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
        const asset = assetSelectedSelector(state);
        const featureAsset = assetSelectedFeatureSelector(state);
        if (featureAsset === undefined) {
            // go fetch it
            const errorsActions = () => [fetchFeatureSciadroServerError()];
            const postProcessActions = (item) => {
                actions = [updateAsset({ feature: item.feature, loadingFeature: false }, a.id)];
                state = store.getState();
                const assetSelected = assetSelectedSelector(state);
                if (assetSelected.name === item.name) {
                    actions.push(getAdditionalLayerAction({ feature: {...item.feature, id: a.id}, id: "assets", name: "assets", visibility: !!item.feature }));
                    if (a.type === CHANGE_CURRENT_ASSET) {
                        actions.push(changeMode("mission-list"));
                    }
                    return actions;
                }
                return actions;
            };
            return getAssetResource({ id: asset.attributes.sciadroResourceId, postProcessActions, errorsActions })
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
        .switchMap(() => {
            const state = store.getState();
            const featureMission = missionSelectedFeatureSelector(state);
            const errorsActions = () => [fetchFeatureSciadroServerError()];
            const postProcessActions = (mission) => [getAdditionalLayerAction({feature: mission.feature, id: "missions", name: "missions", visibility: !!mission.feature})];
            const mission = missionSelectedSelector(state);
            if (featureMission === undefined) {
                // go fetch it
                return getAssetResource({id: mission.attributes.sciadroResourceId, postProcessActions, errorsActions });
            }
            // if null, or object it means we have already fetched it. We just update the missions additional layer
            return Rx.Observable.from(postProcessActions({feature: featureMission}));
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
 * hide additional layer
 * @param {external:Observable} action$ manages `HIDE_ADDITIONAL_LAYER`
 * @memberof epics.sciadro
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
 * hide assets layer
 * @param {external:Observable} action$ manages `ZOOM_TO_ITEM`
 * @memberof epics.sciadro
 * @return {external:Observable}
 **/
export const zoomToItemEpic = (action$, store) =>
    action$.ofType(ZOOM_TO_ITEM)
        .switchMap((a) => {
            const state = store.getState();
            const featureMission = missionSelectedFeatureSelector(state);
            const featureAsset = assetSelectedFeatureSelector(state);
            const feature = featureMission || featureAsset;
            if (feature) {
                if (feature.geometry.type === "Point") {
                    return Rx.Observable.of(zoomToPoint(feature.geometry.coordinates, a.zoom, "EPSG:4326"));
                }
                return Rx.Observable.of(zoomToExtent(getGeoJSONExtent(feature), "EPSG:4326", a.zoom));
            }
            return Rx.Observable.empty();
        });

/**
 * override map layout in order to consider the always opened panel
 * @param {external:Observable} action$ manages `ZOOM_TO_ITEM`
 * @memberof epics.sciadro
 * @return {external:Observable}
**/
export const overrideMapLayoutEpic = (action$) =>
    action$.ofType(UPDATE_MAP_LAYOUT).take(1)
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
            return Rx.Observable.from([
                getAdditionalLayerAction({feature: feature || {}, id: "assets", name: "assets", style: a.layer.style}),
                updateAsset({feature, style: a.layer.style}, assetEdit.id)
            ]);
        });
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
                    sciadroResourceId: sciadroData.id,
                    id: idResourceGeostore,
                    missionsId: sciadroData.missions.join(","),
                    created: sciadroData.created,
                    feature: sciadroData.feature, // what if backend returns a malformed/corrupted feature?
                    modified: sciadroData.modified
                }, a.id),
                endSaveAsset()
            ];
            const errorsActions = (id, message) => [saveError(id, message)];
            return saveResource({resource, category: "ASSET", resourcePermissions: {}, postProcessActions, errorsActions});
        });
