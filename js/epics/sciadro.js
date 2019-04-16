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
    HIDE_ADDITIONAL_LAYER,
    loadedAssets,
    loadingAssets,
    loadAssetError
} from '../actions/sciadro';
import {
    selectedMissionFeatureSelector,
    selectedAssetFeatureSelector,
    selectedDroneFeatureSelector
} from '../selectors/sciadro';
import {getAdditionalLayerAction, removeAdditionalLayerById} from '../utils/sciadro';
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
        iconColor: "red",
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
export const loadAssetsEpic = (action$) =>
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
                // adding a fake asset geom and a fake mission to each asset
                const assetWithMission = assets.map((a, i) => ({ ...a, feature: mockAssetsGeojson[i], missionsId: [1]}));
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
            return Rx.Observable.of(changeDrawingStatus("start", a.drawMethod, "sciadro", [], drawOptions, a.drawMethod === "Marker" ? {
                iconGlyph: "comment",
                iconColor: "blue",
                iconShape: "circle"
            } : {}));
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
