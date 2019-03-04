import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, defineMessages } from 'react-intl';
import { activeProjectSelector } from 'controllers/user';
import { ModalLayout, withModal } from 'components/main/modal';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';

const messages = defineMessages({
  unlinkButton: {
    id: 'UnlinkIssueModal.unlinkButton',
    defaultMessage: 'Unlink',
  },
  title: {
    id: 'UnlinkIssueModal.title',
    defaultMessage: 'Unlink issue',
  },
  unlinkModalConfirmationText: {
    id: 'UnlinkIssueModal.unlinkModalConfirmationText',
    defaultMessage: 'Are you sure to unlink issue/s for test items?',
  },
  unlinkSuccessMessage: {
    id: 'UnlinkIssueModal.unlinkSuccessMessage',
    defaultMessage: 'Completed successfully!',
  },
});

@withModal('unlinkIssueModal')
@injectIntl
@connect(
  (state) => ({
    url: URLS.testItems(activeProjectSelector(state)),
  }),
  {
    showNotification,
  },
)
export class UnlinkIssueModal extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    url: PropTypes.string.isRequired,
    showNotification: PropTypes.func.isRequired,
    data: PropTypes.shape({
      items: PropTypes.array,
      fetchFunc: PropTypes.func,
    }).isRequired,
  };

  onUnlink = (closeModal) => {
    const {
      intl,
      url,
      data: { items, fetchFunc },
    } = this.props;
    const issues = items.map((item) => ({
      testItemId: item.id,
      issue: {
        ...item.issue,
        externalSystemIssues: [],
      },
    }));
    fetch(url, {
      method: 'put',
      data: {
        issues,
      },
    }).then(() => {
      fetchFunc();
      this.props.showNotification({
        message: intl.formatMessage(messages.unlinkSuccessMessage),
        type: NOTIFICATION_TYPES.SUCCESS,
      });
    });
    closeModal();
  };

  render() {
    const { intl } = this.props;
    const okButton = {
      text: intl.formatMessage(messages.unlinkButton),
      onClick: this.onUnlink,
    };
    const cancelButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    };
    return (
      <ModalLayout
        title={intl.formatMessage(messages.title)}
        okButton={okButton}
        cancelButton={cancelButton}
      >
        {intl.formatMessage(messages.unlinkModalConfirmationText)}
      </ModalLayout>
    );
  }
}
