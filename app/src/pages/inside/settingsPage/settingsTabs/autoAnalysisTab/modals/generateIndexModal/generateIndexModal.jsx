import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { fetchProjectAction } from 'controllers/project';
import { activeProjectSelector } from 'controllers/user';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import classNames from 'classnames/bind';
import { withModal, ModalLayout } from 'components/main/modal';
import { URLS } from 'common/urls';
import { fetchAPI } from 'common/utils';
import { tokenSelector } from 'controllers/auth';
import styles from './generateIndexModal.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  generateIndexHeader: {
    id: 'GenerateIndexModal.headerGenerateIndexModal',
    defaultMessage: 'Generate index',
  },
  contentHeaderMessage: {
    id: 'GenerateIndexModal.contentHeaderMessage',
    defaultMessage: 'Are you sure to generate index in the ElasticSearch?',
  },
  noteBlockTitle: {
    id: 'GenerateIndexModal.noteBlockTitle',
    defaultMessage: 'Note:',
  },
  noteBlockText: {
    id: 'GenerateIndexModal.noteBlockText',
    defaultMessage: 'You will receive an e-mail after the end of the process.',
  },
  generateButtonText: {
    id: 'GenerateIndexModal.generateButtonText',
    defaultMessage: 'Generate',
  },
  generateSuccessNotification: {
    id: 'GenerateIndexModal.generateSuccessNotification',
    defaultMessage: 'Index generation is in progress',
  },
  generateErrorNotification: {
    id: 'GenerateIndexModal.generateErrorNotification',
    defaultMessage: 'Index generation was canceled',
  },
});

@withModal('generateIndexModal')
@connect(
  (state) => ({
    projectId: activeProjectSelector(state),
    token: tokenSelector(state),
  }),
  {
    fetchProjectAction,
    showNotification,
  },
)
@injectIntl
export class GenerateIndexModal extends Component {
  static propTypes = {
    intl: intlShape,
    projectId: PropTypes.string,
    fetchProjectAction: PropTypes.func.isRequired,
    showNotification: PropTypes.func,
    token: PropTypes.string.isRequired,
  };
  static defaultProps = {
    intl: {},
    projectId: '',
    fetchProjectAction: () => {},
    showNotification: () => {},
  };

  onClickGenerate = (closeModal) => {
    fetchAPI(URLS.projectIndex(this.props.projectId), this.props.token, { method: 'put' })
      .then(() => {
        this.props.showNotification({
          message: this.props.intl.formatMessage(messages.generateSuccessNotification),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
        this.props.fetchProjectAction(this.props.projectId);
      })
      .catch(() => {
        this.props.showNotification({
          message: this.props.intl.formatMessage(messages.generateErrorNotification),
          type: NOTIFICATION_TYPES.ERROR,
        });
      });
    closeModal();
  };

  render() {
    const okButton = {
      text: this.props.intl.formatMessage(messages.generateButtonText),
      onClick: this.onClickGenerate,
    };
    const cancelButton = {
      text: this.props.intl.formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    };

    return (
      <ModalLayout
        title={this.props.intl.formatMessage(messages.generateIndexHeader)}
        okButton={okButton}
        cancelButton={cancelButton}
      >
        <p className={cx('modal-content-header')}>
          {this.props.intl.formatMessage(messages.contentHeaderMessage)}
        </p>
        <div className={cx('note-block')}>
          <p className={cx('note-title')}>
            {this.props.intl.formatMessage(messages.noteBlockTitle)}
          </p>
          <p className={cx('note-text')}>{this.props.intl.formatMessage(messages.noteBlockText)}</p>
        </div>
      </ModalLayout>
    );
  }
}
