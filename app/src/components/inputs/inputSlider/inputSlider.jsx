import Slider from 'rc-slider';
import React, { Component } from 'react';
import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './inputSlider.scss';

const cx = classNames.bind(styles);

export class InputSlider extends Component {
  static propTypes = {
    options: PropTypes.arrayOf(PropTypes.string),
    value: PropTypes.string,
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
