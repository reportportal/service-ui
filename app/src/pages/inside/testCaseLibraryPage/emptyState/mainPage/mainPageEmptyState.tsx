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

import Parser from 'html-react-parser';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';

import { NumerableBlock } from 'pages/common/numerableBlock';
import { EmptyStatePage } from 'pages/inside/common/emptyStatePage';
import { referenceDictionary } from 'common/utils';
import { showModalAction } from 'controllers/modal';

import { messages } from '../messages';
import { commonMessages } from '../../commonMessages';
import { CREATE_TEST_CASE_MODAL_KEY, CreateTestCaseModal } from '../../createTestCaseModal';

export const MainPageEmptyState = () => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();

  const showCreateTestCaseModal = () => {
    dispatch(
      showModalAction({
        id: CREATE_TEST_CASE_MODAL_KEY,
        data: null,
        component: <CreateTestCaseModal />,
      }),
    );
  };

  const benefits = [
    messages.createFolder,
    messages.addTestCases,
    messages.tagTestCases,
  ].map((translation) => Parser(formatMessage(translation, {}, { ignoreTag: true })));

  return (
    <>
      <EmptyStatePage
        title={formatMessage(messages.emptyPageTitle)}
        description={Parser(formatMessage(messages.emptyPageDescription))}
        imageType="docs"
        documentationLink={referenceDictionary.rpDoc}
        buttons={[
          {
            name: formatMessage(commonMessages.createFolder),
            dataAutomationId: 'createFolderButton',
            isCompact: true,
          },
          {
            name: formatMessage(commonMessages.createTestCase),
            dataAutomationId: 'createTestCaseButton',
            isCompact: true,
            variant: 'ghost',
            handleButton: showCreateTestCaseModal,
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
