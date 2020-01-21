/*
 * Copyright 2019 EPAM Systems
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

import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, Field } from 'redux-form';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { injectIntl } from 'react-intl';

import { Input } from 'components/inputs/input';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { FieldProvider } from 'components/fields/fieldProvider';
import { ColorPicker } from 'components/main/colorPicker';
import CircleCrossIcon from 'common/img/circle-cross-icon-inline.svg';
import CircleCheckIcon from 'common/img/circle-check-inline.svg';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import {
  validate,
  bindMessageToValidator,
  composeBoundValidators,
  commonValidators,
} from 'common/utils/validation';

import { defectTypeShape } from './defectTypeShape';
import { messages } from './defectTypesMessages';

import styles from './defectTypesTab.scss';

const cx = classNames.bind(styles);

const renderColorPicker = ({ input: { value, onChange } }) => (
  <ColorPicker color={value} onChangeComplete={({ hex }) => onChange(hex)} />
);

renderColorPicker.propTypes = {
  input: PropTypes.object.isRequired,
};

const longNameValidator = composeBoundValidators([
  commonValidators.requiredField,
  bindMessageToValidator(validate.defectTypeLongName, 'defectLongNameHint'),
]);

const shortNameValidator = composeBoundValidators([
  commonValidators.requiredField,
  bindMessageToValidator(validate.defectTypeShortName, 'defectShortNameHint'),
]);

@reduxForm({
  validate: ({ longName, shortName }) => ({
    longName: longNameValidator(longName),
    shortName: shortNameValidator(shortName),
  }),
})
@injectIntl
export class DefectSubTypeForm extends PureComponent {
  static propTypes = {
    initialValues: defectTypeShape.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
  };

  render() {
    const { handleSubmit, onDelete, onConfirm, intl } = this.props;

    return (
      <Fragment>
        <div className={cx('name-cell')}>
          <FieldProvider name="longName">
            <FieldErrorHint staticHint>
              <Input placeholder={intl.formatMessage(messages.defectNameCol)} />
            </FieldErrorHint>
          </FieldProvider>
        </div>
        <div className={cx('abbr-cell')}>
          <FieldProvider name="shortName">
            <FieldErrorHint staticHint>
              <Input placeholder={intl.formatMessage(messages.abbreviationCol)} />
            </FieldErrorHint>
          </FieldProvider>
        </div>
        <div className={cx('color-cell', 'color-picker-cell')}>
          <Field name="color" component={renderColorPicker} />
        </div>
        <div className={cx('buttons-cell')}>
          <button
            className={cx('action-button', 'confirm-button')}
            aria-label={intl.formatMessage(COMMON_LOCALE_KEYS.CONFIRM)}
            title={intl.formatMessage(COMMON_LOCALE_KEYS.CONFIRM)}
            onClick={handleSubmit(onConfirm)}
          >
            {Parser(CircleCheckIcon)}
          </button>
          <button
            className={cx('action-button', 'delete-button')}
            aria-label={intl.formatMessage(COMMON_LOCALE_KEYS.DELETE)}
            title={intl.formatMessage(COMMON_LOCALE_KEYS.DELETE)}
            onClick={onDelete}
          >
            {Parser(CircleCrossIcon)}
          </button>
        </div>
      </Fragment>
    );
  }
}
