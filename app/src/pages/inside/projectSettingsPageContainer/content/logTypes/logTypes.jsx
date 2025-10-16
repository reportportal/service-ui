/*
 * Copyright 2025 EPAM Systems
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

import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { useSelector, useDispatch } from 'react-redux';
import Parser from 'html-react-parser';
import { projectIdSelector } from 'controllers/pages';
import { activeProjectRoleSelector, userAccountRoleSelector } from 'controllers/user';
import { Button } from '@reportportal/ui-kit';
import { logTypesSelector, fetchLogTypesAction } from 'controllers/project';
import { canUpdateSettings } from 'common/utils/permissions';
import { docsReferences, createExternalLink } from 'common/utils';
import { LogTypesTable } from './logTypesTable';
import { messages } from './messages';
import { UNKNOWN_LOG_TYPE_LEVEL } from './constants';
import styles from './logTypes.scss';

const cx = classNames.bind(styles);

export const LogTypes = ({ setHeaderTitleNode }) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const projectId = useSelector(projectIdSelector);
  const logTypes = useSelector(logTypesSelector);
  const userAccountRole = useSelector(userAccountRoleSelector);
  const userProjectRole = useSelector(activeProjectRoleSelector);
  const isEditable = canUpdateSettings(userAccountRole, userProjectRole);

  useEffect(() => {
    dispatch(fetchLogTypesAction(projectId));
  }, [dispatch, projectId]);

  const handleCreateLogType = () => {
    // TODO: Implement create log type modal
  };

  useEffect(() => {
    if (isEditable) {
      setHeaderTitleNode(
        <Button className={cx('button')} onClick={handleCreateLogType}>
          {formatMessage(messages.createLogType)}
        </Button>,
      );
    }

    return () => setHeaderTitleNode(null);
  }, [formatMessage, setHeaderTitleNode, isEditable]);

  const filteredLogTypes = useMemo(
    () =>
      [...logTypes]
        .filter((logType) => logType.level !== UNKNOWN_LOG_TYPE_LEVEL)
        .sort((a, b) => b.level - a.level),
    [logTypes],
  );

  return (
    <div className={cx('content')}>
      <div className={cx('description')}>
        {Parser(
          formatMessage(messages.description, {
            a: (data) => createExternalLink(data, docsReferences.workWithReports),
          }),
        )}
      </div>
      {filteredLogTypes.length > 0 && (
        <LogTypesTable logTypes={filteredLogTypes} isEditable={isEditable} />
      )}
    </div>
  );
};

LogTypes.propTypes = {
  setHeaderTitleNode: PropTypes.func.isRequired,
};
