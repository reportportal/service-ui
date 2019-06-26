import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import Parser from 'html-react-parser';
import { showModalAction } from 'controllers/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import InfoIcon from 'common/img/info-inline.svg';
import CheckIcon from 'common/img/check-inline.svg';
import TrashIcon from 'common/img/trashcan-inline.svg';
import EditIcon from 'common/img/pencil-icon-inline.svg';
import styles from './connectionSection.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  connectionTitle: {
    id: 'ConnectionSection.connectionTitle',
    defaultMessage: 'Connection',
  },
  connectedMessage: {
    id: 'ConnectionSection.connectedMessage',
    defaultMessage: 'Connected',
  },
  connectionFailedMessage: {
    id: 'ConnectionSection.connectionFailedMessage',
    defaultMessage: 'Connection Failed',
  },
  removeIntegrationTitle: {
    id: 'ConnectionSection.removeIntegrationTitle',
    defaultMessage: 'Remove Integration',
  },
  editAuthorizationTitle: {
    id: 'ConnectionSection.editAuthorizationTitle',
    defaultMessage: 'Edit authorization',
  },
  removeIntegrationMessage: {
    id: 'ConnectionSection.removeIntegrationMessage',
    defaultMessage: 'Do you really want to remove the integration?',
  },
});

@connect(null, {
  showModalAction,
})
@injectIntl
export class ConnectionSection extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    showModalAction: PropTypes.func.isRequired,
    onRemoveIntegration: PropTypes.func.isRequired,
    blocked: PropTypes.bool,
    pluginPageType: PropTypes.bool,
    failedConnectionMessage: PropTypes.string,
    editAuthConfig: PropTypes.object,
  };

  static defaultProps = {
    blocked: false,
    failedConnectionMessage: null,
    editAuthConfig: null,
    pluginPageType: false,
  };

  removeIntegrationHandler = () => {
    const {
      intl: { formatMessage },
    } = this.props;

    this.props.showModalAction({
      id: 'confirmationModal',
      data: {
        message: formatMessage(messages.removeIntegrationMessage),
        onConfirm: this.props.onRemoveIntegration,
        title: formatMessage(messages.removeIntegrationTitle),
        confirmText: formatMessage(COMMON_LOCALE_KEYS.DELETE),
        cancelText: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
        dangerConfirm: true,
      },
    });
  };

  render() {
    const {
      intl: { formatMessage },
      blocked,
      editAuthConfig,
      failedConnectionMessage,
      pluginPageType,
    } = this.props;
    const isConnectionFailed = !!failedConnectionMessage;

    return (
      <div className={cx('connection-section')}>
        <h3 className={cx('block-header')}>{formatMessage(messages.connectionTitle)}</h3>
        <div className={cx('connection-status-block', { 'connection-failed': isConnectionFailed })}>
          <span className={cx('connection-status')}>
            <span className={cx('status-icon')}>
              {Parser(isConnectionFailed ? InfoIcon : CheckIcon)}
            </span>
            {formatMessage(
              isConnectionFailed ? messages.connectionFailedMessage : messages.connectedMessage,
            )}
          </span>
          {isConnectionFailed && (
            <span className={cx('failed-connection-message')}>{failedConnectionMessage}</span>
          )}
        </div>
        {editAuthConfig && (
          <Fragment>
            <div className={cx('connection-status-block', 'auth-info-block')}>
              {editAuthConfig.content}
            </div>
            {(!blocked || pluginPageType) && (
              <button className={cx('connection-block-button')} onClick={editAuthConfig.onClick}>
                <span className={cx('button-icon')}>{Parser(EditIcon)}</span>
                {formatMessage(messages.editAuthorizationTitle)}
              </button>
            )}
          </Fragment>
        )}
        {(!blocked || pluginPageType) && (
          <button className={cx('connection-block-button')} onClick={this.removeIntegrationHandler}>
            <span className={cx('button-icon')}>{Parser(TrashIcon)}</span>
            {formatMessage(messages.removeIntegrationTitle)}
          </button>
        )}
      </div>
    );
  }
}
