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

import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { change } from 'redux-form';
import { FieldText } from '@reportportal/ui-kit';
import FieldErrorHint from 'components/fields/fieldErrorHint';
import { FieldElement } from 'pages/inside/projectSettingsPageContainer/content/elements';
import { messages } from 'common/constants/localization/invitationsLocalization';
import styles from './inviteUserEmailField.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles) as typeof classNames;

interface InviteUserEmailFieldProps {
  formName: string;
}

export const InviteUserEmailField = ({ formName }: InviteUserEmailFieldProps) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();

  const handleClear = () => {
    dispatch(change(formName, 'email', ''));
  };

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
        />
      </FieldErrorHint>
    </FieldElement>
  );
};
