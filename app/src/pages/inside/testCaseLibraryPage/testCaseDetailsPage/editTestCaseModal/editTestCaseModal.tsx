import { MouseEventHandler } from 'react';
import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import { InjectedFormProps, reduxForm } from 'redux-form';
import classNames from 'classnames/bind';
import { FieldText, Modal } from '@reportportal/ui-kit';
import { hideModalAction, withModal } from 'controllers/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { commonValidators } from 'common/utils/validation';
import { FieldProvider } from 'components/fields';
import { useUpdateTestCase } from './useUpdateTestCase';
import { messages } from '../messages';
import { PrioritySelect } from '../../prioritySelect/prioritySelect';
import styles from './editTestCaseModal.scss';

export const EDIT_TEST_CASE_MODAL_KEY = 'editTestCaseModalKey';

const cx = classNames.bind(styles) as typeof classNames;

interface FormData {
  name: string;
  priority: string;
  testFolderId: number;
}

interface EditTestCaseModalProps {
  data: {
    initialValues: FormData;
    testCaseId: number;
  };
}

const EditTestCaseModal = ({
  handleSubmit,
  pristine,
  invalid,
  data: { testCaseId },
}: InjectedFormProps<FormData> & EditTestCaseModalProps) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const { updateTestCase, isUpdateTestCaseLoading } = useUpdateTestCase();

  const hideModal = () => dispatch(hideModalAction());
  const handleUpdate = (formData: FormData) => updateTestCase(testCaseId, formData);

  const okButton = {
    children: formatMessage(COMMON_LOCALE_KEYS.SAVE),
    onClick: handleSubmit(handleUpdate) as unknown as MouseEventHandler<HTMLButtonElement>,
    disabled: pristine || invalid || isUpdateTestCaseLoading,
  };

  const cancelButton = {
    children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    onClick: hideModal,
  };

  return (
    <Modal
      title={formatMessage(messages.editTestCase)}
      okButton={okButton}
      cancelButton={cancelButton}
      onClose={hideModal}
    >
      <form>
        <FieldProvider name="name" placeholder={formatMessage(messages.enterTestCaseName)}>
          <FieldText label={formatMessage(messages.testCaseName)} defaultWidth={false} isRequired />
        </FieldProvider>

        <div className={cx('priority-select')}>
          <FieldProvider name="priority">
            <PrioritySelect />
          </FieldProvider>
        </div>
      </form>
    </Modal>
  );
};

const FormHOC = reduxForm({
  form: 'edit-test-case-form',
  enableReinitialize: true,
  shouldValidate: () => true,
  validate: ({ name }: { name: string }) => ({
    name: commonValidators.requiredField(name),
  }),
})(EditTestCaseModal);

export default withModal(EDIT_TEST_CASE_MODAL_KEY)((props: EditTestCaseModalProps) => (
  <FormHOC {...props} initialValues={props.data?.initialValues} />
));
