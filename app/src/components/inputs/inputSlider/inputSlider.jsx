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
    options: PropTypes.array,
    value: PropTypes.string,
    onChange: PropTypes.func,
  };
  static defaultProps = {
    options: [],
    value: '',
    onChange: () => {},
  };
  constructor(props) {
    super(props);
    this.state = {
      marks: this.createMarks(),
      value: this.getSliderValue() || 0,
    };
  }

  onChange = (newValue) => {
    this.setState({ value: newValue });
    this.props.onChange(this.state.marks[newValue]);
  };

  getMaxValue = () => (this.props.options.length ? this.props.options.length - 1 : 0);

  getSliderValue = () => {
    let value;
    this.props.options.forEach((item, i) => {
      if (item === this.props.value) {
        value = i;
      }
    });
    return value;
  };

  createMarks = () => {
    const marks = {};
    this.props.options.forEach((item, idx) => {
      marks[idx] = item;
    });
    return marks;
  };

  render() {
    return (
      <div className={cx('slider-input')}>
        <Slider
          min={0}
          max={+this.getMaxValue()}
          marks={this.state.marks}
          step={1}
          value={this.state.value}
          onChange={this.onChange}
        />
      </div>
    );
  }
}
