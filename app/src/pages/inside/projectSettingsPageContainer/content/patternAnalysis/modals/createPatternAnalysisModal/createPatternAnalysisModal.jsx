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
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames/bind';
import { useIntl } from 'react-intl';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { withModal } from 'components/main/modal';
import { ModalLayout } from 'componentLibrary/modal';
import { hideModalAction } from 'controllers/modal';
import { PATTERN_TYPES, REGEX_PATTERN } from 'common/constants/patternTypes';
import { commonValidators } from 'common/utils/validation';
import { formValueSelector, reduxForm } from 'redux-form';
import { FieldProvider } from 'components/fields';
import { Dropdown } from 'componentLibrary/dropdown';
import { FieldText } from 'componentLibrary/fieldText';
import { Toggle } from 'componentLibrary/toggle';
import { FieldTextFlex } from 'componentLibrary/fieldTextFlex';
import { RegExEditor } from 'components/inputs/regExEditor';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { FieldElement } from 'pages/inside/projectSettingsPageContainer/content/elements';
import styles from './createPatternAnalysisModal.scss';
import { messages } from '../../messages';

const cx = classNames.bind(styles);

const createPatternFormSelector = formValueSelector('createPatternForm');

const CreatePatternAnalysisModal = ({ data, handleSubmit, initialize }) => {
  const { pattern, onSave } = data;

  const selectedType = useSelector((state) => createPatternFormSelector(state, 'type'));

  useEffect(() => {
    initialize(pattern);
  }, []);

  const dispatch = useDispatch();
  const { formatMessage } = useIntl();

  const okButton = {
    text: formatMessage(COMMON_LOCALE_KEYS.SAVE),
    onClick: () => handleSubmit(onSave)(),
  };
  const cancelButton = {
    text: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
  };

  return (
    <ModalLayout
      title={data.modalTitle || formatMessage(messages.createPatternModalHeader)}
      okButton={okButton}
      cancelButton={cancelButton}
      onClose={() => dispatch(hideModalAction())}
      footerNode={
        <FieldProvider name="enabled" format={(value) => !!value}>
          <Toggle className={cx('toggle')}>
            {formatMessage(messages.createPatternModalToggle)}
          </Toggle>
        </FieldProvider>
      }
    >
      {formatMessage(messages.createPatternModalDescription)}
      <div className={cx('content')}>
        <FieldProvider name="name" type="text">
          <FieldErrorHint provideHint={false}>
            <FieldText
              label={formatMessage(messages.createPatternModalPatternName)}
              defaultWidth={false}
            />
          </FieldErrorHint>
        </FieldProvider>
        <FieldElement
          name="type"
          type="text"
          label={formatMessage(messages.createPatternModalType)}
          className={cx('dropdown')}
        >
          <Dropdown defaultWidth={false} options={PATTERN_TYPES} />
        </FieldElement>
        <FieldElement
          label={formatMessage(messages.createPatternModalCondition)}
          name="value"
          type="text"
        >
          <FieldErrorHint provideHint={false}>
            {selectedType === REGEX_PATTERN ? <RegExEditor /> : <FieldTextFlex />}
          </FieldErrorHint>
        </FieldElement>
      </div>
    </ModalLayout>
  );
};
CreatePatternAnalysisModal.propTypes = {
  data: PropTypes.shape({
    pattern: PropTypes.object,
    patterns: PropTypes.array,
    onSave: PropTypes.func,
    eventsInfo: PropTypes.object,
    modalTitle: PropTypes.string,
  }),
  handleSubmit: PropTypes.func.isRequired,
  initialize: PropTypes.func.isRequired,
};
CreatePatternAnalysisModal.defaultProps = {
  data: {},
};

export default withModal('createPatternAnalysisModal')(
  reduxForm({
    form: 'createPatternForm',
    validate: ({ name, value }, { data: { patterns } }) => ({
      name: commonValidators.createPatternNameValidator(patterns)(name),
      value: commonValidators.requiredField(value),
    }),
  })(CreatePatternAnalysisModal),
);
