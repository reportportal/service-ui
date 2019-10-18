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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';
import classNames from 'classnames/bind';
import styles from './inputSlider.scss';

const cx = classNames.bind(styles);

const optionShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
});

export class InputSlider extends Component {
  static propTypes = {
    options: PropTypes.arrayOf(optionShape),
    value: optionShape,
    onChange: PropTypes.func,
  };

  static defaultProps = {
    options: [],
    value: '',
    onChange: () => {},
  };

  onChange = (newIndex) => this.props.onChange(this.props.options[newIndex]);

  getMaxValue = () => (this.props.options.length ? this.props.options.length - 1 : 0);

  getSliderValue = () => {
    const index = this.props.options.indexOf(this.props.value);
    return index > -1 ? index : 0;
  };

  createMarks = () =>
    this.props.options.reduce((acc, item, index) => ({ ...acc, [index]: item }), {});

  render() {
    return (
      <div className={cx('input-slider')}>
        <Slider
          min={0}
          max={this.getMaxValue()}
          marks={this.createMarks()}
          step={1}
          value={this.getSliderValue()}
          onChange={this.onChange}
        />
      </div>
    );
  }
}
