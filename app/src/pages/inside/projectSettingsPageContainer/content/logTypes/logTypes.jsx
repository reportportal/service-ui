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

import React, { useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { useSelector, useDispatch } from 'react-redux';
import { useTracking } from 'react-tracking';
import { activeProjectRoleSelector, userAccountRoleSelector } from 'controllers/user';
import { Button } from '@reportportal/ui-kit';
import { PROJECT_SETTINGS_LOG_TYPES_EVENTS } from 'components/main/analytics/events/ga4Events/projectSettingsPageEvents';
import { logTypesSelector, logTypesLoadingSelector } from 'controllers/project';
import { canUpdateSettings } from 'common/utils/permissions';
import { docsReferences, createExternalLink } from 'common/utils';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { showModalAction } from 'controllers/modal';
import { FormattedDescription } from '../elements';
import { LogTypesTable } from './logTypesTable';
import { CreateLogTypeModal } from './modals/createLogTypeModal';
import { messages } from './messages';
import { UNKNOWN_LOG_TYPE_LEVEL } from './constants';
import styles from './logTypes.scss';

const cx = classNames.bind(styles);

export const LogTypes = ({ setHeaderTitleNode }) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const { trackEvent } = useTracking();
  const logTypes = useSelector(logTypesSelector);
  const loading = useSelector(logTypesLoadingSelector);
  const userAccountRole = useSelector(userAccountRoleSelector);
  const userProjectRole = useSelector(activeProjectRoleSelector);
  const isEditable = canUpdateSettings(userAccountRole, userProjectRole);

  const handleCreateLogType = useCallback(() => {
    trackEvent(PROJECT_SETTINGS_LOG_TYPES_EVENTS.CLICK_CREATE_TYPES);
    dispatch(showModalAction({ component: <CreateLogTypeModal /> }));
  }, [dispatch, trackEvent]);

  useEffect(() => {
    if (isEditable) {
      setHeaderTitleNode(
        <Button className={cx('button')} onClick={handleCreateLogType} disabled={loading}>
          {formatMessage(messages.createLogType)}
        </Button>,
      );
    }

    return () => setHeaderTitleNode(null);
  }, [formatMessage, setHeaderTitleNode, isEditable, handleCreateLogType, loading]);

  const filteredLogTypes = useMemo(
    () => logTypes.filter((logType) => logType.level !== UNKNOWN_LOG_TYPE_LEVEL),
    [logTypes],
  );

  return loading ? (
    <SpinningPreloader />
  ) : (
    <div className={cx('content')}>
      <div className={cx('description')}>
        <FormattedDescription
          content={formatMessage(messages.description, {
            a: (data) => createExternalLink(data, docsReferences.logTypesDocs),
          })}
          event={PROJECT_SETTINGS_LOG_TYPES_EVENTS.CLICK_DOCUMENTATION_LINK}
        />
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
