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
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { defectTypesSelector } from 'controllers/project';
import { DEFECT_TYPE_CONFIGURATION } from './constants';
import styles from './defectTypeSelector.scss';
import { DefectTypeItem } from '../defectTypeItem';

const cx = classNames.bind(styles);

@connect((state) => ({
  defectTypes: defectTypesSelector(state),
}))
export class DefectTypeSelector extends Component {
  static propTypes = {
    value: PropTypes.string,
    defectTypes: PropTypes.object.isRequired,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    placeholder: PropTypes.string,
  };

  static defaultProps = {
    value: '',
    onChange: () => {},
    onFocus: () => {},
    onBlur: () => {},
    placeholder: '',
  };
  state = {
    opened: false,
  };
  componentDidMount() {
    document.addEventListener('click', this.handleClickOutside);
  }
  componentWillUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  }
  onClickSelectBlock = (e) => {
    this.setState({ opened: !this.state.opened });
    e.stopPropagation();
    this.state.opened ? this.props.onBlur() : this.props.onFocus();
  };

  setRef = (node) => {
    this.node = node;
  };

  handleClickOutside = (e) => {
    if (this.node && !this.node.contains(e.target) && this.state.opened) {
      this.setState({ opened: false });
      this.props.onBlur();
    }
  };

  formatValue() {
    const { defectTypes, value } = this.props;
    let formattedValue = null;

    Object.keys(defectTypes).find((option) => {
      const foundDefectType = defectTypes[option].find(
        (defectType) => defectType.locator === value,
      );
      if (foundDefectType) {
        formattedValue = foundDefectType;
      }
      return foundDefectType;
    });

    return formattedValue && <DefectTypeItem type={formattedValue.locator} />;
  }

  handleChange = (selectedValue) => {
    const { onChange } = this.props;
    onChange(selectedValue);
    this.setState({ opened: !this.state.opened });
  };

  renderOptions() {
    const { defectTypes, value } = this.props;

    return (
      <Fragment>
        <div className={cx('defect-options')}>
          {DEFECT_TYPE_CONFIGURATION.map((option) => (
            <div key={option} className={cx('select-option-group')}>
              {defectTypes[option].map((defectType) => (
                <div key={defectType.locator} className={cx('select-option')}>
                  <DefectTypeItem
                    type={defectType.locator}
                    noBorder={defectType.locator !== value}
                    lesserFont={defectType.locator === value}
                    onClick={() => this.handleChange(defectType.locator)}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </Fragment>
    );
  }

  render() {
    const { defectTypes, placeholder } = this.props;

    return (
      !!Object.keys(defectTypes).length && (
        <div
          ref={this.setRef}
          className={cx('defect-type-selector', { opened: this.state.opened })}
        >
          <div className={cx('select-block')} onClick={this.onClickSelectBlock}>
            <span className={cx('value')}>{this.formatValue() || placeholder}</span>
            <span className={cx('arrow')} />
          </div>
          <div className={cx('select-list')}>{this.renderOptions()}</div>
        </div>
      )
    );
  }
}
