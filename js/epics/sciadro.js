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
    ADD_ASSET,
    ENTER_EDIT_ITEM,
    ENTER_CREATE_ITEM,
    HIDE_ADDITIONAL_LAYER,
    ZOOM_TO_ITEM,
    loadedAssets,
    loadingAssets,
    loadAssetError
} from '@js/actions/sciadro';
import {getStyleFromType} from "@js/utils/sciadro";
import {
    selectedMissionFeatureSelector,
    selectedAssetFeatureSelector,
    selectedDroneFeatureSelector,
    assetSelectedSelector
} from '@js/selectors/sciadro';
import {getAdditionalLayerAction, removeAdditionalLayerById} from '@js/utils/sciadro';
// mapstore
import {
    zoomToPoint, zoomToExtent
} from '@mapstore/actions/map';
import {
    UPDATE_MAP_LAYOUT, updateMapLayout
} from '@mapstore/actions/mapLayout';
import {
    getGeoJSONExtent
} from '@mapstore/utils/CoordinatesUtils';
import GeoStoreApi from "@mapstore/api/GeoStoreDAO";
import {LOGIN_SUCCESS} from "@mapstore/actions/security";
import * as Persistence from "@mapstore/api/persistence";
import {changeDrawingStatus} from '@mapstore/actions/draw';

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
        .switchMap(() => {
            // get all assets
            return Rx.Observable.fromPromise(
                GeoStoreApi.getResourcesByCategory("ASSET").then(data => data)
            )
            .switchMap(({results = []}) => {
                if (results.length) {
                    // observable object that will retrieve all the info of the reosurces
                    const getResourcesObs = results.map(({id}) => {
                        return Persistence.getResource(id).catch((e) => loadAssetError(e));
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

                const assetWithMission = assets.map((a, i) => ({ ...a, type: "pipeline", feature: a.id === (assetSelected && assetSelected.id) ? assetSelected.feature : mockAssetsGeojson[i], missionsId: [1], selected: a.id === (assetSelected && assetSelected.id)}));
                return Rx.Observable.of(loadedAssets(assetWithMission));
            })
            .catch((e) => loadAssetError(e));
        }).startWith(loadingAssets(true));


/**
 * Shows in the map the asset's and/or mission's features
 * @param {external:Observable} action$ manages `SELECT_MISSION`, `RESET_CURRENT_ASSET`, `RESET_CURRENT_MISSION`, `CHANGE_CURRENT_MISSION`, `CHANGE_CURRENT_ASSET`, `ADD_ASSET`
 * @memberof epics.sciadro
 * @return {external:Observable}
 */
export const updateAdditionalLayerEpic = (action$, store) =>
    action$.ofType(SELECT_MISSION, SELECT_ASSET, RESET_CURRENT_ASSET, RESET_CURRENT_MISSION, CHANGE_CURRENT_MISSION, CHANGE_CURRENT_ASSET, ADD_ASSET )
        .switchMap((a) => {
            let actions = [];
            const state = store.getState();

            const featureAsset = selectedAssetFeatureSelector(state);
            const featureMission = selectedMissionFeatureSelector(state);
            const featureDrone = selectedDroneFeatureSelector(state);
            if (a.type === RESET_CURRENT_ASSET || a.type === ADD_ASSET ) {
                actions.push(changeDrawingStatus("clean", "", "sciadro", [], {}, {}));
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
            return Rx.Observable.of(changeDrawingStatus("start", a.drawMethod, "sciadro", [], drawOptions, getStyleFromType(a.drawMethod)));
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
 * @param {external:Observable} action$ manages `ENTER_EDIT_ITEM`
 * @memberof epics.sciadro
 * @return {external:Observable}
 **/
export const hideAssetsLayerEpic = (action$) =>
    action$.ofType(ENTER_EDIT_ITEM, ENTER_CREATE_ITEM)
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
