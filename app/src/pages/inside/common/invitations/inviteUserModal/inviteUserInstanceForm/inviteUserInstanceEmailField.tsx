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

import type { ReactNode } from 'react';
import { useIntl } from 'react-intl';
import { createClassnames } from 'common/utils';
import { AsyncAutocompleteV2 } from 'componentLibrary/autocompletes/asyncAutocompleteV2';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { FieldProvider } from 'components/fields/fieldProvider';
import { UserAvatar } from 'pages/inside/common/userAvatar';
import { URLS } from 'common/urls';
import { messages } from 'common/constants/localization/invitationsLocalization';

import type { MessageDescriptor } from 'react-intl';
import styles from './inviteUserInstanceEmailField.scss';


const cx = createClassnames(styles);

interface EmailOption {
  id: number;
  email: string;
}

const USER_SEARCH_LIMIT = 20;
const EMAIL_FILTER_KEY = 'email';
const OPERATION_CNT = 'CNT';

const getRequestParams = (inputValue: string) => ({
  method: 'post' as const,
  data: {
    limit: USER_SEARCH_LIMIT,
    offset: 0,
    sort: 'full_name',
    order: 'ASC',
    search_criteria: [
      {
        filter_key: EMAIL_FILTER_KEY,
        operation: OPERATION_CNT,
        value: (inputValue || '').trim(),
      },
    ],
  },
});

interface InstanceUserSearchItem {
  id?: number;
  email?: string;
}

const makeOptions = (response: { items?: InstanceUserSearchItem[] }): EmailOption[] => {
  const items = response?.items ?? [];
  return items
    .filter((item): item is InstanceUserSearchItem & { id: number; email: string } =>
      Boolean(item?.email && item?.id != null),
    )
    .map((item) => ({ id: item.id, email: item.email }));
};

function parseValueToString(value: string | EmailOption | null): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  return value.email ?? '';
}

function getUniqKey(item: string | EmailOption): string {
  return typeof item === 'string' ? item : String(item.id);
}

type GetItemPropsT<T> = (args: { item: T; index: number }) => Record<string, unknown>;

function renderOption(
  item: EmailOption,
  index: number,
  isNew: boolean,
  getItemProps: GetItemPropsT<string | EmailOption>,
): ReactNode {
  if (isNew) return null;
  const itemProps = getItemProps({ item, index });
  return (
    <li key={getUniqKey(item)} className={cx('option')} {...itemProps}>
      <UserAvatar
        userId={item.id}
        thumbnail
        className={cx('avatar')}
        imageClassName={cx('img')}
      />
      <span className={cx('email')}>{item.email}</span>
    </li>
  );
}

export const InviteUserInstanceEmailField = () => {
  const { formatMessage } = useIntl();
  const placeholder = formatMessage(
    messages.inputPlaceholderInstance as unknown as MessageDescriptor,
  );
  const customEmptyListMessage = formatMessage(
    messages.noMatchesContinueTyping as unknown as MessageDescriptor,
  );
  const label = formatMessage(messages.email as unknown as MessageDescriptor);

  return (
    <FieldProvider name="email">
      <FieldErrorHint provideHint={false}>
        <AsyncAutocompleteV2
          placeholder={placeholder}
          getURI={URLS.searchAllUsers}
          getRequestParams={getRequestParams}
          makeOptions={makeOptions}
          parseValueToString={parseValueToString}
          getUniqKey={getUniqKey}
          renderOption={renderOption}
          createWithoutConfirmation
          minLength={1}
          customEmptyListMessage={customEmptyListMessage}
          inputProps={{ label, autoComplete: 'one-time-code' }}
          isRequired
          useFixedPositioning={false}
        />
      </FieldErrorHint>
    </FieldProvider>
  );
};
