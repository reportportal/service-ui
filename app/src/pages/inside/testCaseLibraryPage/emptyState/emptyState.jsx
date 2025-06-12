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
import Parser from 'html-react-parser';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';

import { hideModalAction, showModalAction } from 'controllers/modal';
import { NumerableBlock } from 'pages/common/numerableBlock';
import { EmptyStatePage } from 'pages/inside/common/emptyStatePage';
import { referenceDictionary } from 'common/utils';
import ImportIcon from 'common/img/import-thin-inline.svg';

import { CREATE_TEST_CASE_MODAL_KEY } from '../createTestCaseModal';
import { messages } from './messages';
import { commonMessages } from '../commonMessages';

export const EmptyState = () => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();

  const benefits = [messages.createFolder, messages.addTestCases, messages.tagTestCases].map(
    (translation) =>
      formatMessage(translation, {
        strong: (chunks) => <strong>{chunks}</strong>,
        br: <br />,
      }),
  );

  const handleModalSubmit = (formValues) => {
    console.log('Form submitted with values:', formValues);
    dispatch(hideModalAction());
  };

  const openCreateTestCaseModal = () => {
    dispatch(
      showModalAction({
        id: CREATE_TEST_CASE_MODAL_KEY,
        data: {
          onSubmit: handleModalSubmit,
        },
      }),
    );
  };

  return (
    <>
      <EmptyStatePage
        title={formatMessage(messages.emptyPageTitle)}
        description={Parser(formatMessage(messages.emptyPageDescription))}
        imageType="docs"
        documentationLink={referenceDictionary.rpDoc}
        buttons={[
          {
            name: formatMessage(commonMessages.createTestCase),
            dataAutomationId: 'createTestCaseButton',
            isCompact: true,
            handleButton: openCreateTestCaseModal,
          },
          {
            name: formatMessage(messages.importTestCases),
            dataAutomationId: 'createTestCaseButton',
            variant: 'ghost',
            icon: ImportIcon,
            isCompact: true,
          },
        ]}
      />
      <NumerableBlock
        items={benefits}
        title={formatMessage(messages.numerableBlockTitle)}
        fullWidth
      />
    </>
  );
};
