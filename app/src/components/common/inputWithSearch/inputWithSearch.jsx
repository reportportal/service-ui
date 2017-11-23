import React, { cloneElement } from 'react';
import PropTypes from 'prop-types';
import { connect } from '@cerebral/react';
import { field } from '@cerebral/forms';
import { state, props } from 'cerebral/tags';
import classNames from 'classnames/bind';

import { getObjWithoutKeys, checkInvalidField } from 'common/utils';

import styles from './inputWithSearch.scss';

const cx = classNames.bind(styles);

const inputWithIcon = (propsObj) => {
  const classes = cx({
    'search-input': true,
    invalid: checkInvalidField(propsObj.formField, propsObj.formShowErrors),
  });
  const iconClasses = cx({
    'search-icon': true,
    'color-blue': (propsObj.color === 'blue'),
  });
  return (
    <div className={classes}>
      <div className={cx('input-container')}>
        {cloneElement(propsObj.children, getObjWithoutKeys(propsObj, [
          'children', 'color', 'formField', 'formShowErrors',
        ]))}
      </div>
      <div className={iconClasses} />
    </div>
  );
};

inputWithIcon.propTypes = {
  formPath: PropTypes.string,
  fieldName: PropTypes.string,
  formField: PropTypes.object,
  formShowErrors: PropTypes.bool,
  color: PropTypes.string,
  children: PropTypes.node,
};
inputWithIcon.defaultProps = {
  formPath: '',
  fieldName: '',
  formField: {},
  formShowErrors: false,
  color: '',
  children: null,
};

export default connect({
  formField: field(state`${props`formPath`}.${props`fieldName`}`),
  formShowErrors: state`${props`formPath`}.showErrors`,
}, inputWithIcon);
