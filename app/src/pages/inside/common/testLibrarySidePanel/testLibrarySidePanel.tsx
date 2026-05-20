/*
 * Copyright 2026 EPAM Systems
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

import { useIntl } from 'react-intl';
import { useCallback, useState } from 'react';
import { useTracking } from 'react-tracking';
import { isEmpty } from 'es-toolkit/compat';
import { VoidFn } from '@reportportal/ui-kit/common';
import { Button, SidePanel, Selection, Toggle } from '@reportportal/ui-kit';

import {
  TEST_PLANS_PAGE_EVENTS,
  PLACE_TEST_CASE_LIBRARY_SIDE_PANEL,
  ACTION_SOURCE,
} from 'analyticsEvents/testPlansPageEvents';
import { BULK_ADD_TO_LAUNCH_MIN_SELECTION } from 'pages/inside/common/constants';
import { createClassnames } from 'common/utils';
import { useModal } from 'common/hooks';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { commonMessages } from 'pages/inside/common/common-messages';
import {
  AddTestCasesToLaunchModalProps,
  ADD_TEST_CASES_TO_LAUNCH_MODAL_KEY,
  AddTestCasesToLaunchModal,
} from 'pages/inside/testPlansPage/testPlanDetailsPage/testPlanFolders/allTestCasesPage';

import { SelectableFolderTree } from './selectableFolderTree/selectableFolderTree';
import { TestLibraryPanelProvider } from './testLibraryPanelContext';
import { useTestLibraryPanel } from './hooks/useTestLibraryPanel';
import { DraggedItemPreview } from './draggedItemPreview';
import { TestPlanDropZonesContainer } from './testPlanDropZonesContainer';
import { messages } from './messages';

import styles from './testLibrarySidePanel.scss';

const cx = createClassnames(styles);

interface TestLibrarySidePanelProps {
  isOpen: boolean;
  isAddingToTestPlan?: boolean;
  onClose: VoidFn;
  onAddTestCases: (testCaseIds: number[]) => Promise<boolean>;
}

export const TestLibrarySidePanel = ({
  isOpen,
  isAddingToTestPlan = false,
  onAddTestCases,
  onClose,
}: TestLibrarySidePanelProps) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const { canManageTestCases } = useUserPermissions();
  const [shouldHideAddedTestCases, setShouldHideAddedTestCases] = useState(true);

  const {
    actionsValue,
    stateValue,
    selectionCount,
    hasSelection,
    clearSelection,
    addToTestPlan,
    selectedTestCases,
    testPlanId,
  } = useTestLibraryPanel({
    isOpen,
    shouldHideAddedTestCases,
    onAddTestCases,
    onClose,
  });

  const { openModal: openAddToLaunchModal } = useModal<AddTestCasesToLaunchModalProps>({
    modalKey: ADD_TEST_CASES_TO_LAUNCH_MODAL_KEY,
    renderModal: (data) => (
      <AddTestCasesToLaunchModal
        selectedRowsIds={data.selectedRowsIds}
        testCases={data.testCases}
        testPlanId={data.testPlanId}
        source={data.source}
        place={data.place}
      />
    ),
  });

  const handleAddAndCreateLaunch = useCallback(async () => {
    trackEvent(TEST_PLANS_PAGE_EVENTS.CLICK_START_ADD_AND_CREATE_LAUNCH);
    const testCases = [...selectedTestCases];
    const testCaseIds = testCases.map(({ id }) => id);

    const isSuccess = await addToTestPlan();

    if (isSuccess && !isEmpty(testCaseIds) && testPlanId != null) {
      const source =
        testCaseIds.length >= BULK_ADD_TO_LAUNCH_MIN_SELECTION ? ACTION_SOURCE.BULK : ACTION_SOURCE.SINGLE;
      openAddToLaunchModal({
        selectedRowsIds: testCaseIds,
        testCases,
        testPlanId: String(testPlanId),
        source,
        place: PLACE_TEST_CASE_LIBRARY_SIDE_PANEL,
      });
    }
  }, [addToTestPlan, openAddToLaunchModal, testPlanId, selectedTestCases, trackEvent]);

  const handleSubmitAddToTestPlan = useCallback(async () => {
    const count = selectedTestCases.length;
    const isSuccess = await addToTestPlan();

    if (isSuccess) {
      trackEvent(TEST_PLANS_PAGE_EVENTS.submitAddTestsFromLibrary(count));
    }
  }, [addToTestPlan, selectedTestCases, trackEvent]);

  const titleComponent = (
    <div className={cx('test-library-panel__title')}>
      <h3>{formatMessage(messages.testLibrary)}</h3>
      <Toggle
        value={shouldHideAddedTestCases}
        onChange={(event) => {
          const isOn = event.currentTarget.checked;
          setShouldHideAddedTestCases(isOn);
          trackEvent(TEST_PLANS_PAGE_EVENTS.clickHideAddedToggle(isOn));
        }}
      >
        {formatMessage(messages.hideAdded)}
      </Toggle>
    </div>
  );

  const contentComponent = (
    <TestLibraryPanelProvider actions={actionsValue} state={stateValue}>
      <div className={cx('test-library-panel__content')}>
        {isOpen && (
          <>
            <DraggedItemPreview />
            <SelectableFolderTree />
            {canManageTestCases && (
              <TestPlanDropZonesContainer
                testPlanId={testPlanId}
                onAddTestCases={onAddTestCases}
                onClose={onClose}
              />
            )}
          </>
        )}
      </div>
    </TestLibraryPanelProvider>
  );

  const isSubmitButtonDisabled = selectionCount === 0 || isAddingToTestPlan;

  const footerComponent = hasSelection ? (
    <div className={cx('test-library-panel__footer')}>
      <Selection
        selectedCount={selectionCount}
        captions={{
          buttonCaption: formatMessage(messages.clear),
          selected: formatMessage(messages.selected),
        }}
        onClearSelection={clearSelection}
      />
      <div className={cx('test-library-panel__footer-buttons')}>
        <Button
          variant="ghost"
          disabled={isSubmitButtonDisabled}
          onClick={() => {
            handleAddAndCreateLaunch();
          }}
        >
          {formatMessage(messages.addAndCreateLaunch)}
        </Button>
        <Button
          variant="primary"
          disabled={isSubmitButtonDisabled}
          onClick={() => {
            handleSubmitAddToTestPlan();
          }}
        >
          {formatMessage(messages.addToTestPlan)}
        </Button>
      </div>
    </div>
  ) : null;

  return (
    <SidePanel
      title={titleComponent}
      contentComponent={contentComponent}
      footerComponent={footerComponent}
      isOpen={isOpen}
      closeButtonAriaLabel={formatMessage(commonMessages.closePanel)}
      className={cx('test-library-panel')}
      side="right"
      onClose={onClose}
    />
  );
};
