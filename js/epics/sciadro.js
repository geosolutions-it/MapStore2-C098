/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import * as Rx from 'rxjs';
import {LOAD_ASSETS, SELECT_MISSION, RESET_CURRENT_ASSET, CHANGE_CURRENT_MISSION, CHANGE_CURRENT_ASSET, loadedAssets, loadAssetError} from '../actions/sciadro';
import {selectedMissionFeatureSelector, selectedAssetFeatureSelector} from '../selectors/sciadro';
import {getAdditionalLayerAction} from '../utils/sciadro';
import GeoStoreApi from "@mapstore/api/GeoStoreDAO";
import {LOGIN_SUCCESS} from "@mapstore/actions/security";
import * as Persistence from "@mapstore/api/persistence";

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
 * Intercept on `LOAD_ASSETS` to get assets Resources
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
                return Rx.Observable.empty();
            })
            .combineAll()
            .switchMap((assets = []) => {
                // adding a fake asset geom and a fake mission to each asset
                const assetWithMission = assets.map((a, i) => ({ ...a, feature: mockAssetsGeojson[i], missionsId: [1]}));
                return Rx.Observable.of(loadedAssets(assetWithMission));
            })
            .catch((e) => loadAssetError(e));
        });


/**
 * Shows in the map the asset's and/or mission's features
 * @param {external:Observable} action$ manages `SELECT_MISSION`, `RESET_CURRENT_ASSET`, `CHANGE_CURRENT_MISSION`, `CHANGE_CURRENT_ASSET`
 * @memberof epics.sciadro
 * @return {external:Observable}
 */
export const highlightMissionEpic = (action$, store) =>
    action$.ofType(SELECT_MISSION, RESET_CURRENT_ASSET, CHANGE_CURRENT_MISSION, CHANGE_CURRENT_ASSET )
        .switchMap(() => {
            let actions = [];
            const state = store.getState();

            const featureAsset = selectedAssetFeatureSelector(state);
            const featureMission = selectedMissionFeatureSelector(state);

            actions.push(getAdditionalLayerAction({feature: featureAsset, id: "assets", name: "assets"})); // remove or update feature for assets
            actions.push(getAdditionalLayerAction({feature: featureMission, id: "missions", name: "missions"}));// remove or update feature for missions

            return Rx.Observable.from(actions);
        });
