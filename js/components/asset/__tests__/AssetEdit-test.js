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
import AssetEdit from "@js/components/asset/AssetEdit";
import TestUtils from 'react-dom/test-utils';

const assetEdited = {
    name: "nameAsset",
    type: "PIP",
    id: 1,
    attributes: {},
    feature: {
        type: "Feature",
        geometry: {
            type: "Point",
            coordinates: [[1, 3], [5, 6]]
        }
    },
    isNew: false
};

describe('testing AssetEdit component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('rendering AssetEdit with defaults', () => {
        ReactDOM.render(<AssetEdit />, document.getElementById("container"));
        const labels = document.getElementsByClassName("control-label");
        expect(labels).toExist();
        expect(labels.length).toBe(6);
        expect(labels[0].innerText).toBe("sciadro.mandatory");
        expect(labels[1].innerText).toBe("sciadro.assets.type");
        expect(labels[2].innerText).toBe("sciadro.assets.name *");
        expect(labels[3].innerText).toBe("sciadro.assets.description");
        expect(labels[4].innerText).toBe("sciadro.assets.note");
        expect(labels[5].innerText).toBe("sciadro.assets.geometry");
    });
    it('rendering AssetEdit with an asset in edit mode', () => {
        ReactDOM.render(<AssetEdit assetEdited={assetEdited}/>, document.getElementById("container"));
        const labels = document.getElementsByClassName("control-label");
        expect(labels).toExist();
        expect(labels.length).toBe(8);
        expect(labels[0].innerText).toBe("sciadro.mandatory");
        expect(labels[1].innerText).toBe("sciadro.assets.type");
        expect(labels[2].innerText).toBe("sciadro.assets.name *");
        expect(labels[3].innerText).toBe("sciadro.assets.description");
        expect(labels[4].innerText).toBe("sciadro.assets.note");
        expect(labels[5].innerText).toBe("sciadro.assets.created");
        expect(labels[6].innerText).toBe("sciadro.assets.modified");
        expect(labels[7].innerText).toBe("sciadro.assets.geometry");
    });
    it('checking onEditAsset of AssetEdit', () => {
        const handlers = {
            onEditAsset: () => {}
        };
        const spyOnEditAsset = expect.spyOn(handlers, "onEditAsset");
        ReactDOM.render(<AssetEdit {...handlers} assetEdited={assetEdited}/>, document.getElementById("container"));
        const inputName = document.getElementsByClassName("form-control")[1];
        inputName.value = "new val";
        TestUtils.Simulate.change(inputName);
        expect(spyOnEditAsset).toHaveBeenCalled();
        const args = spyOnEditAsset.calls[0].arguments;
        expect(args).toEqual([1, "name", "new val"]);
    });
});
