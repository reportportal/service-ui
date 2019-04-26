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
    if (!this.node.contains(e.target)) {
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
