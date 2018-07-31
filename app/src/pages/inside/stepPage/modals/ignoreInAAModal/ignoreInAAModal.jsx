import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages } from 'react-intl';
import Parser from 'html-react-parser';
import { withModal } from 'controllers/modal/withModal';
import { ModalLayout } from 'components/main/modal';
import { activeProjectSelector } from 'controllers/user';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import styles from './ignoreInAAModal.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  ignoreButton: {
    id: 'IgnoreInAAModal.ignoreButton',
    defaultMessage: 'Ignore',
  },
  title: {
    id: 'IgnoreInAAModal.title',
    defaultMessage: 'Ignore item in auto-analysis',
  },
  titleMultiple: {
    id: 'IgnoreInAAModal.titleMultiple',
    defaultMessage: 'Ignore items in auto-analysis',
  },
  text: {
    id: 'IgnoreInAAModal.text',
    defaultMessage: 'Are you sure to ignore item <b>{name}</b> in Auto-Analysis?',
  },
  textMultiple: {
    id: 'IgnoreInAAModal.textMultiple',
    defaultMessage: 'Are you sure to ignore items in Auto-Analysis?',
  },
  successMessage: {
    id: 'IgnoreInAAModal.successMessage',
    defaultMessage: 'Item was successfully ignored in Auto-Analysis',
  },
  successMessageMultiple: {
    id: 'IgnoreInAAModal.successMessageMultiple',
    defaultMessage: 'Items were successfully ignored in Auto-Analysis',
  },
});

@withModal('ignoreInAAModal')
@injectIntl
@connect(
  (state) => ({
    activeProject: activeProjectSelector(state),
  }),
  {
    showNotification,
  },
)
export class IgnoreInAAModal extends Component {
  static propTypes = {
    activeProject: PropTypes.string.isRequired,
    showNotification: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
    data: PropTypes.shape({
      items: PropTypes.array,
      fetchFunc: PropTypes.func,
    }).isRequired,
  };

  onIgnore = (closeModal) => {
    const {
      activeProject,
      data: { items, fetchFunc },
    } = this.props;
    const issues = items.map((item) => ({
      test_item_id: item.id,
      issue: {
        ...item.issue,
        ignoreAnalyzer: true,
      },
    }));
    fetch(URLS.testItems(activeProject), {
      method: 'put',
      data: {
        issues,
      },
    }).then(() => {
      fetchFunc();
      this.props.showNotification({
        message: this.getSuccessText(),
        type: NOTIFICATION_TYPES.SUCCESS,
      });
      closeModal();
    });
  };

  getModalTitle = () => {
    const {
      intl,
      data: { items },
    } = this.props;
    return items.length === 1
      ? intl.formatMessage(messages.title)
      : intl.formatMessage(messages.titleMultiple);
  };

  getModalText = () => {
    const {
      intl,
      data: { items },
    } = this.props;
    return items.length === 1
      ? Parser(intl.formatMessage(messages.text, { name: items[0].name }))
      : intl.formatMessage(messages.textMultiple);
  };

  getSuccessText = () => {
    const {
      intl,
      data: { items },
    } = this.props;
    return items.length === 1
      ? intl.formatMessage(messages.successMessage)
      : intl.formatMessage(messages.successMessageMultiple);
  };

  render() {
    const { intl } = this.props;
    const okButton = {
      text: intl.formatMessage(messages.ignoreButton),
      onClick: this.onIgnore,
      danger: true,
    };
    const cancelButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    };
    return (
      <ModalLayout
        className={cx('message')}
        title={this.getModalTitle()}
        okButton={okButton}
        cancelButton={cancelButton}
      >
        {this.getModalText()}
      </ModalLayout>
    );
  }
}
