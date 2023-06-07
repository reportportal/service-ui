/*
 * Copyright 2023 EPAM Systems
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

export const activityItemPropTypes = {
  activity: PropTypes.shape({
    actionType: PropTypes.string,
    details: PropTypes.shape({ history: PropTypes.array, objectName: PropTypes.string }),
    id: PropTypes.number,
    lastModified: PropTypes.number,
    loggedObjectId: PropTypes.number,
    objectType: PropTypes.string,
    projectId: PropTypes.number,
    projectName: PropTypes.string,
    user: PropTypes.string,
  }),
};

export const activityItemDefaultProps = {
  activity: {
    actionType: '',
    details: { history: [], objectName: '' },
    id: 0,
    lastModified: 0,
    loggedObjectId: 0,
    objectType: '',
    projectId: 0,
    projectName: '',
    user: '',
  },
};
