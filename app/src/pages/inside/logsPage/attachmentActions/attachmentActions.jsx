import React, { Component } from 'react';
import Parser from 'html-react-parser';
import { connect } from 'react-redux';
import track from 'react-tracking';
import { defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import {
  DOWNLOAD_ATTACHMENT_ACTION,
  downloadAttachmentAction,
  isFileActionAllowed,
  OPEN_ATTACHMENT_IN_BROWSER_ACTION,
  openAttachmentInBrowserAction,
} from 'controllers/log/attachments';
import OpenInIcon from 'common/img/open-in-inline.svg';
import DownloadIcon from 'common/img/download-inline.svg';
import styles from './attachmentActions.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  openInNewTab: {
    id: 'AttachmentActions.openInNewTab',
    defaultMessage: 'Open in new tab',
  },
  download: {
    id: 'AttachmentActions.download',
    defaultMessage: 'Download',
  },
});

@connect(null, {
  downloadAttachmentAction,
  openAttachmentInBrowserAction,
})
@track()
@injectIntl
export class AttachmentActions extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    value: PropTypes.object,
    className: PropTypes.string,
    downloadAttachmentAction: PropTypes.func,
    openAttachmentInBrowserAction: PropTypes.func,
    showCaptions: PropTypes.bool,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    events: PropTypes.object,
  };

  static defaultProps = {
    value: {},
    className: '',
    showCaptions: false,
    events: {},
  };

  constructor(props) {
    super(props);
    const {
      intl: { formatMessage },
      value,
    } = props;

    this.actionsConfig = [
      {
        id: OPEN_ATTACHMENT_IN_BROWSER_ACTION,
        icon: OpenInIcon,
        caption: formatMessage(messages.openInNewTab),
        action: this.openAttachmentInNewTab,
        hidden: !isFileActionAllowed(value.contentType, OPEN_ATTACHMENT_IN_BROWSER_ACTION),
      },
      {
        id: DOWNLOAD_ATTACHMENT_ACTION,
        icon: DownloadIcon,
        caption: formatMessage(messages.download),
        action: this.downloadAttachment,
        hidden: !isFileActionAllowed(value.contentType, DOWNLOAD_ATTACHMENT_ACTION),
      },
    ];
  }

  downloadAttachment = () => {
    const { events, tracking, value } = this.props;

    tracking.trackEvent(events.DOWNLOAD);
    this.props.downloadAttachmentAction(value);
  };

  openAttachmentInNewTab = () => {
    const { events, tracking, value } = this.props;

    tracking.trackEvent(events.OPEN_IN_NEW_TAB);
    this.props.openAttachmentInBrowserAction(value.id);
  };

  render() {
    const { className, showCaptions } = this.props;

    return (
      <div className={cx('attachment-actions', className)}>
        {this.actionsConfig.map(({ id, icon, hidden, action, caption }) => (
          <span
            key={id}
            title={caption}
            onClick={hidden ? null : action}
            className={cx('action-item', { hidden })}
          >
            <span className={cx('icon')}>{Parser(icon)}</span>
            {showCaptions && <span className={cx('caption')}>{caption}</span>}
          </span>
        ))}
      </div>
    );
  }
}
