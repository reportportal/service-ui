/*
 * Copyright 2023 EPAM Systems
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

import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { defineMessages, useIntl } from 'react-intl';
import track from 'react-tracking';
import classNames from 'classnames/bind';
import { GhostButton } from 'components/buttons/ghostButton';
import { withTooltip } from 'components/main/tooltips/tooltip';
import { PROFILE_PAGE_EVENTS } from 'components/main/analytics/events';
import { showModalAction } from 'controllers/modal';
import { isAdminSelector } from 'controllers/user';
import { instanceTypeSelector } from 'controllers/appInfo/selectors';
import { EPAM } from 'controllers/appInfo/constants';
import styles from './deleteAccountBlock.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  deleteAccountButton: {
    id: 'DeleteAccountBlock.deleteAccount',
    defaultMessage: 'Delete account',
  },
  tooltipText: {
    id: 'DeleteAccountBlock.tooltipText',
    defaultMessage:
      'Only users with non-admin role can delete their account.\nAlternatively, other admin can do it.',
  },
});

const Button = ({ onClick, formatMessage, disabled }) => (
  <GhostButton
    onClick={onClick}
    transparentBorder
    transparentBackground
    transparentBorderHover
    color="red"
    style={{ opacity: disabled ? 0.5 : 1 }}
    disabled={disabled}
  >
    {formatMessage(messages.deleteAccountButton)}
  </GhostButton>
);
Button.propTypes = {
  formatMessage: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
  onClick: PropTypes.func,
};
Button.propTypes = {
  onClick: () => {},
};
const TooltipContent = ({ formatMessage }) => (
  <div className={cx('tooltip-content')}>{formatMessage(messages.tooltipText)}</div>
);
TooltipContent.propTypes = {
  formatMessage: PropTypes.func.isRequired,
};

const ButtonWithTooltip = withTooltip({
  TooltipComponent: TooltipContent,
  data: {
    align: 'top',
    dark: true,
  },
})(Button);

export const DeleteAccountBlock = track()(({ tracking }) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const isAdmin = useSelector(isAdminSelector);
  const instanceType = useSelector(instanceTypeSelector);

  const onDeleteAccountClick = () => {
    const { trackEvent } = tracking;
    trackEvent(PROFILE_PAGE_EVENTS.CLICK_DELETE_ACCOUNT);

    if (instanceType === EPAM) {
      dispatch(showModalAction({ id: 'deleteAccountModal' }));
    } else {
      dispatch(showModalAction({ id: 'deleteAccountFeedbackModal' }));
    }
  };

  return (
    <div className={cx('delete-account-block')}>
      {isAdmin ? (
        <ButtonWithTooltip formatMessage={formatMessage} disabled />
      ) : (
        <Button onClick={onDeleteAccountClick} formatMessage={formatMessage} />
      )}
    </div>
  );
});
DeleteAccountBlock.propTypes = {
  tracking: PropTypes.shape({
    trackEvent: PropTypes.func,
    getTrackingData: PropTypes.func,
  }).isRequired,
};
