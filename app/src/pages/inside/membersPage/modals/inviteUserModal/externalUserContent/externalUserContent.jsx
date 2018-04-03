import React, { Component } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { ModalField } from 'components/main/modal';
import { Input } from 'components/inputs/input';
import classNames from 'classnames/bind';
import styles from './externalUserContent.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  copyLink: {
    id: 'ExternalUserContent.copyLink',
    defaultMessage: 'Copy link',
  },
  email: {
    id: 'ExternalUserContent.email',
    defaultMessage: 'The invitation was sent on',
  },
  link: {
    id: 'ExternalUserContent.link',
    defaultMessage: 'Link to invitation',
  },
});

@injectIntl
export class ExternalUserContent extends Component {
  static propTypes = {
    intl: intlShape,
    email: PropTypes.string,
    link: PropTypes.string,
  };
  static defaultProps = {
    intl: {},
    email: '',
    link: '',
  };
  state = {
    copied: false,
  };
  onClickCopyLink = () => {
    this.inputLink.select();
    this.setState({ copied: true });
  };
  render() {
    const { intl, email, link } = this.props;
    return (
      <div className={cx('external-user-content')}>
        <ModalField label={intl.formatMessage(messages.email)} labelWidth="105" inputWidth="350">
          <p className={cx('link')}>{email}</p>
        </ModalField>
        <ModalField label={intl.formatMessage(messages.link)} labelWidth="105" inputWidth="350">
          <Input
            readonly
            value={link}
            refFunction={(node) => {
              this.inputLink = node;
            }}
          />
        </ModalField>
        <CopyToClipboard text={link} onCopy={this.onClickCopyLink} className={cx('copy')}>
          <span>{intl.formatMessage(messages.copyLink)}</span>
        </CopyToClipboard>
      </div>
    );
  }
}
