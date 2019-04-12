/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import expect from "expect";
import {
    enabledSelector,
    assetsListSelector,
    missionsListSelector,
    selectedAssetSelector
} from "../sciadro";


describe('testing sciadro selectors', () => {

    it('enabledSelector', () => {
        expect(enabledSelector({})).toBe(false);
        expect(enabledSelector({controls: {sciadro: {enabled: true}}})).toBe(true);
    });
    it('assetsListSelector', () => {
        expect(assetsListSelector({})).toEqual([]);
        expect(assetsListSelector({sciadro: {assets: [{id: 1}]}})).toEqual([{id: 1}]);
    });
    it('missionsListSelector', () => {
        expect(missionsListSelector({})).toEqual([]);
        expect(missionsListSelector({sciadro: {
            assets: [{
                id: 1,
                missions: [{id: 1}]
            }],
            missions: [{id: 1}]
        }})).toEqual([{id: 1}]);
    });

    it('selectedAssetSelector', () => {
        expect(selectedAssetSelector({})).toEqual(null);
        expect(selectedAssetSelector({
            sciadro: {
                assets: [{
                    id: 1,
                    missions: [{id: 1}],
                    selected: true
                }],
                missions: [{id: 1}]
            }
        })).toEqual({
            id: 1,
            missions: [{id: 1}],
            selected: true
        });
    });


});
