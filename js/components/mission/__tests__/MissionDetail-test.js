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
import MissionDetail from "@js/components/mission/MissionDetail";
// import TestUtils from 'react-dom/test-utils';

describe('testing MissionDetail component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('rendering MissionDetail with defaults', () => {
        const comp = ReactDOM.render(<MissionDetail />, document.getElementById("container"));
        expect(comp).toExist();
    });

});
