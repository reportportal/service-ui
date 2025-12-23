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

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { reduxForm } from 'redux-form';
import { connect, useDispatch, useSelector } from 'react-redux';
import { useTracking } from 'react-tracking';
import className from 'classnames/bind';
import { useIntl } from 'react-intl';
import { Modal } from '@reportportal/ui-kit';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { PROJECT_SETTINGS_LOG_TYPES_EVENTS } from 'components/main/analytics/events/ga4Events/projectSettingsPageEvents';
import { createLogTypeAction, logTypesSelector } from 'controllers/project';
import { hideModalAction } from 'controllers/modal';
import { projectIdSelector } from 'controllers/pages';
import { messages } from '../messages';
import {
  NAME_FIELD_KEY,
  LEVEL_FIELD_KEY,
  LABEL_COLOR_FIELD_KEY,
  BACKGROUND_COLOR_FIELD_KEY,
  TEXT_COLOR_FIELD_KEY,
  TEXT_BOLD_FIELD_KEY,
  DEFAULT_LABEL_COLOR,
  DEFAULT_BACKGROUND_COLOR,
  DEFAULT_TEXT_COLOR,
  CREATE_LOG_TYPE_FORM,
} from '../constants';
import { logTypeValidator } from '../validationUtils';
import { useLogTypeFormState } from '../hooks';
import { ColorPaletteFields, LevelField, NameField } from '../fields';
import styles from './createLogTypeModal.scss';

const cx = className.bind(styles);

const CreateLogTypeModal = ({ handleSubmit, initialize, invalid, dirty }) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const { trackEvent } = useTracking();
  const projectId = useSelector(projectIdSelector);
  const { colors, textBold, handleColorChange, setTextBold, getFormData } = useLogTypeFormState();

  useEffect(() => {
    initialize({
      [NAME_FIELD_KEY]: '',
      [LEVEL_FIELD_KEY]: '',
      [LABEL_COLOR_FIELD_KEY]: DEFAULT_LABEL_COLOR,
      [BACKGROUND_COLOR_FIELD_KEY]: DEFAULT_BACKGROUND_COLOR,
      [TEXT_COLOR_FIELD_KEY]: DEFAULT_TEXT_COLOR,
      [TEXT_BOLD_FIELD_KEY]: false,
    });
  }, [initialize]);

  const submitHandler = (formValues) => {
    const data = getFormData(formValues);

    const onSuccess = () => {
      trackEvent(PROJECT_SETTINGS_LOG_TYPES_EVENTS.CLICK_CREATE_IN_MODAL);
      dispatch(hideModalAction());
    };

    dispatch(createLogTypeAction(data, projectId, onSuccess));
  };

  const okButton = {
    children: formatMessage(COMMON_LOCALE_KEYS.CREATE),
    onClick: () => handleSubmit(submitHandler)(),
    disabled: invalid,
    'data-automation-id': 'submitButton',
  };

  const cancelButton = {
    children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    'data-automation-id': 'cancelButton',
  };

  return (
    <Modal
      title={formatMessage(messages.modalTitle)}
      description={formatMessage(messages.modalDescription)}
      okButton={okButton}
      cancelButton={cancelButton}
      onClose={() => dispatch(hideModalAction())}
      allowCloseOutside={!dirty}
      scrollable
    >
      <div className={cx('content')}>
        <NameField />
        <LevelField />
        <ColorPaletteFields
          colors={colors}
          textBold={textBold}
          onColorChange={handleColorChange}
          onTextBoldChange={setTextBold}
        />
      </div>
    </Modal>
  );
};

CreateLogTypeModal.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  initialize: PropTypes.func.isRequired,
  invalid: PropTypes.bool.isRequired,
  dirty: PropTypes.bool.isRequired,
};

export default connect((state) => ({
  logTypes: logTypesSelector(state),
}))(
  reduxForm({
    form: CREATE_LOG_TYPE_FORM,
    validate: (values, props) => {
      const logTypes = props.logTypes || [];
      return logTypeValidator(logTypes)(values);
    },
  })(CreateLogTypeModal),
);
