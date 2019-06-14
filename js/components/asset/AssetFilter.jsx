/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { Col, FormGroup, FormControl, Row } from 'react-bootstrap';
import localizeProps from '@mapstore/components/misc/enhancers/localizedProps';
const SearchInput = localizeProps("placeholder")(FormControl);
module.exports = ({ onSearchTextChange = () => { }, searchText}) =>
    (
        <Row style = {{paddingLeft: "15px", paddingRight: "15px"}}>
            <Col xs={12}>
                <FormGroup controlId="catalog-form">
                    <SearchInput type="text" placeholder="sciadro.assets.textSearchPlaceholder" value={searchText} onChange={(e) => onSearchTextChange(e.currentTarget.value)}/>
                </FormGroup>
            </Col>
        </Row>
    );
