import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, Field } from 'redux-form';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { injectIntl, intlShape } from 'react-intl';

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
  composeBindedValidators,
  commonValidators,
} from 'common/utils';

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

@reduxForm({
  validate: ({ longName, shortName }) => ({
    longName: composeBindedValidators([
      commonValidators.requiredField,
      bindMessageToValidator(validate.defectTypeLongName, 'defectLongNameHint'),
    ])(longName),
    shortName: composeBindedValidators([
      commonValidators.requiredField,
      bindMessageToValidator(validate.defectTypeShortName, 'defectShortNameHint'),
    ])(shortName),
  }),
})
@injectIntl
export class DefectSubTypeForm extends PureComponent {
  static propTypes = {
    initialValues: defectTypeShape.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
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
