/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import expect from "expect";
import sciadro from "../sciadro";
import {
    loadedAssets
} from "../../actions/sciadro";


describe('testing sciadro reducers', () => {
    it('LOADED_ASSETS', () => {
        const assets = [];
        const state = sciadro({}, loadedAssets(assets));
        expect(state.assets).toEqual(assets);
    });
});
