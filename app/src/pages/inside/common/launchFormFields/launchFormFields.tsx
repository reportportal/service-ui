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
import { Field, WrappedFieldProps } from 'redux-form';
import { FieldText, FieldTextFlex, FieldLabel } from '@reportportal/ui-kit';
import { noop } from 'es-toolkit';
import { ChangeEvent, useMemo, ReactNode } from 'react';
import { useSelector } from 'react-redux';

import { createClassnames } from 'common/utils';
import { URLS } from 'common/urls';
import { projectKeySelector } from 'controllers/project';
import { FieldProvider, FieldErrorHint } from 'components/fields';
import { EditableAttributeList } from 'componentLibrary/attributeList/editableAttributeList';
import { AsyncAutocompleteV2 } from 'componentLibrary/autocompletes/asyncAutocompleteV2';
import { FieldElement } from 'pages/inside/projectSettingsPageContainer/content/elements';
import { commonMessages } from 'pages/inside/common/common-messages';
import { referenceDictionary } from 'common/utils/referenceDictionary';
import { LinkItem } from 'layouts/common/appSidebar/helpAndService/linkItem';
import { ButtonSwitcher } from 'pages/inside/common/buttonSwitcher';
import { InputCheckbox } from 'components/inputs/inputCheckbox';

import { LaunchFormFieldsProps, LaunchMode } from './types';
import { LAUNCH_FORM_FIELD_NAMES } from './constants';
import { messages } from './messages';

import styles from './launchFormFields.scss';

const cx = createClassnames(styles);

interface AttributeListFieldProps {
  input: {
    value: unknown[];
    onChange: (value: unknown[]) => void;
  };
  newAttrMessage?: string;
  maxLength?: number;
  showButton?: boolean;
  editable?: boolean;
  defaultOpen?: boolean;
  [key: string]: unknown;
}

const AttributeListField = ({
  input,
  newAttrMessage,
  maxLength,
  showButton,
  editable,
  defaultOpen,
  ...rest
}: AttributeListFieldProps) => (
  <EditableAttributeList
    attributes={input.value || []}
    onChange={input.onChange}
    disabled={false}
    customClass=""
    newAttrMessage={newAttrMessage || ''}
    maxLength={maxLength || 50}
    showButton={showButton !== undefined ? showButton : true}
    editable={editable !== undefined ? editable : true}
    defaultOpen={defaultOpen !== undefined ? defaultOpen : false}
    {...rest}
  />
);

interface CheckboxFieldProps {
  input: {
    value: boolean;
    onChange: (value: boolean) => void;
  };
  label?: string;
}

const CheckboxField = ({ input, label }: CheckboxFieldProps) => {
  const checked = Boolean(input.value);

  return (
    <InputCheckbox
      value={checked}
      onChange={(e: ChangeEvent<HTMLInputElement>) => input.onChange(e.target.checked)}
    >
      {label}
    </InputCheckbox>
  );
};

export const LaunchFormFields = ({
  testPlanName,
  activeMode = LaunchMode.NEW,
  onModeChange,
  onLaunchSelect,
  description,
}: LaunchFormFieldsProps) => {
  const { formatMessage } = useIntl();
  const projectKey = useSelector(projectKeySelector);

  const isExistingMode = activeMode === LaunchMode.EXISTING;

  const retrieveLaunches = (value: string) =>
    URLS.manualLaunchesListPagination(
      projectKey,
      value ? { 'filter.eq.name': value, pageSize: 50 } : {},
    );

  const makeLaunchOptions = (response: { content: Array<{ id: number; name: string }> }) =>
    response.content;

  const defaultDescription = useMemo(() => {
    return formatMessage(messages.addTestCasesFromTestPlan, {
      testPlanName: testPlanName || '',
      bold: (value: ReactNode) => <b className={cx('test-plan-name')}>{value}</b>,
    });
  }, [testPlanName, formatMessage]);

  const handleModeChange = (mode: string) => {
    if (onModeChange) {
      onModeChange(mode as LaunchMode);
    }
  };

  return (
    <>
      <ButtonSwitcher
        description={description || defaultDescription}
        createNewButtonTitle={formatMessage(messages.createNewLaunch)}
        existingButtonTitle={formatMessage(messages.addToExistingLaunch)}
        handleActiveButton={handleModeChange}
      />

      <div className={cx('uncovered-tests-checkbox')}>
        <Field
          name={LAUNCH_FORM_FIELD_NAMES.UNCOVERED_TESTS_ONLY}
          component={CheckboxField}
          label={formatMessage(messages.addOnlyUncoveredTestCases)}
        />
      </div>

      {isExistingMode ? (
        <div className={cx('launch-name-field')}>
          <FieldLabel isRequired>{formatMessage(messages.launchName)}</FieldLabel>
          <Field
            name={LAUNCH_FORM_FIELD_NAMES.NAME}
            component={({ input }: WrappedFieldProps) => (
              <AsyncAutocompleteV2
                {...input}
                placeholder={formatMessage(messages.searchAndSelectLaunch)}
                getURI={retrieveLaunches}
                makeOptions={makeLaunchOptions}
                onChange={(value) => {
                  input.onChange(value);
                  if (onLaunchSelect) {
                    onLaunchSelect(value as { id: number; name: string } | null);
                  }
                }}
                parseValueToString={(value: { name?: string }) => value?.name || ''}
                createWithoutConfirmation
                skipOptionCreation
                isDropdownMode
                minLength={0}
                limitOptions={50}
                limitationText={formatMessage(messages.tooManyLaunchesResult)}
              />
            )}
          />
        </div>
      ) : (
        <>
          <div className={cx('launch-name-field')}>
            <FieldProvider
              name={LAUNCH_FORM_FIELD_NAMES.NAME}
              placeholder={formatMessage(messages.searchAndSelectLaunch)}
            >
              <FieldErrorHint provideHint={false}>
                <FieldText
                  label={formatMessage(messages.launchName)}
                  defaultWidth={false}
                  isRequired
                />
              </FieldErrorHint>
            </FieldProvider>
          </div>

          <p className={cx('launch-name-hint')}>
            {formatMessage(messages.existingLaunchHint, {
              learnMoreLink: (
                <LinkItem
                  icon={null}
                  isInternal={false}
                  className={cx('launch-name-hint-link')}
                  link={referenceDictionary.rpDoc}
                  content={formatMessage(messages.learnMore)}
                />
              ),
            })}
          </p>

          <FieldProvider
            name={LAUNCH_FORM_FIELD_NAMES.DESCRIPTION}
            placeholder={formatMessage(messages.addLaunchDescriptionOptional)}
          >
            <FieldTextFlex label={formatMessage(commonMessages.description)} value="" />
          </FieldProvider>

          <div className={cx('test-plan-field')}>
            <FieldLabel>{formatMessage(messages.testPlanLabel)}</FieldLabel>
            <AsyncAutocompleteV2
              placeholder={formatMessage(messages.selectTestPlanPlaceholder)}
              getURI={URLS.testPlan}
              onChange={noop}
              parseValueToString={(value: { name?: string }) => value?.name || ''}
              value={testPlanName ? { name: testPlanName } : undefined}
              disabled
              createWithoutConfirmation
              skipOptionCreation
              isDropdownMode
              minLength={0}
            />
          </div>

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
      )}
    </>
  );
};
