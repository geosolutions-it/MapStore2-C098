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
import ToolbarGeometry from "@js/components/asset/ToolbarGeometry";

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
            coordinates: [5, 6]
        }
    },
    isNew: false
};

describe('testing ToolbarGeometry component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('rendering ToolbarGeometry with defaults', () => {
        const assetlist = ReactDOM.render(<ToolbarGeometry />, document.getElementById("container"));
        expect(assetlist).toExist();
    });
    it('rendering ToolbarGeometry with no geom drawn', () => {
        const assetlist = ReactDOM.render(
            <ToolbarGeometry
            assetEdited={{...assetEdited, feature: null}}
            buttonsStatus={{
                deleteGeom: true,
                deleteGeomDisabled: true,
                drawGeom: true
            }}
            />, document.getElementById("container"));
        expect(assetlist).toExist();

        const trash = document.getElementsByClassName("btn");
        expect(trash).toExist();
        expect(trash[0].disabled).toBe(true);
        const pencil = document.getElementsByClassName("glyphicon-pencil")[0];
        expect(pencil).toExist();
        const line = document.getElementsByClassName("glyphicon-line")[0];
        expect(line).toExist();
        const point = document.getElementsByClassName("glyphicon-point")[0];
        expect(point).toExist();
    });
    it('rendering ToolbarGeometry with a point geom drawn', () => {
        const assetlist = ReactDOM.render(
            <ToolbarGeometry
            assetEdited={assetEdited}
            buttonsStatus={{
                deleteGeom: true,
                deleteGeomDisabled: false,
                drawGeom: true
            }}
            />, document.getElementById("container"));
        expect(assetlist).toExist();

        const trash = document.getElementsByClassName("btn");
        expect(trash).toExist();
        expect(trash[0].disabled).toBe(false);
    });

});
