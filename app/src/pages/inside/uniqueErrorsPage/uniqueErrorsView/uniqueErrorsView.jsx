/*
 * Copyright 2021 EPAM Systems
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

import React from 'react';
import { EmptyUniqueErrors } from 'pages/inside/uniqueErrorsPage/emptyUniqueErrors';
import PropTypes from 'prop-types';
import { UniqueErrorsGrid } from '../uniqueErrorsGrid';

export const UniqueErrorsView = (props) => {
  const { parentLaunch, clusters, loading } = props;

  return (
    <>
      {clusters.length > 0 ? (
        <UniqueErrorsGrid data={clusters} loading={loading} />
      ) : (
        <EmptyUniqueErrors parentLaunch={parentLaunch} />
      )}
    </>
  );
};

UniqueErrorsView.propTypes = {
  parentLaunch: PropTypes.object,
  clusters: PropTypes.array,
  loading: PropTypes.bool,
};

UniqueErrorsView.defaultProps = {
  parentLaunch: {},
  clusters: [],
  loading: false,
};
