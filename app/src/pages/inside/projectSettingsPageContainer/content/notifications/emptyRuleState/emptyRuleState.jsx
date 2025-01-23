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

import React from 'react';
import classNames from 'classnames/bind';
import { useIntl } from 'react-intl';
import Parser from 'html-react-parser';
import plusIcon from 'common/img/plus-button-inline.svg';
import { Button } from '@reportportal/ui-kit';
import PropTypes from 'prop-types';
import { canUpdateSettings } from 'common/utils/permissions';
import { userRolesSelector } from 'controllers/pages';
import { useSelector } from 'react-redux';
import { messages } from '../messages';
import styles from './emptyRuleState.scss';

const cx = classNames.bind(styles);

export const EmptyRuleState = ({ ruleName, onCreateClick }) => {
  const { formatMessage } = useIntl();
  const userRoles = useSelector(userRolesSelector);
  const isUpdateSettingAvailable = canUpdateSettings(userRoles);
  return (
    <div className={cx('empty-rule-state')}>
      <span className={cx('label')}>{formatMessage(messages.noItemsMessage, { ruleName })}</span>
      {isUpdateSettingAvailable && (
        <Button
          onClick={onCreateClick}
          variant={'text'}
          className={cx('button')}
          icon={Parser(plusIcon)}
          data-automation-id="createRuleFromEmptyStateButton"
        >
          {formatMessage(messages.create)}
        </Button>
      )}
    </div>
  );
};

EmptyRuleState.propTypes = {
  ruleName: PropTypes.string.isRequired,
  onCreateClick: PropTypes.func.isRequired,
};
