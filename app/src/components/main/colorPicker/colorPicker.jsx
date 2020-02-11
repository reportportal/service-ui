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
import * as ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { defineMessages, injectIntl } from 'react-intl';
import { CustomPicker, CirclePicker, ChromePicker } from 'react-color';
import { Manager, Reference, Popper } from 'react-popper';

import { COLORS, CIRCLE_SIZE, CIRCLE_SPACING, CIRCLE_PICKER_WIDTH } from './colorPickerSettings';

import styles from './colorPicker.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  pickSwatch: {
    id: 'ColorPicker.pickSwatch',
    defaultMessage: 'Pick a swatch',
  },
  selectColor: {
    id: 'ColorPicker.selectColor',
    defaultMessage: 'Select your color',
  },
});

@injectIntl
class ColorPickerComponent extends Component {
  static propTypes = {
    hex: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      opened: false,
    };

    this.pickerNode = null;
    this.controlNode = null;
  }

  componentDidMount() {
    document.addEventListener('click', this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  }

  handleClickOutside = (e) => {
    if (
      this.pickerNode &&
      !this.pickerNode.contains(e.target) &&
      this.controlNode &&
      !this.controlNode.contains(e.target) &&
      this.state.opened
    ) {
      this.setState({ opened: false });
    }
  };

  toggleColorPicker = () => {
    this.setState({ opened: !this.state.opened });
  };

  render() {
    const { hex, onChange, intl } = this.props;
    const { opened } = this.state;

    return (
      <Manager>
        <Reference>
          {({ ref }) => (
            <button
              type="button"
              ref={(node) => {
                ref(node);
                this.controlNode = node;
              }}
              className={cx('control', { 'control-opened': opened })}
              onClick={this.toggleColorPicker}
            >
              <span className={cx('color-marker')} style={{ backgroundColor: hex }} />
            </button>
          )}
        </Reference>
        {opened &&
          ReactDOM.createPortal(
            <Popper
              innerRef={(node) => {
                this.pickerNode = node;
              }}
              placement="bottom-start"
            >
              {({ ref, style, placement }) => (
                <div
                  className={cx('color-picker')}
                  ref={ref}
                  style={style}
                  data-placement={placement}
                >
                  <div className={cx('title')}>{intl.formatMessage(messages.pickSwatch)}:</div>
                  <CirclePicker
                    color={hex}
                    onChange={onChange}
                    colors={COLORS}
                    circleSize={CIRCLE_SIZE}
                    circleSpacing={CIRCLE_SPACING}
                    width={CIRCLE_PICKER_WIDTH}
                  />
                  <hr className={cx('separator')} />
                  <div className={cx('title')}>{intl.formatMessage(messages.selectColor)}:</div>
                  <ChromePicker
                    className={cx('chrome-picker')}
                    color={hex}
                    disableAlpha
                    onChange={onChange}
                  />
                </div>
              )}
            </Popper>,
            document.querySelector('#tooltip-root'),
          )}
      </Manager>
    );
  }
}

export const ColorPicker = CustomPicker(ColorPickerComponent);
