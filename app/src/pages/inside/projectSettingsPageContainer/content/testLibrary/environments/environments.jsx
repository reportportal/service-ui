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

import React from 'react';
import { useDispatch } from 'react-redux';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import { useIntl } from 'react-intl';

import { NumerableBlock } from 'pages/common/numerableBlock';
import { EmptyStatePage } from 'pages/inside/common/emptyStatePage';
import { showModalAction } from 'controllers/modal';
import { referenceDictionary } from 'common/utils';

import { SettingsPageContent } from '../../settingsPageContent';
import { messages } from './messages';

import styles from './environments.scss';

const cx = classNames.bind(styles);

const benefits = [
  messages.emptyPageFirstBenefit,
  messages.emptyPageSecondBenefit,
  messages.emptyPageThirdBenefit,
];

export const Environments = () => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();

  const onCreateEnvironment = () => {
    dispatch(
      showModalAction({
        id: 'createEnvironmentModal',
        data: { onSave: () => {} },
      }),
    );
  };

  return (
    <SettingsPageContent>
      <div className={cx('environments')}>
        <EmptyStatePage
          title={formatMessage(messages.emptyPageTitle)}
          description={Parser(formatMessage(messages.emptyPageDescription))}
          documentationLink={referenceDictionary.rpDoc}
          imageType="lines"
          buttons={[
            {
              name: formatMessage(messages.emptyPageButtonText),
              dataAutomationId: 'createEnvironmentButton',
              handleButton: onCreateEnvironment,
            },
          ]}
        />
        <NumerableBlock
          items={benefits.map(formatMessage)}
          title={formatMessage(messages.numerableBlockTitle)}
        />
      </div>
    </SettingsPageContent>
  );
};
