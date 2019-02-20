import { Component } from 'react';
import track from 'react-tracking';
import { FILTERS_PAGE_EVENTS } from 'components/main/analytics/events';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { withModal, ModalLayout } from 'components/main/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import styles from './filterDeleteModal.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  deleteFilterHeader: {
    id: 'DeleteFilterDialog.deleteFilterHeader',
    defaultMessage: 'Delete filter',
  },
  deleteFilterText: {
    id: 'DeleteFilterDialog.deleteFilter',
    defaultMessage: "Are you sure to delete filter <b>'{name}'</b>? It will no longer exist.",
  },
});

@withModal('filterDeleteModal')
@injectIntl
@track()
export class FilterDeleteModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    data: PropTypes.shape({
      filter: PropTypes.object,
      onConfirm: PropTypes.func,
    }),
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    data: {
      filter: {},
      onConfirm: () => {},
    },
  };

  render() {
    const { intl, tracking } = this.props;
    const { filter, onConfirm } = this.props.data;
    const confirmAndClose = (closeModal) => {
      onConfirm();
      closeModal();
      tracking.trackEvent(FILTERS_PAGE_EVENTS.CLICK_DELETE_BTN_MODAL_DELETE_FILTER);
    };
    const okButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.DELETE),
      danger: true,
      onClick: confirmAndClose,
    };
    const cancelButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.CANCEL),
      eventInfo: FILTERS_PAGE_EVENTS.CLICK_CANCEL_BTN_MODAL_DELETE_FILTER,
    };
    return (
      <ModalLayout
        title={intl.formatMessage(messages.deleteFilterHeader)}
        okButton={okButton}
        cancelButton={cancelButton}
        closeIconEventInfo={FILTERS_PAGE_EVENTS.CLICK_CLOSE_ICON_MODAL_DELETE_FILTER}
      >
        <p className={cx('message')}>
          {Parser(intl.formatMessage(messages.deleteFilterText, { name: filter.name }))}
        </p>
      </ModalLayout>
    );
  }
}
