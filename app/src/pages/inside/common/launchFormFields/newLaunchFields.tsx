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
import { Field } from 'redux-form';
import { FieldText, FieldTextFlex, FieldLabel } from '@reportportal/ui-kit';
import { useSelector } from 'react-redux';

import { createClassnames } from 'common/utils';
import { URLS } from 'common/urls';
import { projectKeySelector } from 'controllers/project';
import { FieldProvider, FieldErrorHint } from 'components/fields';
import { AsyncAutocompleteV2 } from 'componentLibrary/autocompletes/asyncAutocompleteV2';
import { FieldElement } from 'pages/inside/projectSettingsPageContainer/content/elements';
import { commonMessages } from 'pages/inside/common/common-messages';
import { referenceDictionary } from 'common/utils/referenceDictionary';
import { LinkItem } from 'layouts/common/appSidebar/helpAndService/linkItem';

import { NewLaunchFieldsProps, TestPlanOption } from './types';
import { LAUNCH_FORM_FIELD_NAMES } from './constants';
import { messages } from './messages';
import { AttributeListField } from './attributeListField';

import styles from './launchFormFields.scss';

const cx = createClassnames(styles);

export const NewLaunchFields = ({
  testPlanName,
  isTestPlanFieldDisabled = true,
  onTestPlanChange,
}: NewLaunchFieldsProps) => {
  const { formatMessage } = useIntl();
  const projectKey = useSelector(projectKeySelector);

  const testPlanValue: { name: string } | null = testPlanName ? { name: testPlanName } : null;

  const retrieveTestPlans = (value: string) =>
    URLS.testPlan(projectKey, value ? { 'filter.fts.search': value } : {});

  const makeTestPlanOptions = (response: { content: Array<{ id: number; name: string }> }) =>
    response.content;

  const handleTestPlanChange = (value: unknown) => {
    if (!isTestPlanFieldDisabled && onTestPlanChange) {
      onTestPlanChange(value as TestPlanOption | null);
    }
  };

  return (
    <>
      <div className={cx('launch-name-field')}>
        <FieldProvider
          name={LAUNCH_FORM_FIELD_NAMES.NAME}
          placeholder={formatMessage(messages.searchAndSelectLaunch)}
        >
          <FieldErrorHint provideHint={false}>
            <FieldText label={formatMessage(messages.launchName)} defaultWidth={false} isRequired />
          </FieldErrorHint>
        </FieldProvider>
      </div>

      <p className={cx('launch-name-hint')}>
        {formatMessage(messages.existingLaunchHint, {
          learnMoreLink: (
            <span className={cx('launch-name-hint-link')}>
              <LinkItem
                icon={null}
                isInternal={false}
                link={referenceDictionary.rpDoc}
                content={formatMessage(messages.learnMore)}
              />
            </span>
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
          getURI={retrieveTestPlans}
          makeOptions={makeTestPlanOptions}
          onChange={handleTestPlanChange}
          parseValueToString={(value: { name?: string }) => value?.name || ''}
          value={testPlanValue}
          disabled={Boolean(isTestPlanFieldDisabled)}
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
  );
};
