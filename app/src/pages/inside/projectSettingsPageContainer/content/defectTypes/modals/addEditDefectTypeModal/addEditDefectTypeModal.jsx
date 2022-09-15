/*
 * Copyright 2022 EPAM Systems
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

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { reduxForm } from 'redux-form';
import { useDispatch } from 'react-redux';
import className from 'classnames/bind';
import { defineMessages, useIntl } from 'react-intl';
import { withModal } from 'components/main/modal';
import { ModalLayout } from 'componentLibrary/modal';
import { FieldProvider } from 'components/fields/fieldProvider';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { validate, bindMessageToValidator, composeBoundValidators } from 'common/utils/validation';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { Dropdown } from 'componentLibrary/dropdown';
import { hideModalAction } from 'controllers/modal';
import { FieldText } from 'componentLibrary/fieldText';
import { HexColorPickerComponent } from 'components/main/hexColorPicker';
import { DEFECT_TYPES_MAP } from 'common/constants/defectTypes';
import { FieldElement } from '../../../elements';
import {
  NAME_FIELD_KEY,
  COLOR_FIELD_KEY,
  ABBREVIATION_FIELD_KEY,
  GROUP_FIELD_KEY,
  COLORS,
} from '../../constants';
import styles from './addEditDefectTypeModal.scss';

const cx = className.bind(styles);

const messages = defineMessages({
  title: {
    id: 'AddEditDefectTypeModal.title',
    defaultMessage: '{actionType} Defect Type',
  },
  description: {
    id: 'AddEditDefectTypeModal.description',
    defaultMessage: 'Create your own Defect Type by filling in the form below',
  },
  add: {
    id: 'AddEditDefectTypeModal.newRuleMessage',
    defaultMessage: 'Create',
  },
  edit: {
    id: 'AddEditDefectTypeModal.editRuleMessage',
    defaultMessage: 'Edit',
  },
  group: {
    id: 'AddEditDefectTypeModal.group',
    defaultMessage: 'Defect Type Group',
  },
  name: {
    id: 'AddEditDefectTypeModal.name',
    defaultMessage: 'Defect Type name',
  },
  abbreviation: {
    id: 'AddEditDefectTypeModal.abbreviation',
    defaultMessage: 'Abbreviation',
  },
  color: {
    id: 'AddEditDefectTypeModal.color',
    defaultMessage: 'Color of Defect type',
  },
  abbreviationHint: {
    id: 'AddEditDefectTypeModal.abbreviationHint',
    defaultMessage: 'Abbreviation may contain up to 4 symbols',
  },
  [DEFECT_TYPES_MAP.AUTOMATION_BUG]: {
    id: 'AddEditDefectTypeModal.automationBug',
    defaultMessage: 'Automation Bug Group',
  },
  [DEFECT_TYPES_MAP.PRODUCT_BUG]: {
    id: 'AddEditDefectTypeModal.productBug',
    defaultMessage: 'Product Bug Group',
  },
  [DEFECT_TYPES_MAP.TO_INVESTIGATE]: {
    id: 'AddEditDefectTypeModal.toInvestigate',
    defaultMessage: 'To Investigate Group',
  },
  [DEFECT_TYPES_MAP.NO_DEFECT]: {
    id: 'AddEditDefectTypeModal.noDefect',
    defaultMessage: 'No Defect Group',
  },
  [DEFECT_TYPES_MAP.SYSTEM_ISSUE]: {
    id: 'AddEditDefectTypeModal.systemIssue',
    defaultMessage: 'System Issue Group',
  },
});

const ACTION_TYPE_ADD = 'add';
const FIELD = 'Field';

const AddEditDefectTypeModal = ({
  data,
  data: { onSave, defectType, defectTypes },
  handleSubmit,
  initialize,
  dirty,
  change,
}) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();

  useEffect(() => {
    initialize(defectType);
  }, []);

  const defectGroupOptions = [
    {
      value: DEFECT_TYPES_MAP.PRODUCT_BUG,
      label: formatMessage(messages[DEFECT_TYPES_MAP.PRODUCT_BUG]),
    },
    {
      value: DEFECT_TYPES_MAP.AUTOMATION_BUG,
      label: formatMessage(messages[DEFECT_TYPES_MAP.AUTOMATION_BUG]),
    },
    {
      value: DEFECT_TYPES_MAP.SYSTEM_ISSUE,
      label: formatMessage(messages[DEFECT_TYPES_MAP.SYSTEM_ISSUE]),
    },
    {
      value: DEFECT_TYPES_MAP.NO_DEFECT,
      label: formatMessage(messages[DEFECT_TYPES_MAP.NO_DEFECT]),
    },
    {
      value: DEFECT_TYPES_MAP.TO_INVESTIGATE,
      label: formatMessage(messages[DEFECT_TYPES_MAP.TO_INVESTIGATE]),
    },
  ];

  const { actionType } = data;

  const submitActions = (formFieldValues) => {
    onSave(
      actionType === ACTION_TYPE_ADD
        ? formFieldValues
        : [{ ...formFieldValues, typeRef: defectType.typeRef }],
    );
  };

  const okButton = {
    text:
      actionType === ACTION_TYPE_ADD
        ? formatMessage(COMMON_LOCALE_KEYS.CREATE)
        : formatMessage(COMMON_LOCALE_KEYS.SAVE),
    onClick: () => {
      handleSubmit(submitActions)();
    },
  };

  const cancelButton = {
    text: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
  };

  return (
    <ModalLayout
      title={formatMessage(messages.title, {
        actionType: formatMessage(messages[data.actionType]),
      })}
      okButton={okButton}
      cancelButton={cancelButton}
      onClose={() => dispatch(hideModalAction())}
      allowCloseOutside={!dirty}
    >
      {actionType === ACTION_TYPE_ADD && formatMessage(messages.description)}
      <div className={cx('content')}>
        {actionType === ACTION_TYPE_ADD && (
          <FieldElement
            label={formatMessage(messages.group)}
            name={GROUP_FIELD_KEY}
            type="text"
            className={cx('input')}
            onChange={(value) => {
              change(GROUP_FIELD_KEY, value);
              change(COLOR_FIELD_KEY, defectTypes[value][0].color);
            }}
            dataAutomationId={GROUP_FIELD_KEY + FIELD}
          >
            <Dropdown options={defectGroupOptions} defaultWidth={false} />
          </FieldElement>
        )}
        <div className={cx('input')}>
          <FieldProvider name={NAME_FIELD_KEY} type="text">
            <FieldErrorHint provideHint={false} dataAutomationId={NAME_FIELD_KEY + FIELD}>
              <FieldText label={formatMessage(messages.name)} defaultWidth={false} isRequired />
            </FieldErrorHint>
          </FieldProvider>
        </div>
        <FieldProvider
          name={ABBREVIATION_FIELD_KEY}
          type="text"
          className={cx('abbreviation-field')}
        >
          <FieldErrorHint provideHint={false} dataAutomationId={ABBREVIATION_FIELD_KEY + FIELD}>
            <FieldText
              label={formatMessage(messages.abbreviation)}
              defaultWidth={false}
              helpText={formatMessage(messages.abbreviationHint)}
              className={cx('abbreviation-field')}
              isRequired
            />
          </FieldErrorHint>
        </FieldProvider>
        <FieldElement
          name={COLOR_FIELD_KEY}
          className={cx('color-picker')}
          dataAutomationId={COLOR_FIELD_KEY + FIELD}
        >
          <HexColorPickerComponent label={formatMessage(messages.color)} presets={COLORS} />
        </FieldElement>
      </div>
    </ModalLayout>
  );
};
AddEditDefectTypeModal.propTypes = {
  data: PropTypes.shape({
    defectType: PropTypes.object,
    defectTypes: PropTypes.object,
    onSave: PropTypes.func,
    eventsInfo: PropTypes.object,
    actionType: PropTypes.string,
  }),
  initialize: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  dirty: PropTypes.bool.isRequired,
  change: PropTypes.func.isRequired,
};
AddEditDefectTypeModal.defaultProps = {
  data: {},
};

export const AddEditDefectTypeModalComponent = withModal('addEditDefectTypeModal')(
  reduxForm({
    form: 'DefectTypeForm',
    validate: ({ longName, shortName }) => {
      return {
        longName: composeBoundValidators([
          bindMessageToValidator(validate.required, 'shortRequiredFieldHint'),
          bindMessageToValidator(validate.defectTypeLongName, 'defectLongNameHint'),
        ])(longName),
        shortName: composeBoundValidators([
          bindMessageToValidator(validate.required, 'shortRequiredFieldHint'),
          bindMessageToValidator(validate.defectTypeShortName, 'defectShortNameHint'),
        ])(shortName),
      };
    },
  })(AddEditDefectTypeModal),
);
