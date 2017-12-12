import { cloneElement } from 'react';
import PropTypes from 'prop-types';
import { connect } from '@cerebral/react';
import { field } from '@cerebral/forms';
import { state, props } from 'cerebral/tags';
import classNames from 'classnames/bind';

import { getObjWithoutKeys, checkInvalidField } from 'common/utils';

import styles from './inputWithIcon.scss';

const cx = classNames.bind(styles);

const InputWithIcon = (propsObj) => {
  const classes = cx({
    'input-width-icon': true,
    invalid: checkInvalidField(propsObj.formField, propsObj.formShowErrors),
  });
  return (
    <div className={classes}>
      <div className={cx('input-icon')} style={{ backgroundImage: `url(${propsObj.icon})` }} />
      <div className={cx('input-container')}>
        {propsObj.children && cloneElement(propsObj.children, getObjWithoutKeys(propsObj, [
          'children', 'icon', 'formField', 'formShowErrors',
        ]))}
      </div>
    </div>
  );
};

InputWithIcon.propTypes = {
  formPath: PropTypes.string,
  fieldName: PropTypes.string,
  formField: PropTypes.object,
  formShowErrors: PropTypes.bool,
  icon: PropTypes.string,
  children: PropTypes.node,
};
InputWithIcon.defaultProps = {
  formPath: '',
  fieldName: '',
  formField: {},
  formShowErrors: false,
  icon: '',
  children: null,
};

const connectComponent = connect({
  formField: field(state`${props`formPath`}.${props`fieldName`}`),
  formShowErrors: state`${props`formPath`}.showErrors`,
}, InputWithIcon);
export { InputWithIcon, connectComponent as default };

