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

import { Component, createRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import track from 'react-tracking';
import { defineMessages, injectIntl } from 'react-intl';
import Parser from 'html-react-parser';
import ArrowDownIcon from 'common/img/arrow-down-inline.svg';
import { ALL, LATEST } from 'common/constants/reservedFilterIds';
import { LAUNCHES_PAGE_EVENTS } from 'components/main/analytics/events';
import styles from './allLatestDropdown.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  all: {
    id: 'AllLatestDropdown.allLaunches',
    defaultMessage: 'All launches',
  },
  latest: {
    id: 'AllLatestDropdown.latestLaunches',
    defaultMessage: 'Latest launches',
  },
  allShort: {
    id: 'AllLatestDropdown.allLaunchesShort',
    defaultMessage: 'All',
  },
  latestShort: {
    id: 'AllLatestDropdown.latestLaunchesShort',
    defaultMessage: 'Latest',
  },
});

@injectIntl
@track()
export class AllLatestDropdown extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    value: PropTypes.string,
    onChange: PropTypes.func,
    onClick: PropTypes.func,
    activeFilterId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  };

  static defaultProps = {
    value: ALL,
    onChange: () => {},
    onClick: () => {},
    activeFilterId: null,
  };

  constructor(props) {
    super(props);
    this.nodeRef = createRef();
  }

  state = {
    expanded: false,
  };

  componentDidMount() {
    document.addEventListener('click', this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  }

  getOptions = () => {
    const {
      intl: { formatMessage },
    } = this.props;
    return [
      {
        label: formatMessage(messages.all),
        shortLabel: formatMessage(messages.allShort),
        value: ALL,
      },
      {
        label: formatMessage(messages.latest),
        shortLabel: formatMessage(messages.latestShort),
        value: LATEST,
      },
    ];
  };

  handleClickOutside = (e) => {
    if (this.nodeRef.current && !this.nodeRef.current.contains(e.target) && this.state.expanded) {
      this.setState({ expanded: false });
    }
  };

  handleOptionClick = (value) => {
    switch (value) {
      case ALL:
        this.props.tracking.trackEvent(LAUNCHES_PAGE_EVENTS.SELECT_ALL_LAUNCHES);
        break;
      case LATEST:
        this.props.tracking.trackEvent(LAUNCHES_PAGE_EVENTS.SELECT_LATEST_LAUNCHES);
        break;
      default:
        break;
    }
    this.props.onChange(value);
    this.setState({ expanded: false });
  };

  handleCurrentOptionClick = () => {
    this.props.onClick(this.props.value);
  };

  toggleExpand = () => {
    !this.state.expanded &&
      this.props.tracking.trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_ALL_LAUNCHES_DROPDOWN);
    return this.setState({ expanded: !this.state.expanded });
  };

  isActive = () => this.props.activeFilterId === ALL || this.props.activeFilterId === LATEST;

  render() {
    const { value } = this.props;
    const options = this.getOptions();
    const currentOption = options.find((option) => option.value === value);
    const label = currentOption && currentOption.label;
    const shortLabel = currentOption && currentOption.shortLabel;
    return (
      <div ref={this.nodeRef} className={cx('all-latest-dropdown', { active: this.isActive() })}>
        <div className={cx('selected-value')}>
          <div
            className={cx('value', { active: this.isActive() })}
            onClick={this.handleCurrentOptionClick}
          >
            {label}
          </div>
          <div className={cx('value-short')} onClick={this.toggleExpand}>
            {shortLabel}
          </div>
          <div className={cx('arrow')} onClick={this.toggleExpand}>
            <div className={cx('separator')} />
            <div className={cx('icon', { active: this.isActive() })}>{Parser(ArrowDownIcon)}</div>
          </div>
        </div>
        {this.state.expanded && (
          <div className={cx('option-list')}>
            {options.map((option) => (
              <div
                key={option.value}
                className={cx('option', { selected: option.value === currentOption.value })}
                onClick={() => this.handleOptionClick(option.value)}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}
