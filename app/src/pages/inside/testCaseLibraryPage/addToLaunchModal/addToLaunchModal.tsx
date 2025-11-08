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

import { ReactNode, useMemo, useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { InjectedFormProps, reduxForm, SubmitHandler } from 'redux-form';
import { useIntl } from 'react-intl';
import { FieldLabel, FieldText, Modal } from '@reportportal/ui-kit';

import { AsyncAutocomplete } from 'componentLibrary/autocompletes/asyncAutocomplete';
import { LoadingSubmitButton } from 'components/loadingSubmitButton';
import { FieldErrorHint, FieldProvider } from 'components/fields';
import { hideModalAction, withModal } from 'controllers/modal';
import { projectKeySelector } from 'controllers/project';
import { TestPlanDto } from 'controllers/testPlan';
import { commonValidators } from 'common/utils/validation';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { createClassnames } from 'common/utils';
import { URLS } from 'common/urls';

import { useAddToLaunch } from './useAddToLaunch';
import { ButtonSwitcher, ButtonSwitcherOption } from '../../common/buttonSwitcher';
import { AddToLaunchModalProps, AddToLaunchFormData } from './types';
import { messages } from './messages';

import styles from './addToLaunchModal.scss';

type AddToLaunchSubmitHandler = SubmitHandler<AddToLaunchFormData, AddToLaunchModalProps>;

const cx = createClassnames(styles);

export const ADD_TO_LAUNCH_MODAL_KEY = 'addToLaunchModalKey';
export const ADD_TO_LAUNCH_MODAL_FORM = 'add-to-launch-modal-form';
export const SELECTED_TEST_PLAN_FIELD_NAME = 'selectedTestPlan';

export const AddToLaunchModalComponent = ({
  change,
  handleSubmit,
  data,
  invalid,
  initialize,
}: AddToLaunchModalProps & InjectedFormProps<AddToLaunchFormData, AddToLaunchModalProps>) => {
  const { testCaseName } = data;
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const [activeButton, setActiveButton] = useState<ButtonSwitcherOption>();

  const projectKey = useSelector(projectKeySelector);

  const { setSelectedTestPlan, addToLaunch } = useAddToLaunch({
    change,
  });

  useEffect(() => {
    initialize({
      launchName: '',
    });
  }, [initialize, activeButton]);

  const makeTestPlansOptions = (response: { content: TestPlanDto[] }) => response.content;

  const description = useMemo(
    () =>
      formatMessage(messages.description, {
        testCaseName,
        bold: (value: ReactNode) => <b className={cx('selected-test-cases')}>{value}</b>,
      }),
    [formatMessage, testCaseName],
  );

  const retrieveTestPlans = (value: string) =>
    `${URLS.testPlan(projectKey)}?filter.fts.search=${value}`;

  const handleActiveButton = useCallback((activeButtonTitle: ButtonSwitcherOption) => {
    setActiveButton(activeButtonTitle);
  }, []);

  return (
    <Modal
      title={formatMessage(COMMON_LOCALE_KEYS.ADD_TO_LAUNCH)}
      onClose={() => dispatch(hideModalAction())}
      okButton={{
        children: (
          <LoadingSubmitButton isLoading={false}>
            {formatMessage(COMMON_LOCALE_KEYS.ADD)}
          </LoadingSubmitButton>
        ),
        type: 'submit',
        onClick: handleSubmit(addToLaunch) as AddToLaunchSubmitHandler,
        disabled: invalid,
      }}
      cancelButton={{
        children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
        onClick: () => dispatch(hideModalAction()),
      }}
    >
      <form onSubmit={handleSubmit(addToLaunch) as AddToLaunchSubmitHandler}>
        <div>
          <ButtonSwitcher
            description={description}
            createNewButtonTitle={formatMessage(messages.createNewLaunchButton)}
            existingButtonTitle={formatMessage(messages.addToLaunchButton)}
            handleActiveButton={handleActiveButton}
          />
          {activeButton === ButtonSwitcherOption.NEW ? (
            <>
              <FieldProvider
                name="launchName"
                placeholder={formatMessage(messages.launchNamePlaceholder)}
                className={cx('launch-name-wrapper')}
              >
                <FieldErrorHint provideHint={false}>
                  <FieldText
                    label={formatMessage(messages.launchNameLabel)}
                    defaultWidth={false}
                    isRequired
                  />
                </FieldErrorHint>
              </FieldProvider>
              <div className={cx('autocomplete-wrapper')}>
                <FieldLabel>{formatMessage(COMMON_LOCALE_KEYS.TEST_PLAN_LABEL)}</FieldLabel>
                <AsyncAutocomplete
                  placeholder={formatMessage(COMMON_LOCALE_KEYS.SELECT_TEST_PLAN_PLACEHOLDER)}
                  getURI={retrieveTestPlans}
                  makeOptions={makeTestPlansOptions}
                  onChange={setSelectedTestPlan}
                  parseValueToString={(value: TestPlanDto) => value?.name}
                  createWithoutConfirmation
                  skipOptionCreation
                />
              </div>
            </>
          ) : (
            <FieldProvider name="launchName" className={cx('launch-name-wrapper')}>
              <FieldErrorHint provideHint={false}>
                <>
                  <FieldLabel isRequired>{formatMessage(messages.launchNameLabel)}</FieldLabel>
                  <AsyncAutocomplete
                    placeholder={formatMessage(messages.launchNameExistingPlaceholder)}
                    getURI={retrieveTestPlans}
                    makeOptions={makeTestPlansOptions}
                    onChange={setSelectedTestPlan}
                    parseValueToString={(value: TestPlanDto) => value?.name}
                    createWithoutConfirmation
                    skipOptionCreation
                  />
                </>
              </FieldErrorHint>
            </FieldProvider>
          )}
        </div>
      </form>
    </Modal>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const AddToLaunchModal = withModal(ADD_TO_LAUNCH_MODAL_KEY)(
  reduxForm<AddToLaunchFormData, AddToLaunchModalProps>({
    form: ADD_TO_LAUNCH_MODAL_FORM,
    destroyOnUnmount: true,
    shouldValidate: () => true,
    initialValues: { launchName: '' },
    validate: ({ launchName }) => ({
      launchName: commonValidators.requiredField(launchName),
    }),
  })(AddToLaunchModalComponent),
);
