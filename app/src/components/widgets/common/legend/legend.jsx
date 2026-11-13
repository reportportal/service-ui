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
    itemClassName: PropTypes.string,
    markClassName: PropTypes.string,
    labelClassName: PropTypes.string,
    getColor: PropTypes.func,
    maxHeight: PropTypes.number,
    alwaysShowScroll: PropTypes.bool,
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
    itemClassName: null,
    markClassName: null,
    labelClassName: null,
    getColor: getItemColor,
    maxHeight: 65,
    alwaysShowScroll: false,
  };

  componentDidMount() {
    // the custom scrollbar only re-measures on update; re-measure when the legend is resized
    // (e.g. widget resize) so the scrollbar doesn't stay visible when it is no longer needed
    if (typeof ResizeObserver !== 'undefined' && this.containerRef) {
      this.resizeObserver = new ResizeObserver(this.updateScrollbars);
      this.resizeObserver.observe(this.containerRef);
    }
  }

  componentWillUnmount() {
    this.resizeObserver?.disconnect();
  }

  setContainerRef = (node) => {
    this.containerRef = node;
  };

  setScrollRef = (node) => {
    this.scrollRef = node;
  };

  updateScrollbars = () => {
    this.scrollRef?.scrollbars?.update();
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
      getColor,
      itemClassName,
      markClassName,
      labelClassName,
    } = this.props;

    return items.map((name) => {
      const nameConfig = getItemNameConfig(name);
      const isItemConfig = Object.keys(nameConfig).length > 0;

      return (
        <span
          key={name}
          data-id={name}
          className={cx(
            'legend-item',
            {
              disabled,
              unchecked: uncheckedLegendItems.indexOf(name) !== -1,
            },
            itemClassName,
          )}
          onClick={disabled || !clickable ? null : this.onClick}
          onMouseOver={disabled ? null : this.onMouseOver}
          onMouseOut={disabled ? null : onMouseOut}
        >
          <span
            className={cx('color-mark', markClassName)}
            style={{
              backgroundColor: isItemConfig ? getColor(name, this.props.defectTypes) : colors[name],
            }}
          />
          <span className={cx('item-name', labelClassName)}>
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
    const { customBlock, className, maxHeight, alwaysShowScroll } = this.props;

    return (
      <div ref={this.setContainerRef} className={className || cx('legend')}>
        <ScrollWrapper
          ref={this.setScrollRef}
          autoHide={!alwaysShowScroll}
          autoHeight
          autoHeightMax={maxHeight}
          hideTracksWhenNotNeeded
        >
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
