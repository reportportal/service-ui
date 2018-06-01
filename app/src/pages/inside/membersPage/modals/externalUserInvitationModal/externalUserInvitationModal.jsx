import React, { Component } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { withModal, ModalLayout, ModalField } from 'components/main/modal';
import { Input } from 'components/inputs/input';
import classNames from 'classnames/bind';
import styles from './externalUserInvitationModal.scss';

const cx = classNames.bind(styles);
const LABEL_WIDTH = 105;
const messages = defineMessages({
  headerExternalUserInvitationModal: {
    id: 'ExternalUserInvitationModal.header',
    defaultMessage: 'Invite user',
  },
  description: {
    id: 'ExternalUserInvitationModal.description',
    defaultMessage: 'Invite user to the project',
  },
  copyLink: {
    id: 'ExternalUserInvitationModal.copyLink',
    defaultMessage: 'Copy link',
  },
  email: {
    id: 'ExternalUserInvitationModal.email',
    defaultMessage: 'The invitation was sent on',
  },
  link: {
    id: 'ExternalUserInvitationModal.link',
    defaultMessage: 'Link to invitation',
  },
});

@withModal('externalUserInvitationModal')
@injectIntl
export class ExternalUserInvitationModal extends Component {
  static propTypes = {
    intl: intlShape,
    data: PropTypes.shape({
      email: PropTypes.string,
      link: PropTypes.string,
    }).isRequired,
  };
  static defaultProps = {
    intl: {},
  };
  state = {
    copied: false,
  };
  onClickCopyLink = () => {
    this.inputLink.select();
    this.setState({ copied: true });
  };
  render() {
    const { intl, data } = this.props;
    const okButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.OK),
      onClick: (closeModal) => {
        closeModal();
      },
    };
    return (
      <ModalLayout
        title={intl.formatMessage(messages.headerExternalUserInvitationModal)}
        okButton={okButton}
      >
        <p className={cx('modal-description')}>{intl.formatMessage(messages.description)}</p>
        <div className={cx('external-user-content')}>
          <ModalField label={intl.formatMessage(messages.email)} labelWidth={LABEL_WIDTH}>
            <p className={cx('link')}>{data.email}</p>
          </ModalField>
          <ModalField label={intl.formatMessage(messages.link)} labelWidth={LABEL_WIDTH}>
            <Input
              readonly
              value={data.link}
              refFunction={(node) => {
                this.inputLink = node;
              }}
            />
          </ModalField>
          <CopyToClipboard text={data.link} onCopy={this.onClickCopyLink} className={cx('copy')}>
            <span>{intl.formatMessage(messages.copyLink)}</span>
          </CopyToClipboard>
        </div>
      </ModalLayout>
    );
  }
}
