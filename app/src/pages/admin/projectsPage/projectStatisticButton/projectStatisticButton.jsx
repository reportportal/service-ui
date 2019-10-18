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

import PropTypes from 'prop-types';
import Link from 'redux-first-router-link';
import React from 'react';
import { PROJECT_DETAILS_PAGE } from 'controllers/pages';
import { Icon } from 'components/main/icon/icon';

export const ProjectStatisticButton = ({ projectName, onClick }) => (
  <Link
    to={{
      type: PROJECT_DETAILS_PAGE,
      payload: { projectId: projectName },
    }}
    onClick={onClick}
  >
    <Icon type={'icon-statistics'} />
  </Link>
);

ProjectStatisticButton.propTypes = {
  projectName: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};

ProjectStatisticButton.defaultProps = {
  onClick: () => {},
};
