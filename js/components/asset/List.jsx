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
import Filter from '@mapstore/components/misc/Filter';

/**
 * Asset List
 * @class
 * @memberof components.List
*/
class List extends React.Component {
    static propTypes = {
        assets: PropTypes.array,
        className: PropTypes.string,
        onLoadAssets: PropTypes.func,
        onChangeCurrentAsset: PropTypes.func
    };
    static contextTypes = {
        messages: PropTypes.object
    };
    static defaultProps = {
        assets: [],
        onLoadAssets: () => {},
        onChangeCurrentAsset: () => {},
        className: "asset-list-container"
    };

    componentWillMount() {
        this.props.onLoadAssets();
    }
    render() {

        return (
            <BorderLayout
                header={
                    <div style={{ padding: 8 }}>
                        <Filter filterPlaceholder="Filter assets..."/>
                    </div>
                }>
                <SideGrid
                    className={this.props.className}
                    size="sm"
                    onItemClick= {(item) => {
                        this.props.onChangeCurrentAsset(item.id);
                    }}
                    items={
                        this.props.assets.map(item => ({
                            id: item.id,
                            title: item.name,
                            tools: <Toolbar
                                btnDefaultProps={{
                                    bsStyle: 'primary',
                                    className: 'square-button-md'
                                }}
                                buttons={
                                    [
                                        {
                                            glyph: 'wrench',
                                            onClick: (e) => {
                                                e.stopPropagation();
                                                // edit permissions
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

export default List;
