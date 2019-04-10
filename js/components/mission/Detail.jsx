/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import PropTypes from 'prop-types';
import BorderLayout from '@mapstore/components/layout/BorderLayout';

/**
 * Mission List
 * @class
 * @memberof components.List
*/
class Detail extends React.Component {
    static propTypes = {
        currentMission: PropTypes.object
    };
    static contextTypes = {
        messages: PropTypes.object
    };
    static defaultProps = {
        currentMission: {}
    };

    render() {

        return (
            <BorderLayout
                header={
                    <div>
                        <div className="mission-list-header">
                            Header
                        </div>
                    </div>
                }>
                Video, ecc
            </BorderLayout>
        );
    }
}

export default Detail;
