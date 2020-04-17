/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { connect } from 'react-redux';
import { pagePropertiesSelector, updatePagePropertiesAction } from 'controllers/pages';
import {
  createNamespacedQuery,
  extractNamespacedQuery,
  mergeNamespacedQuery,
} from './routingUtils';
import { omit } from './omit';

const takeAll = (x) => ({ ...x });

export const connectRouter = (mapURLParamsToProps = takeAll, queryUpdaters = {}, options = {}) => (
  WrappedComponent,
) =>
  connect(
    (state, ownProps) => {
      const pageProperties = pagePropertiesSelector(state);
      let namespace = options.namespace || ownProps.namespace;
      const namespaceSelector = options.namespaceSelector || ownProps.namespaceSelector;
      const offset = options.offset;
      if (!options.namespace && namespaceSelector) {
        namespace = namespaceSelector(state, offset);
      }
      const namespacedQuery = namespace
        ? extractNamespacedQuery(pageProperties, namespace)
        : pageProperties;
      return {
        namespace,
        ...mapURLParamsToProps(namespacedQuery),
        namespacedQuery,
      };
    },
    (dispatch) => {
      const mappedUpdaters = {};
      Object.keys(queryUpdaters).forEach((key) => {
        mappedUpdaters[key] = (namespace, oldQuery) => (...args) => {
          dispatch(
            updatePagePropertiesAction(
              createNamespacedQuery(
                mergeNamespacedQuery(oldQuery, queryUpdaters[key](...args), namespace),
                namespace,
              ),
            ),
          );
        };
      });
      return mappedUpdaters;
    },
    (stateProps, dispatchProps, ownProps) => ({
      ...omit(stateProps, ['namespace', 'namespacedQuery', 'namespaceSelector']),
      ...ownProps,
      ...Object.keys(queryUpdaters).reduce(
        (acc, key) => ({
          ...acc,
          [key]: acc[key](stateProps.namespace, stateProps.namespacedQuery),
        }),
        dispatchProps,
      ),
    }),
  )(WrappedComponent);
