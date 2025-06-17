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
import { useDispatch, useSelector } from 'react-redux';

import { NumerableBlock } from 'pages/common/numerableBlock';
import { EmptyStatePage } from 'pages/inside/common/emptyStatePage';
import { referenceDictionary } from 'common/utils';
import { TEST_CASE_DETAILS_PAGE } from 'controllers/pages/constants';
import { urlOrganizationAndProjectSelector } from 'controllers/pages';

import ImportIcon from 'common/img/import-thin-inline.svg';
import { messages } from '../messages';
import { commonMessages } from '../../commonMessages';

export const MainPageEmptyState = () => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const { organizationSlug, projectSlug } = useSelector(urlOrganizationAndProjectSelector);

  const handleCreateTestCase = () => {
    dispatch({
      type: TEST_CASE_DETAILS_PAGE,
      payload: {
        // temporary - will be replaced with actual ID generation
        testCaseSlug: 'new',
        organizationSlug,
        projectSlug,
      },
    });
  };

  const benefits = [
    messages.createFolder,
    messages.addTestCases,
    messages.tagTestCases,
  ].map((translation) => Parser(formatMessage(translation)));

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
            handleButton: handleCreateTestCase,
          },
          {
            name: formatMessage(messages.importTestCases),
            dataAutomationId: 'importTestCaseButton',
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
