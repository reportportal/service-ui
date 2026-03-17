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

import { useCallback, useRef } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { change } from 'redux-form';
import { FieldText } from '@reportportal/ui-kit';

import { createClassnames, fetch } from 'common/utils';
import { email as isValidEmail } from 'common/utils/validation/validate';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { FieldElement } from 'pages/inside/projectSettingsPageContainer/content/elements';
import { messages } from 'common/constants/localization/invitationsLocalization';
import { URLS } from 'common/urls';

import styles from './inviteUserEmailField.scss';

const cx = createClassnames(styles);

interface UserSearchItem {
  id?: number;
  email?: string;
}

interface UserSearchResponse {
  items?: UserSearchItem[];
}

interface InviteUserEmailFieldProps {
  formName: string;
  onUserSelect?: (userId: number | null) => void;
}

export const InviteUserEmailField = ({ formName, onUserSelect }: InviteUserEmailFieldProps) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const emailValueRef = useRef<string>('');
  const lookupIdRef = useRef(0);

  const handleClear = useCallback(() => {
    dispatch(change(formName, 'email', ''));
    emailValueRef.current = '';
    lookupIdRef.current += 1;
    onUserSelect?.(null);
  }, [dispatch, formName, onUserSelect]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    emailValueRef.current = e.target.value ?? '';
  }, []);

  const handleBlur = useCallback(
    () => {
      const email = emailValueRef.current.trim();
      const lookupId = (lookupIdRef.current += 1);

      if (!email || isValidEmail(email) !== true) {
        onUserSelect?.(null);
        return;
      }

      fetch(URLS.searchAllUsers(), {
        method: 'post',
        data: {
          limit: 1,
          search_criteria: [{ filter_key: 'email', operation: 'EQ', value: email }],
        },
      })
        .then((response: UserSearchResponse) => {
          if (lookupId !== lookupIdRef.current || emailValueRef.current.trim() !== email) {
            return;
          }
          const user = response.items?.[0];
          onUserSelect?.(user?.id ?? null);
        })
        .catch(() => {
          if (lookupId === lookupIdRef.current && emailValueRef.current.trim() === email) {
            onUserSelect?.(null);
          }
        });
    },
    [onUserSelect],
  );

  return (
    <FieldElement name="email" className={cx('email')}>
      <FieldErrorHint provideHint={false}>
        <FieldText
          maxLength={128}
          placeholder={formatMessage(messages.inputPlaceholder)}
          defaultWidth={false}
          label={formatMessage(messages.email)}
          type="email"
          clearable
          onClear={handleClear}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </FieldErrorHint>
    </FieldElement>
  );
};
