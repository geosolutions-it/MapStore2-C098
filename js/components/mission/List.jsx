/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import PropTypes from 'prop-types';
import SideGrid from '../../../MapStore2/web/client/components/misc/cardgrids/SideGrid';

/**
 * Mission List
 * @class
 * @memberof components.List
*/
class List extends React.Component {
    static propTypes = {
        items: PropTypes.array,
        className: PropTypes.string
    };
    static contextTypes = {
        messages: PropTypes.object
    };
    static defaultProps = {
        // items: [],
        items: [{
            name: "Missione 1"
        }, {
            name: "Missione 2"
        }],
        className: "asset-list-container"
    };

    render() {

        return (
            <SideGrid
                className={this.props.className}
                size="sm"
                items={
                    this.props.items.map(item => ({
                        title: item.name
                    }))
                }
            />
        );
    }
}

export default List;
