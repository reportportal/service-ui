import React, { Component } from 'react';
import track from 'react-tracking';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { showModalAction } from 'controllers/modal';
import { GhostButton } from 'components/buttons/ghostButton';
import { SETTINGS_PAGE_EVENTS } from 'components/main/analytics/events';
import PlusIcon from 'common/img/plus-button-inline.svg';
import { DEFAULT_CASE_CONFIG } from '../constants';
import { convertNotificationCaseForSubmission } from '../utils';

const messages = defineMessages({
  addNewRuleButton: {
    id: 'AddNewCaseButton.addNewRuleButton',
    defaultMessage: 'Add New Rule',
  },
});

@injectIntl
@connect(null, {
  showModal: showModalAction,
})
@track()
export class AddNewCaseButton extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    showModal: PropTypes.func,
    updateNotificationCases: PropTypes.func,
    cases: PropTypes.array,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    disabled: PropTypes.bool,
  };

  static defaultProps = {
    showModal: () => {},
    updateNotificationCases: () => {},
    cases: [],
    disabled: false,
  };

  confirmAddCase = (data) => {
    const { cases: oldCases, updateNotificationCases } = this.props;
    const cases = [...oldCases, data].map(convertNotificationCaseForSubmission);
    updateNotificationCases({ cases });
  };

  addNotificationCase = () => {
    const { showModal } = this.props;
    this.props.tracking.trackEvent(SETTINGS_PAGE_EVENTS.ADD_RULE_BTN_NOTIFICATIONS);
    showModal({
      id: 'addEditNotificationCaseModal',
      data: {
        onConfirm: this.confirmAddCase,
        notificationCase: DEFAULT_CASE_CONFIG,
        isNewCase: true,
      },
    });
  };

  render() {
    const { intl, disabled } = this.props;

    return (
      <GhostButton
        mobileDisabled
        icon={PlusIcon}
        onClick={this.addNotificationCase}
        disabled={disabled}
      >
        {intl.formatMessage(messages.addNewRuleButton)}
      </GhostButton>
    );
  }
}
