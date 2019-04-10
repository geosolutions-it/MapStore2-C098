/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

export const LOAD_ASSETS = "SCIADRO:LOAD_ASSETS";
export const LOADED_ASSETS = "SCIADRO:LOADED_ASSETS";

export const loadAssets = () => ({ type: LOAD_ASSETS });
export const loadedAssets = (assets) => ({ type: LOADED_ASSETS, assets });
