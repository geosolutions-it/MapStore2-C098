/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import * as Rx from 'rxjs';
import {
    LOAD_ASSETS,
    DRAW_ASSET,
    SELECT_ASSET,
    SELECT_MISSION,
    RESET_CURRENT_ASSET,
    RESET_CURRENT_MISSION,
    CHANGE_CURRENT_MISSION,
    CHANGE_CURRENT_ASSET,
    START_SAVE_ASSET,
    ENTER_CREATE_ITEM,
    HIDE_ADDITIONAL_LAYER,
    ZOOM_TO_ITEM,
    ADD_FEATURE_ASSET,
    loadedAssets,
    updateAsset,
    loadingAssets,
    loadAssetError,
    // saveAssetError,
    endSaveAsset,
    saveAssetSuccess
} from '@js/actions/sciadro';
import {getStyleFromType} from "@js/utils/sciadro";
import {saveResource} from "@js/API/Persistence";
import {
    selectedMissionFeatureSelector,
    selectedAssetFeatureSelector,
    selectedDroneFeatureSelector,
    assetEditedSelector,
    assetSelectedSelector
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
} from '@mapstore/actions/mapLayout';
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
    }
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
    }
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
    }
}];


/**
 * get assets Resources
 * @param {external:Observable} action$ manages `LOAD_ASSETS`, `LOGIN_SUCCESS`
 * @memberof epics.sciadro
 * @return {external:Observable}
 */
export const loadAssetsEpic = (action$, store) =>
    action$.ofType(LOAD_ASSETS, LOGIN_SUCCESS)
     // .delay(3000) // remove after sciadro mock adapter is removed
        .switchMap(() => {
            // get all assets
            return Rx.Observable.defer( () =>
                GeoStoreApi.getResourcesByCategory("ASSET").then(data => data)
            )
            .switchMap(({results = []}) => {
                if (results.length) {
                    // observables object that will retrieve all the info of the reosurces
                    const getResourcesObs = results.map(({id}) => {
                        return Persistence.getResource(id).catch((e) => Rx.Observable.of(loadAssetError(e)));
                    });
                    return getResourcesObs;
                }
                return Rx.Observable.of([null]);
            })
            .combineAll()
            .switchMap((assets = []) => {
                if (assets.length === 1 && !assets[0]) {
                    return Rx.Observable.of(loadingAssets(false));
                }
                // adding a fake a  sset geom and a fake mission to each asset
                const state = store.getState();
                const assetSelected = assetSelectedSelector(state);

                const assetWithMission = assets.map((a, i) => ({
                    ...a,
                    type: "PIP",
                    feature: a.id === (assetSelected && assetSelected.id) ? assetSelected.feature : mockAssetsGeojson[i],
                    missionsId: [1],
                    selected: a.id === (assetSelected && assetSelected.id)}));
                return Rx.Observable.of(loadedAssets(assetWithMission));
            })
            .catch((e) => Rx.Observable.of(loadAssetError(e)));
        }).startWith(loadingAssets(true));


/**
 * Shows in the map the asset's and/or mission's features
 * @param {external:Observable} action$ manages `SELECT_MISSION`, `RESET_CURRENT_ASSET`, `RESET_CURRENT_MISSION`, `CHANGE_CURRENT_MISSION`, `CHANGE_CURRENT_ASSET`, `START_SAVE_ASSET`
 * @memberof epics.sciadro
 * @return {external:Observable}
 */
export const updateAdditionalLayerEpic = (action$, store) =>
    action$.ofType(SELECT_MISSION, SELECT_ASSET, RESET_CURRENT_ASSET, RESET_CURRENT_MISSION, CHANGE_CURRENT_MISSION, CHANGE_CURRENT_ASSET, START_SAVE_ASSET )
        .switchMap((a) => {
            let actions = [];
            const state = store.getState();

            const featureAsset = selectedAssetFeatureSelector(state);
            const featureMission = selectedMissionFeatureSelector(state);
            const featureDrone = selectedDroneFeatureSelector(state);
            if (a.type === RESET_CURRENT_ASSET || a.type === START_SAVE_ASSET ) {
                actions.push(changeDrawingStatus("clean", "", "sciadro", [], {}, {}));
                actions.push(onShapeSuccess(null));
            }
            actions.push(getAdditionalLayerAction({feature: featureAsset, id: "assets", name: "assets", visibility: !!featureAsset})); // remove or update feature for assets
            actions.push(getAdditionalLayerAction({feature: featureMission, id: "missions", name: "missions", visibility: !!featureMission})); // remove or update feature for missions
            actions.push(getAdditionalLayerAction({feature: featureDrone, id: "drone", name: "drone", visibility: !!featureDrone})); // remove or update feature for missions

            return Rx.Observable.from(actions);
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
            const featureMission = selectedMissionFeatureSelector(state);
            if (featureMission) {
                if (featureMission.geometry.type === "Point") {
                    return Rx.Observable.of(zoomToPoint(featureMission.geometry.coordinates, a.zoom, "EPSG:4326"));
                }
                return Rx.Observable.of(zoomToExtent(getGeoJSONExtent(featureMission), "EPSG:4326", a.zoom));
            }
            const featureAsset = selectedAssetFeatureSelector(state);
            if (featureAsset) {
                if (featureAsset.geometry.type === "Point") {
                    return Rx.Observable.of(zoomToPoint(featureAsset.geometry.coordinates, a.zoom, "EPSG:4326"));
                }
                return Rx.Observable.of(zoomToExtent(getGeoJSONExtent(featureAsset), "EPSG:4326", a.zoom));
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
 * it sends requesto to save the asset metadata and geom in the backend servers
 * @param {external:Observable} action$ manages `START_SAVE_ASSET`
 * @memberof epics.sciadro
 * @return {external:Observable}
**/
export const saveAssetEpic = (action$, store) =>
    action$.ofType(START_SAVE_ASSET)
        .switchMap((a) => {
            const state = store.getState();
            const asset = assetEditedSelector(state);
            const resource = {
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
                    modified: sciadroData.modified
                }, a.id),
                endSaveAsset()
            ];
            return saveResource({resource, category: "ASSET", resourcePermissions: {}, postProcessActions});
        });
