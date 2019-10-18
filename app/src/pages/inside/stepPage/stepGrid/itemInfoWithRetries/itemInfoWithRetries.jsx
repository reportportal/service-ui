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
import { STEP_PAGE_EVENTS } from 'components/main/analytics/events';
import { ItemInfo } from 'pages/inside/common/itemInfo';
import { RetriesBlock } from './retriesBlock';
import styles from './itemInfoWithRetries.scss';

const cx = classNames.bind(styles);

@track()
export class ItemInfoWithRetries extends Component {
  static propTypes = {
    expanded: PropTypes.bool,
    value: PropTypes.object.isRequired,
    toggleExpand: PropTypes.func.isRequired,
    refFunction: PropTypes.func.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    expanded: false,
  };

  constructor(props) {
    super(props);

    this.retriesNode = createRef();
  }

  state = {
    retriesVisible: false,
  };

  getRetries = () => [...this.props.value.retries, this.props.value];

  isRetriesVisible = () =>
    this.state.retriesVisible && this.props.value.retries && this.props.value.retries.length > 0;

  showRetries = () => {
    if (!this.props.expanded) {
      this.props.tracking.trackEvent(STEP_PAGE_EVENTS.RETRIES_BTN_CLICK);
      this.props.toggleExpand();
    }
    this.setState({ retriesVisible: true }, () => {
      if (this.retriesNode.current) {
        this.retriesNode.current.scrollIntoView({ block: 'start', behavior: 'smooth' });
      }
    });
  };

  render() {
    const { refFunction, ...rest } = this.props;
    return (
      <div
        ref={refFunction}
        className={cx('item-info-with-retries', { collapsed: !rest.expanded })}
      >
        <ItemInfo onClickRetries={this.showRetries} {...rest} />
        {this.isRetriesVisible() && (
          <RetriesBlock
            ref={this.retriesNode}
            testItemId={this.props.value.id}
            retries={this.getRetries()}
            collapsed={!rest.expanded}
          />
        )}
      </div>
    );
  }
}
