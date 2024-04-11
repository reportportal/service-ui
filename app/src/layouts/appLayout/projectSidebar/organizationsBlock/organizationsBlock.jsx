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

import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { useSelector } from 'react-redux';
import { organizationNameSelector } from 'controllers/project';
import styles from './organizationsBlock.scss';

const cx = classNames.bind(styles);

export const OrganizationsBlock = ({
  onHoverOrganization,
  onClearOrganization,
  isHoveredOrganization,
  onClick,
}) => {
  const organizationName = useSelector(organizationNameSelector);
  const title = `${organizationName[0]}${organizationName[organizationName.length - 1]}`;

  return (
    <button
      className={cx('organization-block', { hover: isHoveredOrganization })}
      onClick={onClick}
      onMouseEnter={onHoverOrganization}
      onMouseLeave={onClearOrganization}
    >
      {title}
    </button>
  );
};

OrganizationsBlock.propTypes = {
  onHoverOrganization: PropTypes.func.isRequired,
  onClearOrganization: PropTypes.func.isRequired,
  isHoveredOrganization: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};
