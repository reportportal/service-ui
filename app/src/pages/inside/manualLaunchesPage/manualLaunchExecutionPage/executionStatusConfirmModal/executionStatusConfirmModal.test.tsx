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

import { act, type ReactNode } from 'react';
import { mount } from 'enzyme';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';
import { change, reducer as formReducer } from 'redux-form';

import { availableBtsIntegrationsSelector } from 'controllers/plugins';

import { MANUAL_LAUNCHES_PLACE } from 'components/main/analytics/events/ga4Events/manualLaunchesPageEvents';
import { ExecutionStatus } from 'pages/inside/manualLaunchesPage/types';

import { ExecutionStatusConfirmModal } from './executionStatusConfirmModal';
import type { ExecutionStatusConfirmModalData } from '../types';
import { EXECUTION_STATUS_CONFIRM_FORM_NAME } from '../constants';

const UPDATE_STATUS = 'updateManualLaunchExecutionStatus';
const HIDE_MODAL = 'hideModal';

interface StatusUpdatePayload {
  status: string;
  onSuccess?: () => void;
  onFinally?: () => void;
}

const mockDispatch = jest.fn<void, [unknown]>();
const mockOpenBtsModal = jest.fn();
const mockUseSelector = jest.fn<unknown, [unknown]>();
let mockCanManageExecutions = false;
let mockOkButtonClick: () => void;

jest.mock('react-redux', () => ({
  ...jest.requireActual<object>('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: (selector: unknown) => mockUseSelector(selector),
}));

jest.mock('react-tracking', () => ({
  useTracking: () => ({ trackEvent: jest.fn() }),
}));

jest.mock('controllers/modal', () => ({
  withModal: () => (component: unknown) => component,
  hideModalAction: () => ({ type: 'hideModal' }),
}));

jest.mock('controllers/manualLaunch', () => ({
  updateManualLaunchExecutionStatusAction: (payload: unknown) => ({
    type: 'updateManualLaunchExecutionStatus',
    payload,
  }),
  activeManualLaunchExecutionSelector: jest.fn(),
}));

jest.mock('controllers/project', () => ({ projectKeySelector: jest.fn() }));
jest.mock('controllers/plugins', () => ({ availableBtsIntegrationsSelector: jest.fn() }));
jest.mock('hooks/useTypedSelector', () => ({ useManualLaunchId: () => 1 }));
jest.mock('hooks/useUserPermissions', () => ({
  useUserPermissions: () => ({ canManageExecutions: mockCanManageExecutions }),
}));

jest.mock('hooks/useFileAttachments', () => ({
  useFileAttachments: () => ({
    pendingFiles: [],
    removedAttachmentIds: new Set(),
    existingAttachmentsData: [],
    pendingFilesData: [],
    handleFilesAdded: jest.fn(),
    handlePendingRemove: jest.fn(),
    handleExistingRemove: jest.fn(),
  }),
}));

jest.mock('hooks/useModalButtons', () => ({
  useModalButtons: ({ onSubmit }: { onSubmit: () => void }) => {
    mockOkButtonClick = onSubmit;

    return { okButton: {}, cancelButton: {}, hideModal: jest.fn() };
  },
}));

jest.mock('common/hooks', () => ({ useTextareaAutoResize: jest.fn() }));

jest.mock('../BTSIssuesModal/useBTSIssuesModal', () => ({
  useBTSIssuesModal: () => ({ openModal: mockOpenBtsModal }),
}));

jest.mock('components/fields/fieldProvider', () => ({
  FieldProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
jest.mock('components/fields/fieldErrorHint', () => ({
  FieldErrorHint: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
jest.mock('components/inputs/inputCheckbox', () => ({ InputCheckbox: () => null }));

jest.mock('@reportportal/ui-kit', () => {
  const FileDropArea = ({ children }: { children: ReactNode }) => <>{children}</>;
  FileDropArea.DropZone = () => null;
  FileDropArea.BrowseButton = () => null;
  FileDropArea.AttachedFilesList = () => null;

  return {
    Modal: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    FileDropArea,
    FieldTextFlex: jest.requireActual<typeof import('react')>('react').forwardRef(() => null),
    PlusIcon: () => null,
    DragAndDropIcon: () => null,
    Tooltip: ({ children }: { children: ReactNode }) => <>{children}</>,
  };
});

jest.mock('@reportportal/ui-kit/fileDropArea', () => ({
  MIME_TYPES: { jpeg: 'image/jpeg', png: 'image/png', pdf: 'application/pdf' },
}));

const store = createStore(combineReducers({ form: formReducer }));

const submitModal = (data: ExecutionStatusConfirmModalData, postIssueToBts = false) => {
  mount(
    <Provider store={store}>
      <IntlProvider locale="en">
        <ExecutionStatusConfirmModal data={data} />
      </IntlProvider>
    </Provider>,
  );

  act(() => {
    store.dispatch(change(EXECUTION_STATUS_CONFIRM_FORM_NAME, 'postIssueToBts', postIssueToBts));
  });

  act(() => {
    mockOkButtonClick();
  });

  const statusAction = mockDispatch.mock.calls
    .map(([action]) => action as { type: string; payload: StatusUpdatePayload })
    .find(({ type }) => type === UPDATE_STATUS);

  return statusAction.payload;
};

describe('ExecutionStatusConfirmModal', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockOpenBtsModal.mockClear();
    mockUseSelector.mockReset();
    mockCanManageExecutions = false;
  });

  test('should call onStatusSet and close the modal after the status is set', () => {
    const onStatusSet = jest.fn();
    const payload = submitModal({
      executionId: 1,
      status: 'failed',
      currentStatus: ExecutionStatus.TO_RUN,
      place: MANUAL_LAUNCHES_PLACE.EXECUTION_DETAILS_SIDEBAR,
      onStatusSet,
    });

    expect(payload.status).toBe('FAILED');
    expect(onStatusSet).not.toHaveBeenCalled();

    act(() => payload.onSuccess());

    expect(onStatusSet).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith({ type: HIDE_MODAL });
  });

  test('should not call onStatusSet when the request does not succeed', () => {
    const onStatusSet = jest.fn();
    const payload = submitModal({
      executionId: 1,
      status: 'passed',
      currentStatus: ExecutionStatus.TO_RUN,
      place: MANUAL_LAUNCHES_PLACE.EXECUTION_DETAILS_SIDEBAR,
      onStatusSet,
    });

    act(() => payload.onFinally());

    expect(onStatusSet).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalledWith({ type: HIDE_MODAL });
  });

  test('should close only the modal when no onStatusSet is given', () => {
    const payload = submitModal({
      executionId: 1,
      status: 'skipped',
      currentStatus: ExecutionStatus.TO_RUN,
      place: MANUAL_LAUNCHES_PLACE.TEST_EXECUTION_PAGE,
    });

    expect(() => act(() => payload.onSuccess())).not.toThrow();
    expect(mockDispatch).toHaveBeenCalledWith({ type: HIDE_MODAL });
  });

  test('should call onStatusSet before the BTS modal opens', () => {
    const onStatusSet = jest.fn();

    mockCanManageExecutions = true;
    mockUseSelector.mockImplementation((selector) =>
      selector === availableBtsIntegrationsSelector ? [{ id: 1 }] : null,
    );

    const payload = submitModal(
      {
        executionId: 1,
        status: 'failed',
        currentStatus: ExecutionStatus.TO_RUN,
        place: MANUAL_LAUNCHES_PLACE.EXECUTION_DETAILS_SIDEBAR,
        onStatusSet,
      },
      true,
    );

    act(() => payload.onSuccess());

    expect(onStatusSet).toHaveBeenCalledTimes(1);
    expect(mockOpenBtsModal).toHaveBeenCalledWith(
      MANUAL_LAUNCHES_PLACE.EXECUTION_DETAILS_SIDEBAR_FAILED,
      1,
    );
    expect(onStatusSet.mock.invocationCallOrder[0]).toBeLessThan(
      mockOpenBtsModal.mock.invocationCallOrder[0],
    );
    expect(mockDispatch).not.toHaveBeenCalledWith({ type: HIDE_MODAL });
  });
});
