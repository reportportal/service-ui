import { cloneElement } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from '@cerebral/react';
import { props, state } from 'cerebral/tags';
import { field } from '@cerebral/forms';

import { getObjWithoutKeys, checkInvalidField } from 'common/utils';

import styles from './inputErrorHint.scss';

const cx = classNames.bind(styles);

const InputErrorHint = (propsObj) => {
  const classes = cx({
    'input-error-hint': true,
    show: checkInvalidField(propsObj.formField, propsObj.formShowErrors) && propsObj.isFocus,
    'bottom-type': propsObj.hintType === 'bottom',
  });
  return (
    <div className={classes}>
      {propsObj.children && cloneElement(propsObj.children, getObjWithoutKeys(propsObj, [
        'children', 'hintType', 'errorMessage', 'isFocus', 'formField', 'formShowErrors',
      ]))}
      <div className={cx('hint')}>
        <div className={cx('hint-content')}>
          {propsObj.errorMessage}
        </div>
      </div>
    </div>
  );
};

InputErrorHint.propTypes = {
  formPath: PropTypes.string,
  fieldName: PropTypes.string,
  formField: PropTypes.object,
  formShowErrors: PropTypes.bool,
  isFocus: PropTypes.bool,
  errorMessage: PropTypes.string,
  hintType: PropTypes.string,
  children: PropTypes.node,
};
InputErrorHint.defaultProps = {
  formPath: '',
  fieldName: '',
  formField: {},
  formShowErrors: false,
  isFocus: false,
  errorMessage: '',
  hintType: 'bottom',
  children: null,
};

const ConnectComponent = connect({
  formField: field(state`${props`formPath`}.${props`fieldName`}`),
  formShowErrors: state`${props`formPath`}.showErrors`,
  isFocus: state`${props`formPath`}.${props`fieldName`}.isFocus`,
  errorMessage: state`${props`formPath`}.${props`fieldName`}.errorMessage`,
}, InputErrorHint);
export { InputErrorHint as component, ConnectComponent as default };
