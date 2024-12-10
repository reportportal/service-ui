/*!
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

import { useState } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { BaseIconButton, Popover } from '@reportportal/ui-kit';
import TreeIcon from './img/tree-inline.svg';
import SubLevelIcon from './img/sub-level-inline.svg';
import { messages } from '../messages';
import styles from './userPageLocationLevel.scss';

const cx = classNames.bind(styles);

export const UserPageLocationLevel = ({ organizationName, projectName }) => {
  const { formatMessage } = useIntl();
  const [isOpen, setIsOpen] = useState(false);

  const getContent = () => (
    <div className={cx('members-page-header-container')}>
      <div>{formatMessage(messages.allOrganizations)}</div>
      <div className={cx('organization-name', { active: !projectName })}>
        {Parser(SubLevelIcon)}
        {organizationName}
      </div>
      {projectName && (
        <div className={cx('project-name')}>
          {Parser(SubLevelIcon)}
          {projectName}
        </div>
      )}
    </div>
  );

  return (
    <div className={cx('user-page-location-level')}>
      <Popover
        content={getContent()}
        placement="bottom-start"
        className={cx('popover')}
        isOpened={isOpen}
        setIsOpened={setIsOpen}
        fallbackPlacements={[]}
      >
        <BaseIconButton className={cx('tree-button', { open: isOpen })}>
          {Parser(TreeIcon)}
        </BaseIconButton>
      </Popover>
      <div className={cx('name')}>{projectName || organizationName}</div>
    </div>
  );
};

UserPageLocationLevel.propTypes = {
  organizationName: PropTypes.string.isRequired,
  projectName: PropTypes.string,
};

UserPageLocationLevel.defaultProps = {
  projectName: null,
};
