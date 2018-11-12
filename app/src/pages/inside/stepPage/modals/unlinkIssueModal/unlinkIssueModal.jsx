import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, defineMessages } from 'react-intl';
import { activeProjectSelector } from 'controllers/user';
import { ModalLayout, withModal } from 'components/main/modal';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { fetchAPI } from 'common/utils';
import { tokenSelector } from 'controllers/auth';
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
    token: tokenSelector(state),
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
    token: PropTypes.string.isRequired,
  };

  onUnlink = (closeModal) => {
    const {
      intl,
      url,
      data: { items, fetchFunc },
    } = this.props;
    const issues = items.map((item) => ({
      test_item_id: item.id,
      issue: {
        ...item.issue,
        externalSystemIssues: [],
      },
    }));
    fetchAPI(url, this.props.token, {
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
