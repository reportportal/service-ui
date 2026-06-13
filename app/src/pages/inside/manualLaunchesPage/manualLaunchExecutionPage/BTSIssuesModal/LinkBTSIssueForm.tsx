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

import { FC } from 'react';
import { useIntl } from 'react-intl';
import { FieldArray, WrappedFieldArrayProps } from 'redux-form';
import { FieldText, Button, PlusIcon, CloseIcon } from '@reportportal/ui-kit';

import { FieldErrorHint, FieldProvider } from 'components/fields';
import { BtsIntegrationSelector } from 'pages/inside/common/btsIntegrationSelector';
import { createClassnames, uniqueId } from 'common/utils';

import { BTSIntegration, LinkedIssue } from './types';
import { messages } from './messages';

import styles from './LinkBTSIssueForm.scss';

const cx = createClassnames(styles);

interface LinkBTSIssueFormProps {
  namedBtsIntegrations: Record<string, BTSIntegration[]>;
  pluginName: string;
  integrationId: number;
  onChangePlugin: (pluginName: string) => void;
  onChangeIntegration: (integrationId: number) => void;
}

const IssuesList = ({ fields }: WrappedFieldArrayProps<LinkedIssue>) => {
  const { formatMessage } = useIntl();

  return (
    <div className={cx('issues-list')}>
      {fields.map((item, index) => {
        const issueData = fields.get(index);

        return (
          <div key={issueData.id} className={cx('issue-item')}>
            <div className={cx('issue-fields')}>
              <FieldProvider name={`${item}.linkToIssue`}>
                <FieldErrorHint provideHint={false}>
                  <FieldText
                    label={formatMessage(messages.linkToIssue)}
                    placeholder={formatMessage(messages.linkToIssuePlaceholder)}
                    defaultWidth={false}
                    isRequired
                  />
                </FieldErrorHint>
              </FieldProvider>
              <FieldProvider name={`${item}.issueId`}>
                <FieldErrorHint provideHint={false}>
                  <FieldText
                    label={formatMessage(messages.issueId)}
                    placeholder={formatMessage(messages.issueIdPlaceholder)}
                    defaultWidth={false}
                    isRequired
                  />
                </FieldErrorHint>
              </FieldProvider>
            </div>
            {fields.length > 1 && (
              <Button
                variant="ghost"
                type="button"
                icon={<CloseIcon />}
                className={cx('remove-button')}
                onClick={() => fields.remove(index)}
              />
            )}
          </div>
        );
      })}
      <Button
        variant="text"
        type="button"
        onClick={() => fields.push({ id: uniqueId(), linkToIssue: '', issueId: '' })}
        className={cx('add-button')}
        iconPlace="start"
        icon={<PlusIcon />}
      >
        {formatMessage(messages.addNewIssue)}
      </Button>
    </div>
  );
};

export const LinkBTSIssueForm: FC<LinkBTSIssueFormProps> = ({
  namedBtsIntegrations,
  pluginName,
  integrationId,
  onChangePlugin,
  onChangeIntegration,
}) => {
  return (
    <form>
      <BtsIntegrationSelector
        namedBtsIntegrations={namedBtsIntegrations}
        pluginName={pluginName}
        integrationId={integrationId}
        onChangePlugin={onChangePlugin}
        onChangeIntegration={onChangeIntegration}
        theme="light"
      />
      <FieldArray name="linkedIssues" component={IssuesList} />
    </form>
  );
};
