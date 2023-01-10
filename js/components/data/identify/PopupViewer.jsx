/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { compose, defaultProps} from 'recompose';
import {connect} from 'react-redux';
import {isArray, isUndefined} from 'lodash';
import { createSelector} from 'reselect';

import SwipeHeader from '@mapstore/components/data/identify/PopupViewer';
import loadingState from "@mapstore/components/misc/enhancers/loadingState";
import {
    defaultViewerHandlers,
    defaultViewerDefaultProps
} from "@mapstore/components/data/identify/enhancers/defaultViewer";
const {isMouseMoveIdentifyActiveSelector: identifyFloatingTool } = require('@mapstore/selectors/map');

import {indexSelector, responsesSelector, requestsSelector, showEmptyMessageGFISelector, featureInfoClickFormatSelector, identifyGfiTypeSelector, validResponsesSelector, isLoadedResponseSelector} from '@js/selectors/mapInfo';
import {changePage} from '@js/actions/mapInfo';
import Viewer from '@js/components/data/identify/DefaultViewer';

/**
 * Container that render only the selected result
 */
const Container = ({index, children}) => (<React.Fragment>{isArray(children) && children[index] || children}</React.Fragment>);

/*
 * Enhancer to enable set index only if Component has not header in viewerOptions props
 */
const identifyIndex = compose(
    connect(
        createSelector(indexSelector, (index) => ({ index })),
        {
            setIndex: changePage
        }
    ),
    defaultProps({
        index: 0,
        responses: []
    })
)
;
const selector = createSelector([
    responsesSelector,
    validResponsesSelector,
    requestsSelector,
    featureInfoClickFormatSelector,
    identifyGfiTypeSelector,
    showEmptyMessageGFISelector,
    identifyFloatingTool,
    isLoadedResponseSelector,
    state => state?.mapInfo?.warning],
(responses, validResponses, requests, format, gfiType, showEmptyMessageGFI, renderEmpty, loaded, warning) => ({
    responses,
    validResponses,
    requests,
    format,
    gfiType,
    showEmptyMessageGFI,
    missingResponses: (requests || []).length - (responses || []).length,
    renderEmpty,
    loaded: warning === 'NO_QUERYABLE_LAYERS' || loaded,
    noQueryableLayers: warning === 'NO_QUERYABLE_LAYERS'
}));


export default compose(
    connect(selector),
    defaultProps({
        responses: [],
        container: Container,
        header: SwipeHeader
    }),
    identifyIndex,
    defaultViewerDefaultProps,
    defaultViewerHandlers,
    loadingState(({loaded}) => isUndefined(loaded))
)(Viewer);
