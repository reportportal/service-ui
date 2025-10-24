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

import { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useIntl, defineMessages } from 'react-intl';
import { useTracking } from 'react-tracking';
import Link from 'redux-first-router-link';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import { InputSlider } from 'components/inputs/inputSlider';
import { LOG_TYPES } from 'common/constants/settingsTabs';
import { PROJECT_SETTINGS_TAB_PAGE, projectIdSelector } from 'controllers/pages';
import { userIdSelector } from 'controllers/user';
import { isDefaultLogLevel, isLogLevelsEqual } from 'controllers/log/utils';
import { LOG_PAGE_EVENTS } from 'components/main/analytics/events';
import InfoIcon from 'common/img/info-inline.svg';
import { logTypesLoadingSelector } from 'controllers/project';
import styles from './logLevelsSlider.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  logLevelsSliderInfoMessage: {
    id: 'LogsGridToolbar.logLevelsSliderInfoMessage',
    defaultMessage:
      'All logs are currently displayed. To adjust filtering, update <a>Log Types</a> settings.',
  },
});

const MarkComponent = ({ item }) => {
  const markRef = useRef(null);
  const [showTitle, setShowTitle] = useState(false);

  useEffect(() => {
    if (markRef.current) {
      const width = markRef.current.offsetWidth;
      const scrollWidth = markRef.current.scrollWidth;

      setShowTitle(width < scrollWidth);
    }
  }, [item.label]);

  return (
    <span
      key={`mark-${item.id}`}
      ref={markRef}
      className={cx('log-level-mark')}
      title={showTitle ? item.label : undefined}
    >
      {item.label}
    </span>
  );
};

export const LogLevelsSlider = ({ logLevel, logLevels, onChangeLogLevel }) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const userId = useSelector(userIdSelector);
  const projectId = useSelector(projectIdSelector);
  const logTypesLoading = useSelector(logTypesLoadingSelector);

  const shouldShowInfoMessage = () => {
    return logLevels.length === 1 && isDefaultLogLevel(logLevels[0]);
  };

  const createLogTypesLink = () => {
    return {
      type: PROJECT_SETTINGS_TAB_PAGE,
      payload: { projectId, settingsTab: LOG_TYPES },
    };
  };

  const changeLogLevel = (newLogLevel) => {
    if (!isLogLevelsEqual(newLogLevel, logLevel)) {
      onChangeLogLevel(userId, newLogLevel);
    }
  };

  const trackLogLevelFilterClick = (newLogLevel) => {
    trackEvent(LOG_PAGE_EVENTS.getClickOnLogLevelFilterEvent(newLogLevel.name));
  };

  const renderInfoMessage = () => {
    const logTypesLink = createLogTypesLink();

    return (
      <div className={cx('info-message')}>
        <div className={cx('info-icon')}>{Parser(InfoIcon)}</div>
        <div className={cx('info-text')}>
          {formatMessage(messages.logLevelsSliderInfoMessage, {
            a: (chunks) => (
              <Link to={logTypesLink} className={cx('log-types-link')}>
                {chunks}
              </Link>
            ),
          })}
        </div>
      </div>
    );
  };

  if (logTypesLoading) {
    return null;
  }

  if (shouldShowInfoMessage()) {
    return renderInfoMessage();
  }

  return (
    <div className={cx('log-level', `levels-${logLevels.length}`)}>
      <InputSlider
        options={logLevels}
        value={logLevel}
        onChange={changeLogLevel}
        trackChange={trackLogLevelFilterClick}
        marks={logLevels.reduce(
          (acc, item, index) => ({
            ...acc,
            [index]: <MarkComponent item={item} />,
          }),
          {},
        )}
      />
    </div>
  );
};

MarkComponent.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  }).isRequired,
};

LogLevelsSlider.propTypes = {
  logLevel: PropTypes.object.isRequired,
  logLevels: PropTypes.array.isRequired,
  onChangeLogLevel: PropTypes.func.isRequired,
};

export default LogLevelsSlider;
