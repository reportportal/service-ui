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

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { reduxForm } from 'redux-form';
import { useDispatch } from 'react-redux';
import className from 'classnames/bind';
import { defineMessages, useIntl } from 'react-intl';
import { withModal } from 'components/main/modal';
import { ModalLayout } from 'componentLibrary/modal';
import { FieldProvider } from 'components/fields/fieldProvider';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import {
  validate,
  bindMessageToValidator,
  commonValidators,
  composeBoundValidators,
} from 'common/utils/validation';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { Dropdown } from 'componentLibrary/dropdown';
import { hideModalAction } from 'controllers/modal';
import { FieldText } from 'componentLibrary/fieldText';
import { HexColorPickerComponent } from 'components/main/hexColorPicker';
import { FieldElement } from '../../../elements';
import {
  NAME_FIELD_KEY,
  COLOR_FIELD_KEY,
  GROUP_CASES,
  ABBREVIATION_FIELD_KEY,
  GROUP_FIELD_KEY,
  COLORS,
} from '../../constants';
import styles from './addEditDefectTypeModal.scss';

const cx = className.bind(styles);

const messages = defineMessages({
  title: {
    id: 'AddEditDefectTypeModal.title',
    defaultMessage: '{actionType} Defect',
  },
  description: {
    id: 'AddEditDefectTypeModal.description',
    defaultMessage: 'Create your own Defect by filling in the form below',
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
    defaultMessage: 'Defect name',
  },
  abbreviation: {
    id: 'AddEditDefectTypeModal.abbreviation',
    defaultMessage: 'Abbreviation',
  },
  color: {
    id: 'AddEditDefectTypeModal.color',
    defaultMessage: 'Color of Defect',
  },
  abbreviationHint: {
    id: 'AddEditDefectTypeModal.abbreviationHint',
    defaultMessage: 'Abbreviation may contain up to 4 symbols',
  },
  [GROUP_CASES.AUTOMATION_BUG]: {
    id: 'AddEditDefectTypeModal.automationBug',
    defaultMessage: 'Automation Bug Group',
  },
  [GROUP_CASES.PRODUCT_BUG]: {
    id: 'AddEditDefectTypeModal.productBug',
    defaultMessage: 'Product Bug Group',
  },
  [GROUP_CASES.TO_INVESTIGATE]: {
    id: 'AddEditDefectTypeModal.toInvestigate',
    defaultMessage: 'To Investigate Group',
  },
  [GROUP_CASES.NO_DEFECT]: {
    id: 'AddEditDefectTypeModal.noDefect',
    defaultMessage: 'No Defect Group',
  },
  [GROUP_CASES.SYSTEM_ISSUE]: {
    id: 'AddEditDefectTypeModal.systemIssue',
    defaultMessage: 'System Issue Group',
  },
});

const ACTION_TYPE_ADD = 'add';
const AddEditDefectTypeModal = ({
  data,
  data: { onSave, defectType, defectGroup, defectTypes },
  handleSubmit,
  initialize,
  dirty,
}) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const [newColor, setNewColor] = useState(defectType ? defectType.color : defectGroup.color);

  useEffect(() => {
    initialize(defectType || defectGroup);
  }, []);

  const caseOptions = [
    {
      value: GROUP_CASES.AUTOMATION_BUG,
      label: formatMessage(messages[GROUP_CASES.AUTOMATION_BUG]),
    },
    {
      value: GROUP_CASES.PRODUCT_BUG,
      label: formatMessage(messages[GROUP_CASES.PRODUCT_BUG]),
    },
    {
      value: GROUP_CASES.TO_INVESTIGATE,
      label: formatMessage(messages[GROUP_CASES.TO_INVESTIGATE]),
    },
    {
      value: GROUP_CASES.NO_DEFECT,
      label: formatMessage(messages[GROUP_CASES.NO_DEFECT]),
    },
    {
      value: GROUP_CASES.SYSTEM_ISSUE,
      label: formatMessage(messages[GROUP_CASES.SYSTEM_ISSUE]),
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
    text: formatMessage(COMMON_LOCALE_KEYS.SAVE),
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
      {!defectType && formatMessage(messages.description)}
      <div className={cx('content')}>
        {actionType === ACTION_TYPE_ADD && (
          <FieldElement
            label={formatMessage(messages.group)}
            name={GROUP_FIELD_KEY}
            type="text"
            className={cx('input')}
            onChange={(value) => setNewColor(defectTypes[value.toUpperCase()][0].color)}
          >
            <Dropdown options={caseOptions} defaultWidth={false} />
          </FieldElement>
        )}
        <div className={cx('input')}>
          <FieldProvider name={NAME_FIELD_KEY} type="text">
            <FieldErrorHint provideHint={false}>
              <FieldText label={formatMessage(messages.name)} defaultWidth={false} />
            </FieldErrorHint>
          </FieldProvider>
        </div>
        <FieldProvider name={ABBREVIATION_FIELD_KEY} type="text">
          <FieldErrorHint provideHint={false}>
            <FieldText
              label={formatMessage(messages.abbreviation)}
              defaultWidth={false}
              hasDynamicValidation
              provideErrorHint
              helpText={formatMessage(messages.abbreviationHint)}
            />
          </FieldErrorHint>
        </FieldProvider>
        <FieldElement name={COLOR_FIELD_KEY} className={cx('color-picker')}>
          <HexColorPickerComponent
            label={formatMessage(messages.color)}
            color={newColor}
            presets={COLORS}
            onChange={setNewColor}
          />
        </FieldElement>
      </div>
    </ModalLayout>
  );
};
AddEditDefectTypeModal.propTypes = {
  data: PropTypes.shape({
    defectType: PropTypes.object,
    defectGroup: PropTypes.object,
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

export default withModal('addEditDefectTypeModal')(
  reduxForm({
    form: 'DefectTypeForm',
    validate: ({ longName, shortName }) => {
      return {
        longName: composeBoundValidators([
          commonValidators.requiredField,
          bindMessageToValidator(validate.defectTypeLongName, 'defectLongNameHint'),
        ])(longName),
        shortName: composeBoundValidators([
          commonValidators.requiredField,
          bindMessageToValidator(validate.defectTypeShortName, 'defectShortNameHint'),
        ])(shortName),
      };
    },
  })(AddEditDefectTypeModal),
);
