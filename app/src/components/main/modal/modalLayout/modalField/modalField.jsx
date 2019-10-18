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

import PropTypes from 'prop-types';
import classname from 'classnames/bind';
import styles from './modalField.scss';

const cx = classname.bind(styles);

export const ModalField = ({ className, label, children, tip, labelWidth, alignLeft }) => (
  <div className={cx('modal-field', className)}>
    {label && <Label label={label} labelWidth={labelWidth} alignLeft={alignLeft} />}
    <Content>
      {children}
      {tip && <Tip tip={tip} />}
    </Content>
  </div>
);
ModalField.propTypes = {
  className: PropTypes.string,
  label: PropTypes.string,
  tip: PropTypes.string,
  children: PropTypes.node,
  labelWidth: PropTypes.number,
  alignLeft: PropTypes.bool,
};
ModalField.defaultProps = {
  className: '',
  label: '',
  tip: '',
  children: null,
  labelWidth: null,
  alignLeft: false,
};

const Tip = ({ tip }) => <div className={cx('modal-field-tip')}>{tip}</div>;
Tip.propTypes = {
  tip: PropTypes.string,
};
Tip.defaultProps = {
  tip: '',
};

const Label = ({ label, labelWidth, alignLeft }) => (
  <div
    className={cx('modal-field-label', { 'no-min-height': label === ' ', 'align-left': alignLeft })}
    style={{ width: labelWidth || 'unset' }}
  >
    {label}
  </div>
);
Label.propTypes = {
  label: PropTypes.string,
  labelWidth: PropTypes.number,
  alignLeft: PropTypes.bool,
};
Label.defaultProps = {
  label: '',
  labelWidth: null,
  alignLeft: false,
};

const Content = ({ children }) => <div className={cx('modal-field-content')}>{children}</div>;
Content.propTypes = {
  children: PropTypes.node,
};
Content.defaultProps = {
  children: null,
};
