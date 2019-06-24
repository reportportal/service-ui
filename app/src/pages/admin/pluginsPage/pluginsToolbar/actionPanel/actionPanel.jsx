import React, { Component } from 'react';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import { GhostButton } from 'components/buttons/ghostButton';
import UploadIcon from 'common/img/upload-inline.svg';

import { UPLOAD } from './constants';

import styles from './actionPanel.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  [UPLOAD]: {
    id: 'AllUsersPage.upload',
    defaultMessage: 'Upload',
  },
});

@injectIntl
export class ActionPanel extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  };

  renderHeaderButtons = () => {
    const {
      intl: { formatMessage },
    } = this.props;
    const ACTION_BUTTONS = [
      {
        key: UPLOAD,
        icon: UploadIcon,
        onClick: () => {},
      },
    ];
    return (
      <div className={cx('action-buttons')}>
        {ACTION_BUTTONS.map(({ key, icon, onClick }) => (
          <div className={cx('action-button')} key={key}>
            <GhostButton
              icon={icon}
              onClick={onClick}
              title={'Waiting for implementation'}
              disabled
            >
              {formatMessage(messages[key])}
            </GhostButton>
          </div>
        ))}
      </div>
    );
  };

  render() {
    return this.renderHeaderButtons();
  }
}
