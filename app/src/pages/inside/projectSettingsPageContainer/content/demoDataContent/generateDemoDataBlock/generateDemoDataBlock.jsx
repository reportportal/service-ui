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
import { projectIdSelector } from 'controllers/pages';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { BigButton } from 'components/buttons/bigButton';
import {
  NOTIFICATION_TYPES,
  showDefaultErrorNotification,
  showNotification,
} from 'controllers/notification';
import { BubblesPreloader } from 'components/preloaders/bubblesPreloader';
import styles from './generateDemoDataBlock.scss';

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

export const GenerateDemoDataBlock = ({ onGenerate, onSuccess, className }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { formatMessage } = useIntl();
  const projectId = useSelector((state) => projectIdSelector(state));
  const dispatch = useDispatch();

  const generateDemoData = () => {
    setIsLoading(true);

    onGenerate();
    fetch(URLS.generateDemoData(projectId), { method: 'POST', data: {} })
      .then(() => {
        onSuccess();
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
    <div>
      <span className={cx('mobile-hint')}>{formatMessage(messages.mobileHint)}</span>
      <div className={cx('generate-data-block', className)}>
        <BigButton
          className={cx('generate-button')}
          mobileDisabled
          roundedCorners
          onClick={generateDemoData}
          disabled={isLoading}
          color={'topaz'}
        >
          <span className={cx('generate-button-title')}>
            {formatMessage(messages.generateButtonTitle)}
          </span>
        </BigButton>
        {isLoading && (
          <>
            <BubblesPreloader customClassName={cx('generate-data-preloader')} />
            <p className={cx('generate-data-information')}>
              {formatMessage(messages.preloaderInfo)}
            </p>
          </>
        )}
      </div>
    </div>
  );
};
GenerateDemoDataBlock.propTypes = {
  onGenerate: PropTypes.func,
  onSuccess: PropTypes.func,
  className: PropTypes.string,
};

GenerateDemoDataBlock.defaultProps = {
  onGenerate: () => {},
  onSuccess: () => {},
  className: '',
};
