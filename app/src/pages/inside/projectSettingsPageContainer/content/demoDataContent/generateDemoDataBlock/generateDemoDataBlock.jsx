/*
 * Copyright 2022 EPAM Systems
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

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { useDispatch, useSelector } from 'react-redux';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { Button } from 'componentLibrary/button';
import {
  NOTIFICATION_TYPES,
  showDefaultErrorNotification,
  showNotification,
} from 'controllers/notification';
import { useTracking } from 'react-tracking';
import { PROJECT_SETTINGS_DEMO_DATA_EVENTS } from 'analyticsEvents/projectSettingsPageEvents';
import { projectKeySelector } from 'controllers/project';
import styles from './generateDemoDataBlock.scss';
import { LabeledPreloader } from '../../elements';

const cx = classNames.bind(styles);

const messages = defineMessages({
  mobileHint: {
    id: 'GenerateDemoDataBlock.mobileHint',
    defaultMessage: 'You can generate data only on desktop view.',
  },
  generateButtonTitle: {
    id: 'GenerateDemoDataBlock.generateButtonTitle',
    defaultMessage: 'Generate Demo Data',
  },
  preloaderInfo: {
    id: 'GenerateDemoDataBlock.preloaderInfoNewText',
    defaultMessage:
      'Please wait, Data generation has been started and it might take several minutes.',
  },
  generateDemoDataSuccess: {
    id: 'GenerateDemoDataBlock.generateDemoDataSuccess',
    defaultMessage: 'Demo data has been generated',
  },
});

export const GenerateDemoDataBlock = ({ className }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { formatMessage } = useIntl();
  const projectKey = useSelector(projectKeySelector);
  const dispatch = useDispatch();
  const { trackEvent } = useTracking();

  const generateDemoData = () => {
    setIsLoading(true);

    trackEvent(PROJECT_SETTINGS_DEMO_DATA_EVENTS.CLICK_GENERATE_DATA_IN_DEMO_DATA_TAB);

    fetch(URLS.generateDemoData(projectKey), { method: 'POST', data: {} })
      .then(() => {
        dispatch(
          showNotification({
            message: formatMessage(messages.generateDemoDataSuccess),
            type: NOTIFICATION_TYPES.SUCCESS,
          }),
        );

        setIsLoading(false);
      })
      .catch((error) => {
        dispatch(showDefaultErrorNotification(error));

        setIsLoading(false);
      });
  };
  return (
    <>
      <div className={cx('generate-data-block', className)}>
        <Button onClick={generateDemoData} disabled={isLoading}>
          {formatMessage(messages.generateButtonTitle)}
        </Button>
        {isLoading && <LabeledPreloader text={formatMessage(messages.preloaderInfo)} />}
      </div>
    </>
  );
};
GenerateDemoDataBlock.propTypes = {
  className: PropTypes.string,
};

GenerateDemoDataBlock.defaultProps = {
  className: '',
};
