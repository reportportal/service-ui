import { cloneElement } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { props, state } from 'cerebral/tags';
import { field } from '@cerebral/forms';
import { checkInvalidField } from 'common/utils';
import styles from './fieldErrorHint.scss';

const cx = classNames.bind(styles);

const FieldErrorHint = (
    { formPath, fieldName, formField, formShowErrors, isFocus, errorMessage, hintType, children },
  ) => {
  const classes = cx({
    'field-error-hint': true,
    show: checkInvalidField(formField, formShowErrors) && isFocus,
    'bottom-type': hintType === 'bottom',
  });
  return (
    <div className={classes}>
      {children && cloneElement(children, { formPath, fieldName })}
      <div className={cx('hint')}>
        <div className={cx('hint-content')}>
          {errorMessage}
        </div>
      </div>
    </div>
  );
};

FieldErrorHint.propTypes = {
  formPath: PropTypes.string,
  fieldName: PropTypes.string,
  formField: PropTypes.object,
  formShowErrors: PropTypes.bool,
  isFocus: PropTypes.bool,
  errorMessage: PropTypes.string,
  hintType: PropTypes.string,
  children: PropTypes.node,
};
FieldErrorHint.defaultProps = {
  formPath: '',
  fieldName: '',
  formField: {},
  formShowErrors: false,
  isFocus: false,
  errorMessage: '',
  hintType: 'bottom',
  children: null,
};

export default Utils.connectToState({
  formField: field(state`${props`formPath`}.${props`fieldName`}`),
  formShowErrors: state`${props`formPath`}.showErrors`,
  isFocus: state`${props`formPath`}.${props`fieldName`}.isFocus`,
  errorMessage: state`${props`formPath`}.${props`fieldName`}.errorMessage`,
}, FieldErrorHint);
