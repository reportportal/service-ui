/*
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import type { ReactNode } from 'react';
import { shallow } from 'enzyme';
import { useSelector } from 'react-redux';

import { fetch } from 'common/utils/fetch';
import { isRootLaunchParentSelector } from 'controllers/testItem';
import { AiFactoryBacklink } from 'pages/inside/aiFactory/backlinks';
import { ParentInfo } from 'pages/inside/common/infoLine/parentInfo';
import { ItemInfo } from 'pages/inside/common/itemInfo/itemInfo';
import { TestItemActionPanel } from 'pages/inside/common/suiteTestToolbar/actionPanel/testItemActionPanel';
import { HistoryActionPanel } from 'pages/inside/historyPage/historyToolbar/actionPanel/historyActionPanel';
import { LogToolbar } from 'pages/inside/logsPage/logToolbar/logToolbar';
import { TestItemDetailsModal } from 'pages/inside/stepPage/modals/testItemDetailsModal/testItemDetailsModal';
import { UniqueErrorsActionPanel } from 'pages/inside/uniqueErrorsPage/uniqueErrorsToolbar/actionPanel/uniqueErrorsActionPanel';

jest.mock('@reportportal/ui-kit', () => ({}));
jest.mock('html-react-parser', () => ({ __esModule: true, default: () => null }));
jest.mock('react-intl', () => ({
  defineMessages: (messages: unknown) => messages,
  FormattedMessage: 'FormattedMessage',
  injectIntl: (Component: unknown) => Component,
  useIntl: () => ({ formatMessage: () => '' }),
}));
jest.mock('react-redux', () => {
  const connectMapStates: CallableFunction[] = [];

  return {
    connect:
      (mapState: unknown) =>
      (Component: unknown): unknown => {
        if (typeof mapState === 'function') {
          connectMapStates.push(mapState);
        }
        return Component;
      },
    getConnectMapStates: () => connectMapStates,
    useDispatch: () => jest.fn(),
    useSelector: jest.fn(),
  };
});
jest.mock('react-tracking', () => ({
  __esModule: true,
  default: () => (Component: unknown) => Component,
  useTracking: () => ({ trackEvent: jest.fn() }),
}));
jest.mock('redux-form', () => ({ reduxForm: () => (Component: unknown) => Component }));
jest.mock('common/utils/fetch', () => ({ fetch: jest.fn() }));
jest.mock('common/utils', () => ({
  createClassnames:
    () =>
    (...classNames: string[]) =>
      classNames.join(' '),
  fromNowFormat: () => '',
}));
jest.mock('common/utils/localizationUtils', () => ({
  formatMethodType: () => '',
  formatStatus: () => '',
}));
jest.mock('common/utils/permissions', () => ({
  canEditLaunch: () => false,
  canWorkWithTests: () => false,
}));
jest.mock('common/utils/timeDateUtils', () => ({ getDuration: () => '' }));
jest.mock('common/utils/validation', () => ({
  commonValidators: { createDescriptionValidator: () => false },
  validate: { attributesArray: () => true },
}));
jest.mock('controllers/testItem', () => ({
  breadcrumbsSelector: jest.fn(),
  formatItemName: (name: string) => name,
  isRootLaunchParentSelector: jest.fn(),
  isStepLevelSelector: jest.fn(),
  levelSelector: jest.fn(),
  namespaceSelector: jest.fn(),
  fetchTestItemsFromLogPageAction: jest.fn(),
  restorePathAction: jest.fn(),
}));
jest.mock('controllers/pages', () => ({
  activeProjectRoleSelector: jest.fn(),
  userRolesSelector: jest.fn(),
}));
jest.mock('controllers/plugins', () => ({
  availableBtsIntegrationsSelector: jest.fn(),
  availableIntegrationsByPluginNameSelector: jest.fn(),
  enabledBtsPluginsSelector: jest.fn(),
  isBtsPluginsExistSelector: jest.fn(),
  uiExtensionLaunchItemComponentsSelector: jest.fn(),
}));
jest.mock('controllers/plugins/uiExtensions', () => ({
  testItemDetailsAddonSelector: jest.fn(),
}));
jest.mock('controllers/project', () => ({ projectKeySelector: jest.fn() }));
jest.mock('controllers/log', () => ({
  clearLogPageStackTrace: jest.fn(),
  DETAILED_LOG_VIEW: 'DETAILED',
  disableNextItemLinkSelector: jest.fn(),
  disablePrevItemLinkSelector: jest.fn(),
  includeAllLaunchesSelector: jest.fn(),
  nextItemSelector: jest.fn(),
  nextLogLinkSelector: jest.fn(),
  previousItemSelector: jest.fn(),
  previousLogLinkSelector: jest.fn(),
  setIncludeAllLaunchesAction: jest.fn(),
}));
jest.mock('controllers/itemsHistory', () => ({ isEmptyHistorySelector: jest.fn() }));
jest.mock('controllers/pagination', () => ({
  withPagination: () => (Component: unknown) => Component,
}));
jest.mock('controllers/step', () => ({ stepPaginationSelector: jest.fn() }));
jest.mock('controllers/uniqueErrors', () => ({ reloadClustersAction: jest.fn() }));
jest.mock('controllers/uniqueErrors/clusterItems', () => ({
  ignoreInAutoAnalysisAction: jest.fn(),
  includeInAutoAnalysisAction: jest.fn(),
  lastOperationSelector: jest.fn(),
  linkIssueAction: jest.fn(),
  postIssueAction: jest.fn(),
  proceedWithValidItemsAction: jest.fn(),
  unlinkIssueAction: jest.fn(),
}));
jest.mock('controllers/user', () => ({ userAccountRoleSelector: jest.fn() }));
jest.mock('controllers/notification', () => ({
  NOTIFICATION_TYPES: { SUCCESS: 'SUCCESS' },
  showDefaultErrorNotification: jest.fn(),
  showNotification: jest.fn(),
}));
jest.mock('hooks/useUserPermissions', () => ({
  useUserPermissions: () => ({ canBulkEditItems: false, canWorkWithTests: false }),
}));
jest.mock('pages/inside/aiFactory/backlinks', () => ({ AiFactoryBacklink: 'AiFactoryBacklink' }));
jest.mock('pages/inside/common/nameLink', () => ({ NameLink: 'NameLink' }));
jest.mock('pages/inside/common/durationBlock', () => ({ DurationBlock: 'DurationBlock' }));
jest.mock('pages/inside/common/itemInfo/attributesBlock', () => ({
  AttributesBlock: 'AttributesBlock',
}));
jest.mock('pages/inside/common/itemInfo/ownerBlock', () => ({ OwnerBlock: 'OwnerBlock' }));
jest.mock('pages/inside/common/itemInfo/retriesCounter', () => ({
  RetriesCounter: 'RetriesCounter',
}));
jest.mock('pages/inside/common/infoLine/parentInfo/attributes', () => ({
  Attributes: 'Attributes',
}));
jest.mock('pages/inside/common/infoLine/parentInfo/description', () => ({
  Description: 'Description',
}));
jest.mock('pages/inside/common/infoLine/parentInfo/duration', () => ({ Duration: 'Duration' }));
jest.mock('pages/inside/common/infoLine/parentInfo/owner', () => ({ Owner: 'Owner' }));
jest.mock('pages/inside/common/testItemStatus', () => ({ TestItemStatus: 'TestItemStatus' }));
jest.mock('pages/inside/common/testParameters', () => ({ TestParameters: 'TestParameters' }));
jest.mock('pages/inside/common/stackTrace', () => ({ StackTrace: 'StackTrace' }));
jest.mock('components/extensionLoader', () => ({
  ExtensionLoader: 'ExtensionLoader',
  extensionType: () => null,
}));
jest.mock('components/main/markdown', () => ({
  MarkdownEditor: 'MarkdownEditor',
  MarkdownViewer: 'MarkdownViewer',
}));
jest.mock('components/main/analytics/events', () => ({
  LOG_PAGE_EVENTS: {
    CLICK_ALL_LABEL_BREADCRUMB: {},
    CLICK_ITEM_NAME_BREADCRUMB: {},
    getClickOnPlusMinusBreadcrumbEvent: {},
  },
  LAUNCHES_PAGE_EVENTS: { CLICK_ITEM_NAME: {} },
  STEP_PAGE_EVENTS: {},
}));
jest.mock('components/integrations/integrationProviders/sauceLabsIntegration/utils', () => ({
  getSauceLabsConfig: () => null,
}));
jest.mock('components/main/tooltips/tooltip', () => ({
  withTooltip: () => (Component: unknown) => Component,
}));
jest.mock('components/main/tooltips/textTooltip', () => ({ TextTooltip: 'TextTooltip' }));
jest.mock('components/main/accordionContainer', () => ({
  AccordionContainer: 'AccordionContainer',
}));
jest.mock('components/main/attributeList', () => ({ AttributeListField: 'AttributeListField' }));
jest.mock('components/main/containerWithTabs', () => ({ ContainerWithTabs: 'ContainerWithTabs' }));
jest.mock('components/main/scrollWrapper', () => ({ ScrollWrapper: 'ScrollWrapper' }));
jest.mock('components/inputs/inputCheckbox', () => ({ InputCheckbox: 'InputCheckbox' }));
jest.mock('components/fields/fieldProvider', () => ({ FieldProvider: 'FieldProvider' }));
jest.mock('components/fields/fieldErrorHint', () => ({ FieldErrorHint: 'FieldErrorHint' }));
jest.mock('components/main/modal', () => ({
  ModalField: 'ModalField',
  ModalLayout: 'ModalLayout',
  withModal: () => (Component: unknown) => Component,
}));
jest.mock('components/main/breadcrumbs', () => ({
  Breadcrumbs: 'Breadcrumbs',
  breadcrumbDescriptorShape: () => null,
}));
jest.mock('components/buttons/ghostButton', () => ({ GhostButton: 'GhostButton' }));
jest.mock('components/buttons/ghostMenuButton', () => ({ GhostMenuButton: 'GhostMenuButton' }));
jest.mock('components/main/analytics', () => ({ pageEventsMap: {} }));
jest.mock('pages/inside/common/utils', () => ({ createStepActionDescriptors: () => [] }));
jest.mock('pages/inside/historyPage/historyToolbar/actionPanel/compareWithFilterControl', () => ({
  CompareWithFilterControl: 'CompareWithFilterControl',
}));

const tmsTestCase = { id: 42, displayId: 'TC42' };
const parentItem = {
  approximateDuration: 0,
  attributes: [{ key: 'pipeline', value: '17/103' }],
  description: '',
  endTime: 2,
  owner: null,
  startTime: 1,
  status: 'PASSED',
};
const intl = { formatMessage: () => '' };

describe('AI Factory backlink hosts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .mocked(useSelector)
      .mockImplementation((selector) => (selector === isRootLaunchParentSelector ? true : []));
  });

  test('shares the test-item backlink source between Item Info and Test Item Details', () => {
    const itemInfo = shallow(
      <ItemInfo
        intl={intl}
        sauceLabsIntegrations={[]}
        tracking={{ getTrackingData: jest.fn(), trackEvent: jest.fn() }}
        value={{ id: 1, name: 'Test item', tmsTestCase }}
      />,
    );
    const modal = shallow(
      <TestItemDetailsModal
        clearLogPageStackTrace={jest.fn()}
        data={{
          eventsInfo: { detailsTab: {}, stackTraceTab: {} },
          item: {
            attributes: [],
            description: '',
            endTime: 2,
            name: 'Test item',
            startTime: 1,
            status: 'PASSED',
            testCaseId: 'case-id',
            tmsTestCase,
            uniqueId: 'unique-id',
          },
          type: 'STEP',
          fetchFunc: jest.fn(),
        }}
        extensions={[]}
        handleSubmit={jest.fn()}
        initialize={jest.fn()}
        intl={intl}
        invalid={false}
        projectKey="project"
        showDefaultErrorNotification={jest.fn()}
        showNotification={jest.fn()}
        tracking={{ getTrackingData: jest.fn(), trackEvent: jest.fn() }}
        userRoles={{}}
      />,
    );
    const tabs = modal.find('ContainerWithTabs').prop('data') as Array<{ content: ReactNode }>;
    const detailsContent = shallow(<div>{tabs[0].content}</div>);

    expect(itemInfo.find(AiFactoryBacklink).props()).toMatchObject({
      host: 'testItem',
      testCase: tmsTestCase,
    });
    expect(detailsContent.find(AiFactoryBacklink).props()).toMatchObject({
      host: 'testItem',
      placement: 'details',
      testCase: tmsTestCase,
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  test('renders the Launch backlink only when ParentInfo receives the root signal', () => {
    const launchRoot = shallow(<ParentInfo isLaunchRoot parentItem={parentItem} />);
    const nestedItem = shallow(<ParentInfo parentItem={parentItem} />);

    expect(launchRoot.find(AiFactoryBacklink).props()).toEqual({
      attributes: parentItem.attributes,
      host: 'launchRoot',
    });
    expect(nestedItem.find(AiFactoryBacklink)).toHaveLength(0);
  });

  test.each([true, false])(
    'propagates the shared root selector result %s through TestItemActionPanel',
    (isLaunchRoot) => {
      jest
        .mocked(useSelector)
        .mockImplementation((selector) =>
          selector === isRootLaunchParentSelector ? isLaunchRoot : [],
        );
      const panel = shallow(
        <TestItemActionPanel parentItem={parentItem} showBreadcrumbs={false} />,
      );

      expect(panel.find(ParentInfo).prop('isLaunchRoot')).toBe(isLaunchRoot);
    },
  );

  test('maps the shared root selector into all three connected toolbar hosts', () => {
    jest.mocked(isRootLaunchParentSelector).mockReturnValue(true);
    const { getConnectMapStates } = jest.requireMock<{
      getConnectMapStates: () => Array<(state: unknown) => Record<string, unknown>>;
    }>('react-redux');
    const rootMappings = getConnectMapStates()
      .map((mapState) => mapState({}))
      .filter((mappedProps) => Object.prototype.hasOwnProperty.call(mappedProps, 'isLaunchRoot'));

    expect(rootMappings).toHaveLength(3);
    expect(rootMappings.every(({ isLaunchRoot }) => isLaunchRoot === true)).toBe(true);
    expect(isRootLaunchParentSelector).toHaveBeenCalledTimes(3);
  });

  test.each([
    {
      name: 'HistoryActionPanel',
      render: (isLaunchRoot: boolean) =>
        shallow(
          <HistoryActionPanel
            isLaunchRoot={isLaunchRoot}
            parentItem={parentItem}
            showBreadcrumbs={false}
            tracking={{ getTrackingData: jest.fn(), trackEvent: jest.fn() }}
          />,
        ),
    },
    {
      name: 'LogToolbar',
      render: (isLaunchRoot: boolean) =>
        shallow(
          <LogToolbar
            includeAllLaunches={false}
            intl={intl}
            isLaunchRoot={isLaunchRoot}
            logViewMode="LIST"
            parentItem={parentItem}
            setIncludeAllLaunchesAction={jest.fn()}
            tracking={{ getTrackingData: jest.fn(), trackEvent: jest.fn() }}
          />,
        ),
    },
    {
      name: 'UniqueErrorsActionPanel',
      render: (isLaunchRoot: boolean) =>
        shallow(
          <UniqueErrorsActionPanel
            intl={intl}
            isLaunchRoot={isLaunchRoot}
            parentItem={parentItem}
            projectRole="VIEWER"
            showBreadcrumbs={false}
            tracking={{ getTrackingData: jest.fn(), trackEvent: jest.fn() }}
          />,
        ),
    },
  ])('propagates the root signal through $name', ({ render }) => {
    expect(render(true).find(ParentInfo).prop('isLaunchRoot')).toBe(true);
    expect(render(false).find(ParentInfo).prop('isLaunchRoot')).toBe(false);
  });
});
