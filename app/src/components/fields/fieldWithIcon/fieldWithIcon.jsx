/*
 * Copyright 2017 EPAM Systems
 *
 *
 * This file is part of EPAM Report Portal.
 * https://github.com/reportportal/service-ui
 *
 * Report Portal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Report Portal is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Report Portal.  If not, see <http://www.gnu.org/licenses/>.
 */

import { cloneElement } from 'react';
import PropTypes from 'prop-types';
import { field } from '@cerebral/forms';
import { state, props } from 'cerebral/tags';
import classNames from 'classnames/bind';
import { checkInvalidField } from 'common/utils';

import styles from './fieldWithIcon.scss';

const cx = classNames.bind(styles);

const FieldWithIcon = ({ formPath, fieldName, formField, formShowErrors, icon, children }) => {
  const classes = cx({
    'field-width-icon': true,
    invalid: checkInvalidField(formField, formShowErrors),
  });
  return (
    <div className={classes}>
      <div className={cx('field-icon')} style={{ backgroundImage: `url(${icon})` }} />
      <div className={cx('container')}>
        {children && cloneElement(children, { formPath, fieldName })}
      </div>
    </div>
  );
};

FieldWithIcon.propTypes = {
  formPath: PropTypes.string,
  fieldName: PropTypes.string,
  formField: PropTypes.object,
  formShowErrors: PropTypes.bool,
  icon: PropTypes.string,
  children: PropTypes.node,
};
FieldWithIcon.defaultProps = {
  formPath: '',
  fieldName: '',
  formField: {},
  formShowErrors: false,
  icon: '',
  children: null,
};

export default Utils.connectToState({
  formField: field(state`${props`formPath`}.${props`fieldName`}`),
  formShowErrors: state`${props`formPath`}.showErrors`,
}, FieldWithIcon);
