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
import { defineMessages, injectIntl, intlShape, FormattedMessage } from 'react-intl';
import {
  NOTIFICATION_GROUP_TYPE,
  BTS_GROUP_TYPE,
  OTHER_GROUP_TYPE,
  AUTHORIZATION_GROUP_TYPE,
  ANALYZER_GROUP_TYPE,
} from 'common/constants/pluginsGroupTypes';
import { InputSwitcher } from 'components/inputs/inputSwitcher';
import styles from './infoSection.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  showMore: {
    id: 'InfoSection.showMore',
    defaultMessage: 'Show more',
  },
  version: {
    id: 'InfoSection.version',
    defaultMessage: 'version',
  },
  titleBts: {
    id: 'PluginItem.titleBts',
    defaultMessage:
      'will be hidden on project settings. RP users won`t be able to post or link issue in BTS',
  },
  titleNotification: {
    id: 'PluginItem.titleNotification',
    defaultMessage:
      'will be hidden on project settings. RP users can not get notifications and send invitations for new users',
  },
  titleOthers: {
    id: 'PluginItem.titleOthers',
    defaultMessage: 'will be hidden on project settings',
  },
});

const titleMessagesMap = {
  [BTS_GROUP_TYPE]: messages.titleBts,
  [NOTIFICATION_GROUP_TYPE]: messages.titleNotification,
  [OTHER_GROUP_TYPE]: messages.titleOthers,
  [AUTHORIZATION_GROUP_TYPE]: messages.titleOthers,
  [ANALYZER_GROUP_TYPE]: messages.titleOthers,
};

@injectIntl
export class InfoSection extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    image: PropTypes.string.isRequired,
    description: PropTypes.object.isRequired,
    title: PropTypes.string.isRequired,
    version: PropTypes.string,
    data: PropTypes.object.isRequired,
    onToggleActive: PropTypes.func,
    isGlobal: PropTypes.bool,
  };

  static defaultProps = {
    version: '',
    onToggleActive: () => {},
    isGlobal: false,
  };

  state = {
    withShowMore: false,
    expanded: false,
    isEnabled: this.props.data.enabled,
  };

  componentDidMount() {
    this.checkIfTheExpandButtonNeeded();
  }

  onToggleActiveHandler = () => {
    this.setState({
      isEnabled: !this.props.data.enabled,
    });

    this.props.onToggleActive(this.props.data).catch(() => {
      this.setState({
        isEnabled: this.props.data.enabled,
      });
    });
  };

  checkIfTheExpandButtonNeeded = () => {
    const descriptionHeight = parseInt(
      window.getComputedStyle(this.descriptionRef.current).height,
      10,
    );

    if (descriptionHeight > 60) {
      this.setState({
        withShowMore: true,
        expanded: false,
      });
    }
  };

  descriptionRef = React.createRef();

  expandDescription = () =>
    this.setState({
      expanded: true,
    });

  render() {
    const {
      intl: { formatMessage },
      data: { groupType },
      title,
      image,
      version,
      description,
      isGlobal,
    } = this.props;
    const { expanded, withShowMore, isEnabled } = this.state;
    const isPartiallyShown = withShowMore && !expanded;

    return (
      <div className={cx('info-section')}>
        <img className={cx('logo')} src={image} alt={title} />
        <div className={cx('description-block')}>
          <h2 className={cx('title')}>{title}</h2>
          {version && (
            <span className={cx('version')}>{`${formatMessage(messages.version)} ${version}`}</span>
          )}
          {isGlobal && (
            <div className={cx('switcher-block')}>
              <span className={cx('switcher-status')}>
                {isEnabled ? (
                  <FormattedMessage id={'Common.on'} defaultMessage={'On'} />
                ) : (
                  <FormattedMessage id={'Common.off'} defaultMessage={'Off'} />
                )}
              </span>
              <div
                className={cx('switcher')}
                title={!isEnabled ? `${title} ${formatMessage(titleMessagesMap[groupType])}` : ''}
              >
                <InputSwitcher value={isEnabled} onChange={this.onToggleActiveHandler} />
              </div>
            </div>
          )}
          <p
            ref={this.descriptionRef}
            className={cx('description', { 'partially-shown': isPartiallyShown })}
          >
            {description}
          </p>
          {isPartiallyShown && (
            <button className={cx('expand-button')} onClick={this.expandDescription}>
              {formatMessage(messages.showMore)}
            </button>
          )}
        </div>
      </div>
    );
  }
}
