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

import { useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { Button } from '@reportportal/ui-kit';
import plusIcon from 'common/img/plus-button-inline.svg';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import styles from './emptyProjectsState.scss';
import { messages } from '../messages';
import emptyProjectsStateImage from './img/emptyProjectsState.png';

const cx = classNames.bind(styles);

export const EmptyProjectsState = ({ hasPermission }) => {
  const { formatMessage } = useIntl();
  const permissionSuffix = hasPermission ? 'WithPermission' : 'WithoutPermission';
  return (
    <div className={cx('empty-projects-state')}>
      <img src={emptyProjectsStateImage} alt={'empty-projects-state'} />
      <div className={cx('content')}>
        <span className={cx('label')}>
          {formatMessage(messages[`noProjects${permissionSuffix}`])}
        </span>
        <p className={cx('description')}>
          {Parser(formatMessage(messages[`noProjectsList${permissionSuffix}`]))}
        </p>
        {hasPermission && (
          <Button variant={'text'} customClassName={cx('button')} startIcon={plusIcon}>
            {formatMessage(messages.createProject)}
          </Button>
        )}
      </div>
    </div>
  );
};

EmptyProjectsState.propTypes = {
  hasPermission: PropTypes.bool,
};

EmptyProjectsState.defaultProps = {
  hasPermission: false,
};
