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
import classNames from 'classnames/bind';
import track from 'react-tracking';
import { ERROR } from 'common/constants/logLevels';
import styles from './stackTraceMessageBlock.scss';

const cx = classNames.bind(styles);

const MAX_ROW_HEIGHT = 65;
const TOGGLER_HEIGHT = 22;

@track()
export class StackTraceMessageBlock extends Component {
  static propTypes = {
    children: PropTypes.any,
    maxHeight: PropTypes.number,
    level: PropTypes.string,
    designMode: PropTypes.string,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    eventsInfo: PropTypes.object,
    customProps: PropTypes.object,
  };

  static defaultProps = {
    children: '',
    maxHeight: MAX_ROW_HEIGHT,
    level: ERROR,
    designMode: '',
    eventsInfo: {},
    customProps: {},
  };

  constructor(props) {
    super(props);
    this.state = {
      withAccordion: false,
      expanded: false,
      maxHeight: null,
    };
    this.overflowCell = React.createRef();
  }

  componentDidMount() {
    this.handleAccordion();
  }

  componentDidUpdate() {
    this.handleAccordion();
  }

  getContentHeight = () => Number((this.props.maxHeight - TOGGLER_HEIGHT).toFixed());

  setupAccordion = () => {
    this.setState({ withAccordion: true, maxHeight: `${this.getContentHeight()}px` });
  };

  removeAccordion = () => {
    this.setState({ withAccordion: false, maxHeight: null });
  };

  handleAccordion = () => {
    if (!this.overflowCell) {
      return;
    }

    if (this.overflowCell.current.offsetHeight > this.getContentHeight()) {
      !this.state.withAccordion && this.setupAccordion();
    } else if (this.overflowCell.current.offsetHeight < this.getContentHeight()) {
      this.state.withAccordion && this.removeAccordion();
    }
  };

  toggleAccordion = () => {
    if (!this.overflowCell) {
      return;
    }

    if (!this.state.expanded) {
      const { onOpenStackTraceEvent } = this.props.eventsInfo;
      onOpenStackTraceEvent && this.props.tracking.trackEvent(onOpenStackTraceEvent());
    }

    this.setState({
      expanded: !this.state.expanded,
      maxHeight: this.state.expanded ? `${this.getContentHeight()}px` : null,
    });
  };

  render() {
    const { children, level, designMode, customProps } = this.props;
    const { expanded, withAccordion, maxHeight } = this.state;

    return (
      <div
        className={cx(
          'row-wrapper',
          { 'with-accordion': withAccordion },
          `level-${level.toLowerCase()}`,
          { [`design-mode-${designMode}`]: designMode },
          customProps.rowWrapper,
        )}
      >
        {withAccordion && (
          <div className={cx('accordion-wrapper-mobile')}>
            <div
              className={cx('accordion-toggler-mobile', { rotated: expanded })}
              onClick={this.toggleAccordion}
            />
          </div>
        )}
        <div
          className={cx('row', { [`design-mode-${designMode}`]: designMode }, customProps.row)}
          ref={this.overflowCell}
          style={{ maxHeight }}
        >
          {children}
        </div>
        {this.state.withAccordion && (
          <div className={cx('accordion-wrapper')}>
            <div
              className={cx(
                'accordion-block',
                {
                  expanded: this.state.expanded,
                  [`design-mode-${designMode}`]: designMode,
                },
                customProps.accordionBlock,
              )}
            >
              <div
                className={cx('accordion-toggler', { rotated: this.state.expanded })}
                onClick={this.toggleAccordion}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
}
