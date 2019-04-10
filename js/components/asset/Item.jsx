/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/


import React from 'react';
import PropTypes from 'prop-types';
// import Message from '../../MapStore2/web/client/components/I18N/Message';

/**
 * Asset List
 * @class
 * @memberof components.List
*/
class List extends React.Component {
    static propTypes = {
        type: PropTypes.string,
        name: PropTypes.string,
        className: PropTypes.string
    };
    static contextTypes = {
        messages: PropTypes.object
    };
    static defaultProps = {
        items: [],
        className: "asset-item"
    };

    render() {
        return (
            <div className={this.props.className}>
                ciao
            </div>
        );

    }
}

export default List;
