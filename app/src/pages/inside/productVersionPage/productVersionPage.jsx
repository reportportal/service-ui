import React, { useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';

import { SettingsLayout } from 'layouts/settingsLayout';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { payloadSelector, urlOrganizationAndProjectSelector } from 'controllers/pages';
import { PRODUCT_VERSION_TAB_PAGE } from 'controllers/pages/constants';
import { ProductVersionHeader } from './productVersionHeader';
import {
  BUGS,
  DOCUMENTATION,
  HISTORY_OF_ACTIONS,
  LINKED_TEST_CASES,
  REQUIREMENTS,
} from './constants';
import { messages } from './messages';

export const ProductVersionPage = () => {
  const { formatMessage } = useIntl();
  const { organizationSlug, projectSlug } = useSelector(urlOrganizationAndProjectSelector);
  const { productVersionTab: currentTab, productVersionId } = useSelector(payloadSelector);

  const createTabLink = useCallback(
    (productVersionTab) => ({
      type: PRODUCT_VERSION_TAB_PAGE,
      payload: {
        projectSlug,
        organizationSlug,
        productVersionId,
        productVersionTab,
      },
    }),
    [organizationSlug, productVersionId, projectSlug],
  );

  const tabsConfig = useMemo(
    () => ({
      [DOCUMENTATION]: {
        name: formatMessage(messages.documentation),
        link: createTabLink(DOCUMENTATION),
        component: <div>{formatMessage(messages.documentation)}</div>,
      },
      [LINKED_TEST_CASES]: {
        name: formatMessage(messages.linkedTestCases),
        link: createTabLink(LINKED_TEST_CASES),
        component: <div>{formatMessage(messages.linkedTestCases)}</div>,
      },
      [REQUIREMENTS]: {
        name: formatMessage(messages.requirements),
        link: createTabLink(REQUIREMENTS),
        component: <div>{formatMessage(messages.requirements)}</div>,
      },
      [BUGS]: {
        name: formatMessage(messages.bugs),
        link: createTabLink(BUGS),
        component: <div>{formatMessage(messages.bugs)}</div>,
      },
      [HISTORY_OF_ACTIONS]: {
        name: formatMessage(messages.historyOfActions),
        link: createTabLink(HISTORY_OF_ACTIONS),
        component: <div>{formatMessage(messages.historyOfActions)}</div>,
      },
    }),
    [createTabLink, formatMessage],
  );

  return (
    <SettingsLayout>
      <ScrollWrapper resetRequired>
        <ProductVersionHeader tabsConfig={tabsConfig} />
        {currentTab ?? tabsConfig[currentTab]?.component}
      </ScrollWrapper>
    </SettingsLayout>
  );
};
