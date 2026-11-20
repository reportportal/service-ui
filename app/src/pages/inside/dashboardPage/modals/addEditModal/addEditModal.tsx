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

import { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useTracking } from 'react-tracking';
import { useDispatch } from 'react-redux';
import { InjectedFormProps, reduxForm } from 'redux-form';
import { FieldText, FieldTextFlex, Modal } from '@reportportal/ui-kit';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { createClassnames } from 'common/utils';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { FieldProvider } from 'components/fields/fieldProvider';
import { DASHBOARD_EVENTS } from 'analyticsEvents/dashboardsPageEvents';
import { Validator } from 'common/utils/validation/types';
import { bindMessageToValidator, composeBoundValidators, validate } from 'common/utils/validation';
import { hideModalAction } from 'controllers/modal';
import { DashboardItem } from '../../types';
import styles from './addEditModal.scss';

const cx = createClassnames(styles);

const messages = defineMessages({
  dashboardNamePlaceholder: {
    id: 'DashboardForm.dashboardNamePlaceholder',
    defaultMessage: 'Enter dashboard name',
  },
  dashboardNameLabel: {
    id: 'DashboardForm.dashboardNameLabel',
    defaultMessage: 'Name',
  },
  dashboardDescriptionPlaceholder: {
    id: 'DashboardForm.dashboardDescriptionPlaceholder',
    defaultMessage: 'Enter dashboard description',
  },
  dashboardDescriptionLabel: {
    id: 'DashboardForm.dashboardDescriptionLabel',
    defaultMessage: 'Description',
  },
  editModalTitle: {
    id: 'DashboardForm.editModalTitle',
    defaultMessage: 'Edit Dashboard',
  },
  addModalTitle: {
    id: 'DashboardForm.addModalTitle',
    defaultMessage: 'Create Dashboard',
  },
  duplicateModalTitle: {
    id: 'DashboardForm.duplicateModalTitle',
    defaultMessage: 'Duplicate Dashboard',
  },
  configurationTitle: {
    id: 'DashboardForm.configurationTitle',
    defaultMessage: 'Configuration',
  },
  pasteConfiguration: {
    id: 'DashboardForm.pasteConfiguration',
    defaultMessage: 'Paste configuration',
  },
  pasteConfigHint: {
    id: 'DashboardForm.pasteConfigHint',
    defaultMessage: `Paste a configuration string here to clone widgets from the existing dashboard. To get the string, use the “Copy configuration” option from an existing dashboard's menu. All widgets and filters will be included.`,
  },
  showDashboardConfiguration: {
    id: 'DashboardForm.showDashboardConfiguration',
    defaultMessage: 'Show dashboard configuration',
  },
  nameHint: {
    id: 'DashboardForm.nameHint',
    defaultMessage: 'Dashboard name must be between 3 and 128 characters long, including spaces.',
  },
});

const NAME_FIELD = 'name';
const DESCRIPTION_FIELD = 'description';
const CONFIGURATION_FIELD = 'configuration';

const NAME_MAX_LENGTH = 128;
const DESCRIPTION_MAX_LENGTH = 1500;

interface AddEditDashboardFormValues {
  name?: string;
  description?: string;
  configuration?: string;
  id?: number;
}

interface PreconfiguredDashboardSubmitPayload {
  name?: string;
  description?: string;
  config: string;
  onSuccess: () => void;
  onError: () => void;
}

type DashboardSubmitHandler = (
  payload: AddEditDashboardFormValues | PreconfiguredDashboardSubmitPayload,
  isPreconfigured?: boolean,
) => void;

export interface AddEditModalProps {
  dashboardItem?: DashboardItem;
  onSubmit?: DashboardSubmitHandler;
  type?: 'add' | 'edit' | 'duplicate';
}

type AddEditModalFormProps = AddEditModalProps & {
  dashboardItems?: DashboardItem[];
};

interface AddEditModalComponentProps
  extends AddEditModalProps, InjectedFormProps<AddEditDashboardFormValues, AddEditModalFormProps> {}

const createDashboardNameValidator =
  (dashboardItems: DashboardItem[], dashboardItem?: DashboardItem) =>
  (name?: string): string | undefined =>
    composeBoundValidators([
      bindMessageToValidator(validate.dashboardName as Validator, 'dashboardNameHint'),
      bindMessageToValidator(
        validate.createDashboardNameUniqueValidator(dashboardItems, dashboardItem) as Validator,
        'dashboardNameExistsHint',
      ),
    ])(name) as string | undefined;

const AddEditModalComponent = ({
  dashboardItem,
  onSubmit,
  type = 'add' as const,
  dirty,
  invalid,
  handleSubmit,
  initialize,
}: AddEditModalComponentProps) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAddModal = type !== 'edit' && type !== 'duplicate';

  useEffect(() => {
    initialize(dashboardItem ?? {});
  }, [dashboardItem, initialize]);

  const handleTrackSuccess = (dashboardId: number | undefined, isChangedDescription: boolean) => {
    trackEvent(
      DASHBOARD_EVENTS.clickOnButtonInModalAddNewDashboard(
        dashboardId,
        isChangedDescription,
        'successfully_created',
      ),
    );
  };

  const handleTrackError = (dashboardId: number | undefined, isChangedDescription: boolean) => {
    setIsSubmitting(false);
    trackEvent(
      DASHBOARD_EVENTS.clickOnButtonInModalAddNewDashboard(
        dashboardId,
        isChangedDescription,
        'cannot_be_created',
      ),
    );
  };

  const getTrackingEvent = (dashboardId: number | undefined, isChangedDescription: boolean) => {
    switch (type) {
      case 'edit':
        return DASHBOARD_EVENTS.clickOnButtonUpdateInModalEditDashboard(
          dashboardId,
          isChangedDescription,
        );
      case 'duplicate':
        return DASHBOARD_EVENTS.clickOnBtnInModalDuplicateDashboard(
          dashboardId,
          isChangedDescription,
        );
      default:
        return DASHBOARD_EVENTS.clickOnButtonInModalAddNewDashboard(
          dashboardId,
          isChangedDescription,
        );
    }
  };

  const submitFormAndCloseModal = (formData: AddEditDashboardFormValues) => {
    if (type === 'duplicate' || dirty) {
      const dashboardId = dashboardItem?.id;
      const isChangedDescription = formData.description !== dashboardItem?.description;

      if (!formData.configuration) {
        trackEvent(getTrackingEvent(dashboardId, isChangedDescription));
        onSubmit?.(formData);
      } else if (!isSubmitting) {
        setIsSubmitting(true);

        onSubmit?.(
          {
            name: formData.name,
            description: formData.description,
            config: formData.configuration,
            onSuccess: () => handleTrackSuccess(dashboardId, isChangedDescription),
            onError: () => handleTrackError(dashboardId, isChangedDescription),
          },
          true,
        );
      }
    } else {
      dispatch(hideModalAction());
    }
  };

  const getModalTexts = () => {
    switch (type) {
      case 'edit':
        return {
          title: formatMessage(messages.editModalTitle),
          submitText: formatMessage(COMMON_LOCALE_KEYS.SAVE),
        };
      case 'duplicate':
        return {
          title: formatMessage(messages.duplicateModalTitle),
          submitText: formatMessage(COMMON_LOCALE_KEYS.DUPLICATE),
        };
      default:
        return {
          title: formatMessage(messages.addModalTitle),
          submitText: formatMessage(COMMON_LOCALE_KEYS.CREATE),
        };
    }
  };

  const { title, submitText } = getModalTexts();

  const okButton = {
    children: submitText,
    onClick: handleSubmit(submitFormAndCloseModal),
    disabled: invalid,
    'data-automation-id': 'submitButton',
  };

  const cancelButton = {
    children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    'data-automation-id': 'cancelButton',
  };

  return (
    <Modal
      title={title}
      okButton={okButton}
      cancelButton={cancelButton}
      onClose={() => dispatch(hideModalAction())}
      allowCloseOutside={!dirty}
      scrollable
    >
      <form className={cx('add-dashboard-form')}>
        <FieldProvider name={NAME_FIELD}>
          <FieldErrorHint provideHint={false}>
            <FieldText
              label={formatMessage(messages.dashboardNameLabel)}
              placeholder={formatMessage(messages.dashboardNamePlaceholder)}
              helpText={formatMessage(messages.nameHint)}
              defaultWidth={false}
              maxLength={NAME_MAX_LENGTH}
              maxLengthDisplay={NAME_MAX_LENGTH}
              isRequired
            />
          </FieldErrorHint>
        </FieldProvider>
        <FieldProvider name={DESCRIPTION_FIELD}>
          <FieldErrorHint provideHint={false}>
            <FieldTextFlex
              label={formatMessage(messages.dashboardDescriptionLabel)}
              placeholder={formatMessage(messages.dashboardDescriptionPlaceholder)}
              maxLength={DESCRIPTION_MAX_LENGTH}
              maxLengthDisplay={DESCRIPTION_MAX_LENGTH}
            />
          </FieldErrorHint>
        </FieldProvider>

        {isAddModal && (
          <FieldProvider name={CONFIGURATION_FIELD}>
            <FieldErrorHint provideHint={false}>
              <FieldTextFlex
                label={formatMessage(messages.configurationTitle)}
                placeholder={formatMessage(messages.pasteConfiguration)}
                maxLength={null}
                helpText={formatMessage(messages.pasteConfigHint)}
              />
            </FieldErrorHint>
          </FieldProvider>
        )}
      </form>
    </Modal>
  );
};

export const AddEditModal = reduxForm<AddEditDashboardFormValues, AddEditModalFormProps>({
  form: 'addEditDashboard',
  validate: ({ name }, { dashboardItems = [], dashboardItem }) => ({
    name: createDashboardNameValidator(dashboardItems, dashboardItem)(name),
  }),
})(AddEditModalComponent);
