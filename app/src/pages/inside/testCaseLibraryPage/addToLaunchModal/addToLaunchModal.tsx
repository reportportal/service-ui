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
import { getFormValues, InjectedFormProps, reduxForm, SubmitHandler } from 'redux-form';
import { useIntl } from 'react-intl';
import { FieldLabel, FieldText, FieldTextFlex, Modal } from '@reportportal/ui-kit';

import { AsyncAutocompleteV2 } from 'componentLibrary/autocompletes/asyncAutocompleteV2';
import { LoadingSubmitButton } from 'components/loadingSubmitButton';
import { FieldErrorHint, FieldProvider } from 'components/fields';
import { hideModalAction, withModal } from 'controllers/modal';
import { projectKeySelector } from 'controllers/project';
import { TestPlanDto } from 'controllers/testPlan';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { createClassnames, referenceDictionary } from 'common/utils';
import { URLS } from 'common/urls';
import { LinkItem } from 'layouts/common/appSidebar/helpAndService/linkItem';
import { Launch } from 'pages/inside/manualLaunchesPage/types';

import { useAddToLaunch } from './useAddToLaunch';
import { ButtonSwitcher, ButtonSwitcherOption } from '../../common/buttonSwitcher';
import { AddToLaunchModalProps, AddToLaunchFormData } from './types';
import { messages } from './messages';
import { LaunchAttributes } from './launchAttributes/launchAttributes';

import styles from './addToLaunchModal.scss';

type AddToLaunchSubmitHandler = SubmitHandler<AddToLaunchFormData, AddToLaunchModalProps>;

const cx = createClassnames(styles);

export const ADD_TO_LAUNCH_MODAL_KEY = 'addToLaunchModalKey';
export const ADD_TO_LAUNCH_MODAL_FORM = 'add-to-launch-modal-form';
export const SELECTED_TEST_PLAN_FIELD_NAME = 'selectedTestPlan';
export const SELECTED_LAUNCH_FIELD_NAME = 'selectedLaunch';
export const LAUNCH_NAME_FIELD_NAME = 'launchName';
export const LAUNCH_DESCRIPTION_FIELD_NAME = 'launchDescription';
export const LAUNCH_ATTRIBUTES_FIELD_NAME = 'launchAttributes';

export const AddToLaunchModalComponent = (
  props: AddToLaunchModalProps & InjectedFormProps<AddToLaunchFormData, AddToLaunchModalProps>,
) => {
  const { change, handleSubmit, data, initialize } = props;

  const { testCaseId, testCaseName } = data;
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const formValues = useSelector<null, AddToLaunchFormData>((state) =>
    getFormValues(ADD_TO_LAUNCH_MODAL_FORM)(state),
  );
  const [activeButton, setActiveButton] = useState<ButtonSwitcherOption>();

  const projectKey = useSelector(projectKeySelector);

  const { setSelectedTestPlan, setSelectedLaunch, addToLaunch, isLoading } = useAddToLaunch({
    change,
    testCaseId,
  });

  useEffect(() => {
    initialize({
      selectedLaunch: null,
      selectedTestPlan: null,
      launchDescription: '',
      launchName: '',
      launchAttributes: [],
    });
  }, [initialize, activeButton]);

  const makeTestPlansOptions = (response: { content: TestPlanDto[] }) => response.content;

  const makeLaunchOptions = (response: { content: Launch[] }) => response.content;

  const description = useMemo(
    () =>
      formatMessage(messages.description, {
        testCaseName,
        bold: (value: ReactNode) => <b className={cx('selected-test-cases')}>{value}</b>,
      }),
    [formatMessage, testCaseName],
  );

  const retrieveTestPlans = (value: string) =>
    URLS.testPlan(projectKey, value ? { 'filter.fts.search': value } : {});

  const retrieveLaunches = (value: string) =>
    URLS.manualLaunchesListPagination(
      projectKey,
      value ? { 'filter.eq.name': value, pageSize: 50 } : {},
    );

  const handleActiveButton = useCallback((activeButtonTitle: ButtonSwitcherOption) => {
    setActiveButton(activeButtonTitle);
  }, []);

  const isAddDisabled = useMemo(() => {
    const { selectedLaunch, launchName } = formValues || {};

    return Boolean(activeButton === ButtonSwitcherOption.EXISTING ? !selectedLaunch : !launchName);
  }, [activeButton, formValues]);

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
        onClick: handleSubmit(addToLaunch(activeButton)) as AddToLaunchSubmitHandler,
        disabled: isAddDisabled || isLoading,
      }}
      cancelButton={{
        children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
        onClick: () => dispatch(hideModalAction()),
      }}
    >
      <form onSubmit={handleSubmit(addToLaunch(activeButton)) as AddToLaunchSubmitHandler}>
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
              <p className={cx('launch-name-hint')}>
                {formatMessage(messages.launchNameHint, {
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
                name="launchDescription"
                placeholder={formatMessage(messages.launchDescriptionPlaceholder)}
                className={cx('launch-description-wrapper')}
              >
                <FieldErrorHint provideHint={false}>
                  <FieldTextFlex label={formatMessage(messages.launchDescriptionLabel)} value="" />
                </FieldErrorHint>
              </FieldProvider>
              <div className={cx('autocomplete-wrapper')}>
                <FieldLabel>{formatMessage(COMMON_LOCALE_KEYS.TEST_PLAN_LABEL)}</FieldLabel>
                <AsyncAutocompleteV2
                  placeholder={formatMessage(COMMON_LOCALE_KEYS.SELECT_TEST_PLAN_PLACEHOLDER)}
                  getURI={retrieveTestPlans}
                  makeOptions={makeTestPlansOptions}
                  onChange={setSelectedTestPlan}
                  parseValueToString={(value: TestPlanDto) => value?.name}
                  createWithoutConfirmation
                  skipOptionCreation
                  isDropdownMode
                  minLength={0}
                />
              </div>

              <LaunchAttributes />
            </>
          ) : (
            <>
              <FieldProvider name="launchName" className={cx('launch-name-wrapper')}>
                <FieldErrorHint provideHint={false}>
                  <>
                    <FieldLabel isRequired>{formatMessage(messages.launchNameLabel)}</FieldLabel>
                    <AsyncAutocompleteV2
                      placeholder={formatMessage(messages.launchNameExistingPlaceholder)}
                      getURI={retrieveLaunches}
                      makeOptions={makeLaunchOptions}
                      onChange={setSelectedLaunch}
                      parseValueToString={(value: TestPlanDto) => value?.name}
                      createWithoutConfirmation
                      skipOptionCreation
                      isDropdownMode
                      minLength={0}
                      limitOptions={50}
                      limitationText={formatMessage(messages.tooManyLaunchesResults)}
                    />
                  </>
                </FieldErrorHint>
              </FieldProvider>
            </>
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
    initialValues: {
      selectedLaunch: null,
      launchAttributes: [],
      launchDescription: '',
      launchName: '',
      selectedTestPlan: null,
    },
  })(AddToLaunchModalComponent),
);
