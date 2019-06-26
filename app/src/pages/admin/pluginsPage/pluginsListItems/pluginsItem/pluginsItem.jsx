import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import {
  NOTIFICATION_GROUP_TYPE,
  BTS_GROUP_TYPE,
  OTHER_GROUP_TYPE,
  AUTHORIZATION_GROUP_TYPE,
  ANALYZER_GROUP_TYPE,
} from 'common/constants/pluginsGroupTypes';
import { INTEGRATIONS_IMAGES_MAP, INTEGRATION_NAMES_TITLES } from 'components/integrations';
import { InputSwitcher } from 'components/inputs/inputSwitcher';
import styles from './pluginsItem.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  titleBts: {
    id: 'PluginItem.titleBts',
    defaultMessage:
      'will be hidden on project settings. RP users won`t be able to post or link issue in BTS',
  },
  titleNotification: {
    id: 'PluginItem.titleNotification',
    defaultMessage:
      'will be hidden on project settings. RP users won`t be able to receive notification about test results',
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
export class PluginsItem extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    data: PropTypes.object.isRequired,
    onToggleActive: PropTypes.func.isRequired,
    showNotification: PropTypes.func,
    onClick: PropTypes.func,
  };

  static defaultProps = {
    showNotification: () => {},
    onClick: () => {},
  };

  state = {
    isEnabled: this.props.data.enabled,
  };

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

  itemClickHandler = () => this.props.onClick(this.props.data);

  render() {
    const {
      intl: { formatMessage },
      data: { name, uploadedBy, enabled, groupType, details: { version } = {} },
    } = this.props;

    return (
      <div
        className={cx('plugins-list-item')}
        title={
          !enabled
            ? `${INTEGRATION_NAMES_TITLES[name] || name} ${formatMessage(
                titleMessagesMap[groupType],
              )}`
            : ''
        }
      >
        <div className={cx('plugins-info-block')}>
          <img className={cx('plugins-image')} src={INTEGRATIONS_IMAGES_MAP[name]} alt={name} />
          <div className={cx('plugins-info')}>
            <span className={cx('plugins-name')} onClick={this.itemClickHandler}>
              {INTEGRATION_NAMES_TITLES[name] || name}
            </span>
            <span className={cx('plugins-author')}>{`by ${uploadedBy || 'Report Portal'}`}</span>
            <span className={cx('plugins-version')}>{`${version || ''}`}</span>
          </div>
        </div>
        <div className={cx('plugins-additional-block')}>
          <div className={cx('plugins-switcher')}>
            <InputSwitcher value={this.state.isEnabled} onChange={this.onToggleActiveHandler} />
          </div>
        </div>
      </div>
    );
  }
}
