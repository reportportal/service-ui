import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { CustomPicker, CirclePicker } from 'react-color';
import { Saturation, EditableInput, Hue } from 'react-color/lib/components/common';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import styles from './inputColorPicker.scss';

const Messages = defineMessages({
  title: {
    id: 'defectTypesGroup.colorPicker.title',
    defaultMessage: 'PICK A SWATCH:',
  },
  select: {
    id: 'defectTypesGroup.colorPicker.select',
    defaultMessage: 'SELECT YOUR COLORS:',
  },
});

const cx = classNames.bind(styles);

@CustomPicker
@injectIntl
export class InputColorPicker extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    oldHue: PropTypes.number,
    color: PropTypes.string,
    hsl: PropTypes.object,
    hsv: PropTypes.object,
    onChange: PropTypes.func,
    rgb: PropTypes.object,
    source: PropTypes.string,
    colorChange: PropTypes.func,
    hex: PropTypes.string,
  };

  static defaultProps = {
    intl: {},
    oldHue: 0,
    color: '',
    hsl: {},
    hsv: {},
    onChange: () => {},
    rgb: {},
    source: '',
    colorChange: () => {},
    hex: '',
  };

  handleColorChange = ({ hex: hexAlias, ...rest }) => {
    const hex = hexAlias || arguments[0];
    const oldHue = rest.oldHue || this.props.oldHue;
    const val = {
      color: this.props.color,
      hex,
      hsl: this.props.hsl,
      hsv: this.props.hsv,
      h: oldHue,
      onChange: this.props.onChange,
      rgb: this.props.rgb,
      source: this.props.source,
    };
    this.props.onChange(val);
  };

  CONFIGURATION = {
    hue: {
      width: 15,
      height: 110,
      direction: 'vertical',
      onChange: this.handleColorChange,
    },
    circlePicker: {
      circleSize: 12,
      circleSpacing: 10,
      width: 220,
      colors: [
        '#f48fb1',
        '#cc92d6',
        '#b39ddb',
        '#81d4fa',
        '#8de1ec',
        '#80cbc4',
        '#c5e1a5',
        '#e6ee9c',
        '#ffcc80',
        '#ffab91',
        '#f50057',
        '#d500f9',
        '#651fff',
        '#00b0ff',
        '#00e5ff',
        '#1de9b6',
        '#76ff03',
        '#c6ff00',
        '#ffc400',
        '#ff3d00',
        '#ad1457',
        '#6a1b9a',
        '#4527a0',
        '#0277bd',
        '#00838f',
        '#00695c',
        '#558b2f',
        '#9e9d24',
        '#ff8f00',
        '#d84315',
      ],
    },
  };

  MyPointer = () => <div className={cx('hue-picker-btn')}>&nbsp;</div>;

  render() {
    this.props.colorChange(this.props.hex);
    return (
      <div className={cx('color-picker')}>
        <div className={cx('title')}>{this.props.intl.formatMessage(Messages.title)}</div>
        <CirclePicker
          className={cx('circle-picker')}
          {...this.props}
          {...this.CONFIGURATION.circlePicker}
        />
        <div className={cx('title')}>{this.props.intl.formatMessage(Messages.select)}</div>
        <div className={cx('saturation-picker')}>
          <Saturation {...this.props} />
        </div>
        <div className={cx('hue-picker')}>
          <Hue
            {...this.props}
            {...this.CONFIGURATION.hue}
            pointer={this.MyPointer}
            onChange={this.handleColorChange}
            direction={'vertical'}
          />
        </div>
        <div className={cx('color-editable-input')}>
          <EditableInput
            {...this.props}
            value={this.props.hex}
            color={this.props.hex}
            onChange={this.handleColorChange}
            maxLength={9}
          />
        </div>
      </div>
    );
  }
}
