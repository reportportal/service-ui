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
import { useCallback } from 'react';
import { Field, WrappedFieldProps } from 'redux-form';
import { FieldText, FieldTextFlex, FieldLabel } from '@reportportal/ui-kit';
import { useSelector } from 'react-redux';
import { isString } from 'es-toolkit';

import { createClassnames } from 'common/utils';
import { URLS } from 'common/urls';
import { projectKeySelector } from 'controllers/project';
import { FieldProvider, FieldErrorHint } from 'components/fields';
import { AsyncAutocompleteV2 } from 'componentLibrary/autocompletes/asyncAutocompleteV2';
import { FieldElement } from 'pages/inside/projectSettingsPageContainer/content/elements';
import { commonMessages } from 'pages/inside/common/common-messages';
import { LAUNCH_NAME_FILTER_KEY } from 'pages/inside/common/constants';

import { NewLaunchFieldsProps, TestPlanOption } from './types';
import { LAUNCH_FORM_FIELD_NAMES } from './constants';
import { messages } from './messages';
import { AttributeListField } from './attributeListField';

import styles from './launchFormFields.scss';

const cx = createClassnames(styles);

export const NewLaunchFields = ({ hideTestPlanField = false }: NewLaunchFieldsProps) => {
  const { formatMessage } = useIntl();

  const validateLaunchName = useCallback(
    (value: string): string | undefined => {
      const stringValue = isString(value) ? value : '';
      if (!stringValue.trim()) {
        return formatMessage(messages.launchNameRequired);
      }
      return undefined;
    },
    [formatMessage],
  );

  const projectKey = useSelector(projectKeySelector);

  const retrieveTestPlans = (value: string) =>
    URLS.testPlan(
      projectKey,
      value ? { [LAUNCH_NAME_FILTER_KEY]: value, pageSize: 50 } : { pageSize: 50 },
    );

  const makeTestPlanOptions = (response: { content: Array<{ id: number; name: string }> }) =>
    response.content;

  const handleTestPlanChange = (value: unknown, input: { onChange: (value: unknown) => void }) => {
    input.onChange(value);
  };

  const renderTestPlanField = ({ input }: WrappedFieldProps) => (
    <AsyncAutocompleteV2
      value={input.value as TestPlanOption | undefined}
      placeholder={formatMessage(messages.selectTestPlanPlaceholder)}
      getURI={retrieveTestPlans}
      makeOptions={makeTestPlanOptions}
      onChange={(value) => handleTestPlanChange(value, input)}
      parseValueToString={(value: { name?: string }) => value?.name || ''}
      createWithoutConfirmation
      skipOptionCreation
      isDropdownMode
      minLength={0}
    />
  );

  return (
    <>
      <div className={cx('launch-name-field')}>
        <FieldProvider
          name={LAUNCH_FORM_FIELD_NAMES.NAME}
          placeholder={formatMessage(messages.enterLaunchName)}
          validate={validateLaunchName}
        >
          <FieldErrorHint provideHint={false}>
            <FieldText label={formatMessage(messages.launchName)} defaultWidth={false} isRequired />
          </FieldErrorHint>
        </FieldProvider>
      </div>

      <FieldProvider
        name={LAUNCH_FORM_FIELD_NAMES.DESCRIPTION}
        placeholder={formatMessage(messages.addLaunchDescriptionOptional)}
      >
        <FieldTextFlex label={formatMessage(commonMessages.description)} value="" />
      </FieldProvider>

      {!hideTestPlanField && (
        <div className={cx('test-plan-field')}>
          <FieldLabel>{formatMessage(messages.testPlanLabel)}</FieldLabel>
          <Field name={LAUNCH_FORM_FIELD_NAMES.TEST_PLAN} component={renderTestPlanField} />
        </div>
      )}

      <div className={cx('attributes-section')}>
        <FieldElement
          label={formatMessage(messages.launchAttributes)}
          withoutProvider
          childrenClassName={cx('attributes-content')}
        >
          <Field
            name={LAUNCH_FORM_FIELD_NAMES.ATTRIBUTES}
            component={AttributeListField}
            showButton
            newAttrMessage={formatMessage(messages.addAttributes)}
            addButtonClassName={cx('add-attribute-button')}
            maxLength={50}
            editable
            defaultOpen={false}
          />
        </FieldElement>
      </div>
    </>
  );
};
