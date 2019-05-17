/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import PropTypes from 'prop-types';

import DateField from '@mapstore/components/data/query/DateField';
import {getDateTimeFormat} from '@mapstore/utils/TimeUtils';
import {Col} from 'react-bootstrap';

/**
 * Mission MissionDateFilter
 * @class
 * @memberof components.MissionDateFilter
*/
class MissionDateFilter extends React.Component {
    static propTypes = {
        attributes: PropTypes.array,
        attType: PropTypes.string,
        dateEnabled: PropTypes.bool,
        dateFilter: PropTypes.object,
        onUpdateDateFilterException: PropTypes.func,
        onUpdateDateFilterValue: PropTypes.func,
        timeEnabled: PropTypes.bool
    };
    static contextTypes = {
        messages: PropTypes.object
    };
    static defaultProps = {
        attType: "date",
        dateEnabled: true,
        dateFilter: {
            rowId: 1,
            startDate: null,
            endDate: null
        },
        onUpdateDateFilterException: () => {},
        onUpdateDateFilterValue: () => {},
        timeEnabled: true
    };

    render() {

        return (
            <div>

                <div className="mission-list-header">
                    <Col xs={12}>
                    <DateField
                        showLabels
                        attType={this.props.attType}
                        fieldValue={this.props.dateFilter.fieldValue}
                        time={this.props.timeEnabled}
                        calendar={this.props.dateEnabled}
                        format={getDateTimeFormat(this.context.locale, this.props.attType)}
                        onUpdateField={(fieldRowId, fieldName, value, attType) => {
                            this.props.onUpdateDateFilterValue(fieldRowId, fieldName, value, attType);
                        }}
                        onUpdateExceptionField={(fieldRowId, error) => {
                            this.props.onUpdateDateFilterException(fieldRowId, error);

                        }}
                        operator="><"/>
                    </Col>
                </div>
            </div>
        );
    }
}

export default MissionDateFilter;
