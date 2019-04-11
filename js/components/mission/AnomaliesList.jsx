/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import PropTypes from 'prop-types';
import SideGrid from '@mapstore/components/misc/cardgrids/SideGrid';
import Toolbar from '@mapstore/components/misc/toolbar/Toolbar';
import BorderLayout from '@mapstore/components/layout/BorderLayout';

/**
 * Mission AnomaliesList
 * @class
 * @memberof components.AnomaliesList
*/
export default class AnomaliesList extends React.Component {
    static propTypes = {
        anomalies: PropTypes.array
    };
    static contextTypes = {
        messages: PropTypes.object
    };
    static defaultProps = {
        anomalies: []
    };

    render() {

        return (
            <BorderLayout>
                <SideGrid
                    className="mission-list-container"
                    size="sm"
                    onItemClick = {(/*item*/) => {
                        // do selection of this item
                    }}
                    items={
                        this.props.anomalies.map(item => ({
                            id: item.id,
                            title: item.name,
                            selected: item.selected,
                            tools: <Toolbar
                                btnDefaultProps={{
                                    bsStyle: 'primary'
                                }}
                                buttons={
                                    [
                                        {
                                            text: 'Show frame',
                                            onClick: (/*e*/) => {
                                                // e.stopPropagation();
                                            }
                                        }, {
                                            text: 'Show on map',
                                            onClick: (/*e*/) => {
                                                // e.stopPropagation();
                                            }
                                        }
                                    ]
                                }/>
                        }))
                    }
                />
        </BorderLayout>
        );
    }
}
