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

import { FC, useState } from 'react';
import { useIntl } from 'react-intl';
import { Dropdown, FieldText, Modal, SegmentedControl } from '@reportportal/ui-kit';
import { reduxForm } from 'redux-form';

import { withModal } from 'controllers/modal';
import { useModalButtons } from 'hooks/useModalButtons';
import { messages as commonMessages } from '../messages';
import { messages } from './messages';

import styles from './BTSIssuesModal.scss';
import { createClassnames } from 'common/utils';
import { FieldProvider } from 'components/fields';
import { BTS_ISSUES_MODAL } from '../constants';

const cx = createClassnames(styles);

enum BTSIssueActionTypes {
  POST = 'post',
  LINK = 'link',
}

interface BTSIssuesModalProps {
  data?: unknown;
  handleSubmit: () => void;
  invalid: boolean;
  dirty: boolean;
  reset: () => void;
}

const LinkBTSIssueForm = () => {
  return (
    <form>
      <FieldProvider name="ticketName">
        <FieldText
          label="Ticket name"
          placeholder="Enter ticket name"
          value=""
          defaultWidth={false}
        />
      </FieldProvider>
    </form>
  );
};

const PostBTSIssueForm = () => {
  return (
    <form className={cx('post-issue-form')}>
      <FieldProvider name="bts">
        <Dropdown
          value="Azure DevOps"
          label="BTS"
          onChange={() => {}}
          options={['Azure DevOps', 'Jira', 'YouTrack'].map((item) => ({
            label: item,
            value: item,
          }))}
        />
      </FieldProvider>
      <FieldProvider name="integrationName">
        <Dropdown
          value="1"
          label="Integration Name"
          onChange={() => {}}
          options={['1', '2', '3'].map((item) => ({ label: item, value: item }))}
        />
      </FieldProvider>
      <FieldProvider name="issueType">
        <Dropdown
          value="Issue"
          label="Issue Type"
          onChange={() => {}}
          options={['Issue', 'Task', 'Bug'].map((item) => ({ label: item, value: item }))}
        />
      </FieldProvider>
      <FieldProvider name="flowState">
        <Dropdown
          value="In Progress"
          label="Flow State"
          onChange={() => {}}
          options={['In Progress', 'Done', 'Blocked'].map((item) => ({ label: item, value: item }))}
        />
      </FieldProvider>
      <FieldProvider name="integrationId">
        <Dropdown
          value="ADO Plugin"
          label="Integration ID"
          onChange={() => {}}
          options={['ADO Plugin', 'EMPRPPRT', 'EPM'].map((item) => ({ label: item, value: item }))}
        />
      </FieldProvider>
      <FieldProvider name="state">
        <Dropdown
          value="To Do"
          label="State"
          onChange={() => {}}
          options={['To Do', 'In Progress', 'Done'].map((item) => ({ label: item, value: item }))}
        />
      </FieldProvider>
      <FieldProvider name="ticket">
        <FieldText defaultWidth={false} label="Ticket" placeholder="Enter ticket" />
      </FieldProvider>
    </form>
  );
};

const BTSIssuesModalComponent: FC<BTSIssuesModalProps> = ({
  data,
  handleSubmit,
  invalid,
  dirty,
  reset,
}) => {
  const { formatMessage } = useIntl();

  const onSubmit = (values: Record<string, unknown>) => {
    console.log('Form values:', values);
  };

  const { okButton, cancelButton, hideModal } = useModalButtons({
    okButtonText: 'OK',
    isLoading: false,
    isSubmitButtonDisabled: invalid,
    onSubmit: handleSubmit(onSubmit),
  });

  const [selectedControl, setSelectedControl] = useState(BTSIssueActionTypes.LINK);

  const handleControlChange = (value: BTSIssueActionTypes) => {
    setSelectedControl(value);
    reset();
  };

  if (!data) {
    return null;
  }

  return (
    <Modal
      title={formatMessage(commonMessages.postIssueToBts)}
      onClose={hideModal}
      okButton={okButton}
      cancelButton={cancelButton}
      allowCloseOutside={!dirty}
      scrollable
      className={cx('bts-issues-modal')}
    >
      <div className={cx('bts-controls')}>
        <span className={cx('label')}>{formatMessage(messages.selectAnActionForBTS)}</span>
        <SegmentedControl
          fullWidth
          onChange={handleControlChange}
          options={[
            {
              label: formatMessage(messages.postIssue),
              value: BTSIssueActionTypes.POST,
              selected: selectedControl === BTSIssueActionTypes.POST,
            },
            {
              label: formatMessage(messages.linkIssue),
              value: BTSIssueActionTypes.LINK,
              selected: selectedControl === BTSIssueActionTypes.LINK,
            },
          ]}
        />
      </div>

      {selectedControl === BTSIssueActionTypes.POST && <PostBTSIssueForm />}

      {selectedControl === BTSIssueActionTypes.LINK && <LinkBTSIssueForm />}
    </Modal>
  );
};

export const BTSIssuesModal = withModal(BTS_ISSUES_MODAL)(
  reduxForm({
    form: 'btsIssuesModalForm',
    destroyOnUnmount: true,
  })(BTSIssuesModalComponent),
);
