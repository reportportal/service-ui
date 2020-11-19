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
import Parser from 'html-react-parser';
import InfoIcon from 'common/img/info-inline.svg';
import styles from './modalField.scss';

const cx = classname.bind(styles);

const TIP_POSITION_BOTTOM = 'bottom';
const TIP_POSITION_RIGHT = 'right';

export const ModalField = ({
  className,
  label,
  children,
  tip,
  tipPosition,
  labelWidth,
  alignLeft,
  noMinHeight,
  labelTip,
}) => (
  <div className={cx('modal-field', className)}>
    {label && (
      <Label
        label={label}
        labelWidth={labelWidth}
        alignLeft={alignLeft}
        noMinHeight={noMinHeight}
        labelTip={labelTip}
      />
    )}
    <Content>
      {children}
      {tip && <Tip tipPosition={tipPosition} tip={tip} />}
    </Content>
  </div>
);
ModalField.propTypes = {
  className: PropTypes.string,
  label: PropTypes.string,
  tip: PropTypes.string,
  tipPosition: PropTypes.oneOf([TIP_POSITION_BOTTOM, TIP_POSITION_RIGHT]),
  children: PropTypes.node,
  labelWidth: PropTypes.number,
  alignLeft: PropTypes.bool,
  noMinHeight: PropTypes.bool,
  labelTip: PropTypes.string,
};
ModalField.defaultProps = {
  className: '',
  label: '',
  tip: '',
  tipPosition: TIP_POSITION_BOTTOM,
  children: null,
  labelWidth: null,
  alignLeft: false,
  noMinHeight: false,
  labelTip: '',
};

const Tip = ({ tip, tipPosition }) => (
  <div className={cx('modal-field-tip', `position-${tipPosition}`)}>{tip}</div>
);
Tip.propTypes = {
  tip: PropTypes.string,
  tipPosition: PropTypes.oneOf([TIP_POSITION_BOTTOM, TIP_POSITION_RIGHT]),
};
Tip.defaultProps = {
  tip: '',
  tipPosition: TIP_POSITION_BOTTOM,
};

const Label = ({ label, labelWidth, alignLeft, noMinHeight, labelTip }) => (
  <div
    className={cx('modal-field-label', {
      'no-min-height': label === ' ' || noMinHeight,
      'align-left': alignLeft,
    })}
    style={{ width: labelWidth || 'unset' }}
  >
    <span>{label}</span>
    {labelTip && (
      <div className={cx('modal-field-label-icon')} title={labelTip}>
        {Parser(InfoIcon)}
      </div>
    )}
  </div>
);
Label.propTypes = {
  label: PropTypes.string,
  labelWidth: PropTypes.number,
  alignLeft: PropTypes.bool,
  noMinHeight: PropTypes.bool,
  labelTip: PropTypes.string,
};
Label.defaultProps = {
  label: '',
  labelWidth: null,
  alignLeft: false,
  noMinHeight: false,
  labelTip: '',
};

const Content = ({ children }) => <div className={cx('modal-field-content')}>{children}</div>;
Content.propTypes = {
  children: PropTypes.node,
};
Content.defaultProps = {
  children: null,
};
