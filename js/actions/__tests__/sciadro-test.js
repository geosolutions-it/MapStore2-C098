/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import expect from "expect";
import {
    loadedAssets, LOADED_ASSETS
} from "../sciadro";


describe('testing sciadro actions', () => {
    it('LOADED_ASSETS', () => {
        const assets = [];
        const action = loadedAssets(assets);
        expect(action.type).toEqual(LOADED_ASSETS);
        expect(action.assets).toEqual(assets);
    });
});
