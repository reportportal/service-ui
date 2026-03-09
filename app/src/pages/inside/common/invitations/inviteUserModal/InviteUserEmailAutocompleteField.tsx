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

import { useCallback, useRef } from 'react';
import type { MutableRefObject, ReactNode } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { createClassnames } from 'common/utils';
import { AsyncAutocompleteV2 } from 'componentLibrary/autocompletes/asyncAutocompleteV2';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { FieldProvider } from 'components/fields/fieldProvider';
import { UserAvatar } from 'pages/inside/common/userAvatar';
import { URLS } from 'common/urls';
import { messages as invitationsMessages } from 'common/constants/localization/invitationsLocalization';
import { email as emailValidator } from 'common/utils/validation/validate';
import { MailIcon } from '@reportportal/ui-kit';
import { MessageDescriptorMap } from 'types/intl';
import styles from './InviteUserEmailAutocompleteField.scss';

const messages = invitationsMessages as MessageDescriptorMap;

const cx = createClassnames(styles);

interface EmailOption {
  id: number | string;
  email: string;
  fullName: string;
  isCustom?: boolean;
}

const USER_SEARCH_LIMIT = 20;
const EMAIL_FILTER_KEY = 'email';
const OPERATION_CNT = 'CNT';
const CUSTOM_INVITE_ID = '__custom_email__';

const isValidEmail = (value: string): boolean => {
  return emailValidator((value || '').trim()) === true;
};

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
  full_name?: string;
}

const makeBaseOptions = (response: { items?: InstanceUserSearchItem[] }): EmailOption[] => {
  const items = response?.items ?? [];
  return items
    .filter((item): item is InstanceUserSearchItem & { id: number; email: string } =>
      Boolean(item?.email && item?.id != null),
    )
    .map((item) => ({
      id: item.id,
      email: item.email,
      fullName: item.full_name ?? '',
    }));
};

function parseValueToString(value: string | EmailOption | null): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  return value.email ?? '';
}

function getUniqKey(item: string | EmailOption): string {
  if (typeof item === 'string') return item;
  return String(item.id);
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

  if (item.isCustom) {
    return (
      <li key={getUniqKey(item)} className={cx('option')} {...itemProps}>
        <div className={cx('avatar')}>
          <MailIcon />
        </div>
        <div className={cx('info')}>
          <span className={cx('name')}>
            <FormattedMessage
              id="InviteUserEmailAutocompleteField.sendNewInviteViaEmail"
              defaultMessage="Send new invite via email"
            />
          </span>
          <span className={cx('email')}>{item.email}</span>
        </div>
      </li>
    );
  }

  return (
    <li key={getUniqKey(item)} className={cx('option')} {...itemProps}>
      <UserAvatar
        userId={item.id as number}
        thumbnail
        className={cx('avatar')}
        imageClassName={cx('img')}
      />
      <div className={cx('info')}>
        <span className={cx('name')}>{item.fullName}</span>
        <span className={cx('email')}>{item.email}</span>
      </div>
    </li>
  );
}

const InviteUserEmailAutocompleteFieldContent = ({
  inputValueRef,
  ...rest
}: {
  inputValueRef: MutableRefObject<string>;
  [key: string]: unknown;
}) => {
  const { formatMessage } = useIntl();

  const customGetRequestParams = useCallback((inputValue: string) => {
    inputValueRef.current = inputValue;
    return getRequestParams(inputValue);
  }, [inputValueRef]);

  const makeOptions = useCallback((response: { items?: InstanceUserSearchItem[] }): EmailOption[] => {
    const baseOptions = makeBaseOptions(response);
    const inputValue = inputValueRef.current;

    if (baseOptions.length === 0 && isValidEmail(inputValue)) {
      return [
        {
          id: CUSTOM_INVITE_ID,
          email: inputValue.trim(),
          fullName: '',
          isCustom: true,
        },
      ];
    }

    return baseOptions;
  }, [inputValueRef]);

  const placeholder = formatMessage(messages.inputPlaceholderInstance);
  const customEmptyListMessage = formatMessage(messages.noMatchesContinueTyping);
  const label = formatMessage(messages.email);

  return (
    <AsyncAutocompleteV2
      placeholder={placeholder}
      getURI={URLS.searchAllUsers}
      getRequestParams={customGetRequestParams}
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
      {...rest}
    />
  );
};

export const InviteUserEmailAutocompleteField = () => {
  const inputValueRef = useRef('');

  return (
    <FieldProvider name="email">
      <FieldErrorHint provideHint={false}>
        <InviteUserEmailAutocompleteFieldContent inputValueRef={inputValueRef} />
      </FieldErrorHint>
    </FieldProvider>
  );
};
