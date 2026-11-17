/*
 * Copyright 2024 EPAM Systems
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

import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { OrganizationCard } from './organizationCard';
import styles from './organizationsPanels.scss';

const cx = classNames.bind(styles);

export const OrganizationsPanels = ({ organizationsList }) => (
  <div className={cx('organizations-panels-wrapper')}>
    <div className={cx('organizations-panels')}>
      {organizationsList.map((organization) => (
        <OrganizationCard key={organization.id} organization={organization} />
      ))}
    </div>
  </div>
);

OrganizationsPanels.propTypes = {
  organizationsList: PropTypes.array,
};

OrganizationsPanels.defaultProps = {
  organizationsList: [],
};
