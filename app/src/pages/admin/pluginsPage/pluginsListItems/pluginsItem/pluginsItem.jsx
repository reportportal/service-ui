import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
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
});

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

  onToggleActive = () => {
    const {
      intl: { formatMessage },
      data,
    } = this.props;
    const toggleActive = !data.enabled;

    fetch(URLS.pluginUpdate(data.type), {
      method: 'PUT',
      data: {
        enabled: toggleActive,
      },
    }).then(() => {
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
    });
  };

  render() {
    const {
      data: { name, uploadedBy, version, enabled },
    } = this.props;

    return (
      <div className={cx('plugins-list-item')}>
        <div className={cx('plugins-info-block')}>
          <img className={cx('plugins-image')} src={INTEGRATIONS_IMAGES_MAP[name]} alt={name} />
          <div className={cx('plugins-info')}>
            <span className={cx('plugins-name')}>{INTEGRATION_NAMES_TITLES[name] || name}</span>
            <span className={cx('plugins-author')}>{`by ${uploadedBy || 'Report Portal'}`}</span>
            <span className={cx('plugins-version')}>{`${version || ''}`}</span>
          </div>
        </div>
        <div className={cx('plugins-additional-block')}>
          <div className={cx('plugins-switcher')} title={!enabled ? 'Plugin is disabled' : ''}>
            <InputSwitcher value={enabled} onChange={this.onToggleActive} />
          </div>
        </div>
      </div>
    );
  }
}
