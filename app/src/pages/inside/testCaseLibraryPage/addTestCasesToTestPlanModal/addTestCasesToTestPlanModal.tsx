import { reduxForm } from 'redux-form';
import { messages } from './messages';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { useIntl } from 'react-intl';
import { AsyncAutocomplete } from 'components/inputs/autocompletes/asyncAutocomplete';
import { URLS } from 'common/urls';
import { useSelector } from 'react-redux';
import { projectKeySelector } from 'controllers/project';
import { useMemo } from 'react';
import classNames from 'classnames/bind';
import { Modal } from '@reportportal/ui-kit';
import styles from './addTestCasesToTestPlanModal.module.scss';
import { LoadingSubmitButton } from 'components/loadingSubmitButton';
import { useAddTestCasesToTestPlan } from './useAddTestCasesToTestPlan';

const cx = classNames.bind(styles) as typeof classNames;

export const ADD_TO_TEST_PLAN_MODAL_KEY = 'addToTestPlanModalKey';

interface TestPlan {
  id: number;
  name: string;
}

export const AddTestCasesToTestPlanModal = reduxForm<
  unknown,
  { selectedTestCases: (number | string)[] }
>({
  form: 'add-to-test-plan-modal-form',
})(({ handleSubmit, selectedTestCases }) => {
  const { formatMessage } = useIntl();

  const projectKey = useSelector(projectKeySelector);

  const {
    isAddTestCasesToTestPlanLoading,
    setSelectedTestPlan,
    selectedTestPlan,
    addTestCasesToTestPlan,
  } = useAddTestCasesToTestPlan({
    selectedTestCases,
  });
  const makeTestPlansOptions = (response: { content: TestPlan[] }) => response.content;

  const description = useMemo(() => {
    return (
      <p className={cx('description')}>
        <span>{formatMessage(messages.descriptionStart)}</span>
        <b className={cx('selected-test-cases')}>{selectedTestCases?.length || 0}</b>
        <span>
          {formatMessage(
            selectedTestCases?.length > 1
              ? messages.addSelectedTestCases
              : messages.addSelectedTestCase,
          )}
        </span>
      </p>
    );
  }, [formatMessage, selectedTestCases?.length]);

  return (
    <Modal
      title={messages.addToTestPlan.defaultMessage}
      onClose={() => {}}
      okButton={{
        children: (
          <LoadingSubmitButton isLoading={isAddTestCasesToTestPlanLoading}>
            {formatMessage(COMMON_LOCALE_KEYS.ADD)}
          </LoadingSubmitButton>
        ),
        onClick: () => {
          handleSubmit(addTestCasesToTestPlan);
        },
        disabled: !selectedTestPlan,
      }}
      cancelButton={{ children: formatMessage(COMMON_LOCALE_KEYS.CANCEL), onClick: () => {} }}
    >
      <div>
        {description}
        <div style={{ position: 'relative' }}>
          <AsyncAutocomplete
            placeholder={formatMessage(messages.selectedTestPlanPlaceholder)}
            getURI={() => URLS.testPlan(projectKey)}
            getRequestParams={() => {}}
            makeOptions={makeTestPlansOptions}
            onChange={setSelectedTestPlan}
            parseValueToString={(value: TestPlan) => value?.name}
            onBlur={setSelectedTestPlan}
            getUniqKey={(value: TestPlan) => value?.id}
            createWithoutConfirmation={true}
          />
        </div>
      </div>
    </Modal>
  );
});
