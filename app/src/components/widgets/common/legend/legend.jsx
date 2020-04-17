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
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defectTypesSelector } from 'controllers/project';
import { injectIntl } from 'react-intl';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { getItemColor, getItemName, getItemNameConfig } from '../utils';
import { messages } from '../messages';
import styles from './legend.scss';

const cx = classNames.bind(styles);

@connect((state) => ({
  defectTypes: defectTypesSelector(state),
}))
@injectIntl
export class Legend extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    defectTypes: PropTypes.object.isRequired,
    items: PropTypes.array,
    colors: PropTypes.object,
    noTotal: PropTypes.bool,
    disabled: PropTypes.bool,
    clickable: PropTypes.bool,
    onClick: PropTypes.func,
    onMouseOver: PropTypes.func,
    onMouseOut: PropTypes.func,
    customBlock: PropTypes.node,
    uncheckedLegendItems: PropTypes.array,
    className: PropTypes.string,
  };

  static defaultProps = {
    items: [],
    colors: {},
    noTotal: false,
    disabled: false,
    clickable: true,
    onClick: () => {},
    onMouseOver: () => {},
    onMouseOut: () => {},
    customBlock: null,
    uncheckedLegendItems: [],
    className: null,
  };

  onClick = (e) => {
    const target = this.getTarget(e);
    target.classList.toggle(cx('unchecked'));
    this.props.onClick(target.getAttribute('data-id'));
  };

  onMouseOver = (e) => {
    const target = this.getTarget(e);
    this.props.onMouseOver(target.getAttribute('data-id'));
  };

  getElements = () => {
    const {
      intl: { formatMessage },
      defectTypes,
      items,
      uncheckedLegendItems,
      disabled,
      clickable,
      noTotal,
      onMouseOut,
      colors,
    } = this.props;

    return items.map((name) => {
      const nameConfig = getItemNameConfig(name);
      const isItemConfig = Object.keys(nameConfig).length > 0;

      return (
        <span
          key={name}
          data-id={name}
          className={cx('legend-item', {
            disabled,
            unchecked: uncheckedLegendItems.indexOf(name) !== -1,
          })}
          onClick={disabled || !clickable ? null : this.onClick}
          onMouseOver={disabled ? null : this.onMouseOver}
          onMouseOut={disabled ? null : onMouseOut}
        >
          <span
            className={cx('color-mark')}
            style={{
              backgroundColor: isItemConfig
                ? getItemColor(name, this.props.defectTypes)
                : colors[name],
            }}
          />
          <span className={cx('item-name')}>
            {isItemConfig
              ? getItemName({ itemName: name, defectTypes, noTotal, formatMessage })
              : formatMessage(messages[name])}
          </span>
        </span>
      );
    });
  };

  getTarget = ({ target }) => (target.getAttribute('data-id') ? target : target.parentElement);

  render() {
    const { customBlock, className } = this.props;

    return (
      <div className={className || cx('legend')}>
        <ScrollWrapper autoHide autoHeight autoHeightMax={65} hideTracksWhenNotNeeded>
          <div className={cx('content-wrapper')}>
            {customBlock ? (
              <div className={cx('with-custom-block')}>
                {customBlock}
                <div className={cx('legend-elements')}>{this.getElements()}</div>
              </div>
            ) : (
              this.getElements()
            )}
          </div>
        </ScrollWrapper>
      </div>
    );
  }
}
