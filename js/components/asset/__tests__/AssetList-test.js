/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import expect from "expect";
import React from "react";
import ReactDOM from "react-dom";
import AssetList from "@js/components/asset/AssetList";

const assetEdited = {
    name: "nameAsset",
    description: "descriptionAsset",
    type: "PIP",
    id: 1,
    attributes: {},
    edit: true,
    feature: {
        type: "Feature",
        geometry: {
            type: "Point",
            coordinates: [1, 3]
        }
    },
    isNew: false
};

const assets = [assetEdited];

describe('testing AssetList component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('rendering AssetList with defaults', () => {
        const assetlist = ReactDOM.render(<AssetList />, document.getElementById("container"));
        expect(assetlist).toExist();
    });
    it('rendering AssetList with one asset', () => {
        const assetlist = ReactDOM.render(
            <AssetList
                assets={assets}
            />, document.getElementById("container"));
        expect(assetlist).toExist();
        const title = document.getElementsByClassName("mapstore-side-card-title")[0];
        expect(title).toExist();
        expect(title.innerText).toBe("nameAsset");
        const arrowsRight = document.getElementsByClassName("glyphicon-arrow-right");
        expect(arrowsRight).toExist();
        expect(arrowsRight.length).toBe(1);
    });

});
