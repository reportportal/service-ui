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
import { useTracking } from 'react-tracking';
import classNames from 'classnames/bind';
import { InputSlider } from 'components/inputs/inputSlider';
import { userIdSelector } from 'controllers/user';
import { isDefaultLogLevel, isLogLevelsEqual } from 'controllers/log/utils';
import { LOG_PAGE_EVENTS } from 'components/main/analytics/events';
import { logTypesLoadingSelector } from 'controllers/project';
import styles from './logLevelsSlider.scss';

const cx = classNames.bind(styles);

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
  const { trackEvent } = useTracking();
  const userId = useSelector(userIdSelector);
  const logTypesLoading = useSelector(logTypesLoadingSelector);

  const shouldHideSlider = () => {
    return logLevels.length === 1 && isDefaultLogLevel(logLevels[0]);
  };

  const changeLogLevel = (newLogLevel) => {
    if (!isLogLevelsEqual(newLogLevel, logLevel)) {
      onChangeLogLevel(userId, newLogLevel);
    }
  };

  const trackLogLevelFilterClick = (newLogLevel) => {
    trackEvent(LOG_PAGE_EVENTS.getClickOnLogLevelFilterEvent(newLogLevel.name));
  };

  if (logTypesLoading || shouldHideSlider()) {
    return null;
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
