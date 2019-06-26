import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import {
  NOTIFICATION_GROUP_TYPE,
  BTS_GROUP_TYPE,
  OTHER_GROUP_TYPE,
  AUTHORIZATION_GROUP_TYPE,
  ANALYZER_GROUP_TYPE,
} from 'common/constants/pluginsGroupTypes';
import { updatePluginLocallyAction } from 'controllers/plugins';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { INTEGRATIONS_IMAGES_MAP, INTEGRATION_NAMES_TITLES } from 'components/integrations';
import { InputSwitcher } from 'components/inputs/inputSwitcher';
import styles from './pluginsItem.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  disabledPluginMessage: {
    id: 'PluginItem.disabledPluginMessage',
    defaultMessage: 'Plugin has been disabled',
  },
  enabledPluginMessage: {
    id: 'PluginItem.enabledPluginMessage',
    defaultMessage: 'Plugin has been enabled',
  },
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
@connect(null, {
  showNotification,
  updatePluginLocallyAction,
})
export class PluginsItem extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    data: PropTypes.object.isRequired,
    showNotification: PropTypes.func,
    updatePluginLocallyAction: PropTypes.func.isRequired,
  };

  static defaultProps = {
    showNotification: () => {},
  };

  state = {
    isEnabled: this.props.data.enabled,
  };

  onToggleActive = () => {
    const {
      intl: { formatMessage },
      data,
    } = this.props;
    const toggleActive = !data.enabled;

    this.setState({
      isEnabled: toggleActive,
    });

    fetch(URLS.pluginUpdate(data.type), {
      method: 'PUT',
      data: {
        enabled: toggleActive,
      },
    })
      .then(() => {
        const plugin = {
          ...data,
          enabled: toggleActive,
        };

        this.props.updatePluginLocallyAction(plugin);
        this.props.showNotification({
          type: NOTIFICATION_TYPES.SUCCESS,
          message: toggleActive
            ? formatMessage(messages.enabledPluginMessage)
            : formatMessage(messages.disabledPluginMessage),
        });
      })
      .catch(() => {
        this.setState({
          isEnabled: !toggleActive,
        });
      });
  };

  render() {
    const {
      intl: { formatMessage },
      data: { name, uploadedBy, version, enabled, groupType },
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
            <span className={cx('plugins-name')}>{INTEGRATION_NAMES_TITLES[name] || name}</span>
            <span className={cx('plugins-author')}>{`by ${uploadedBy || 'Report Portal'}`}</span>
            <span className={cx('plugins-version')}>{`${version || ''}`}</span>
          </div>
        </div>
        <div className={cx('plugins-additional-block')}>
          <div className={cx('plugins-switcher')}>
            <InputSwitcher value={this.state.isEnabled} onChange={this.onToggleActive} />
          </div>
        </div>
      </div>
    );
  }
}
