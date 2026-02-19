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

import { useState } from 'react';
import { useIntl } from 'react-intl';
import { Button, SidePanel, Toggle, Selection } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { VoidFn } from '@reportportal/ui-kit/common';
import { commonMessages } from 'pages/inside/common/common-messages';

import { SelectableFolderTree } from './selectableFolderTree/selectableFolderTree';
import { TestLibraryPanelProvider } from './testLibraryPanelContext';
import { useTestLibraryPanel } from './useTestLibraryPanel';
import { messages } from './messages';

import styles from './testLibrarySidePanel.scss';

const cx = createClassnames(styles);

interface TestLibrarySidePanelProps {
  isOpen: boolean;
  onClose: VoidFn;
  onAddTestCases: (testCaseIds: number[]) => void;
}

export const TestLibrarySidePanel = ({
  isOpen,
  onAddTestCases,
  onClose,
}: TestLibrarySidePanelProps) => {
  const { formatMessage } = useIntl();
  const [shouldHideAddedTestCases, setShouldHideAddedTestCases] = useState(false);

  const { contextValue, selectionCount, hasSelection, clearSelection, addToTestPlan } =
    useTestLibraryPanel({
      onAddTestCases,
      onClose,
    });

  const titleComponent = (
    <div className={cx('test-library-panel__title')}>
      <h3>{formatMessage(messages.testLibrary)}</h3>
      <Toggle
        value={shouldHideAddedTestCases}
        onChange={(event) => setShouldHideAddedTestCases(event.currentTarget.checked)}
      >
        {formatMessage(messages.hideAdded)}
      </Toggle>
    </div>
  );

  const contentComponent = (
    <TestLibraryPanelProvider value={contextValue}>
      <div className={cx('test-library-panel__content')}>
        <SelectableFolderTree />
      </div>
    </TestLibraryPanelProvider>
  );

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
        <Button variant="ghost" onClick={addToTestPlan}>
          {formatMessage(messages.addAndCreateLaunch)}
        </Button>
        <Button variant="primary" onClick={addToTestPlan}>
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
