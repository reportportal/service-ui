import { Component } from 'react';
import track from 'react-tracking';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { injectIntl, intlShape } from 'react-intl';
import { withModal, ModalLayout } from 'components/main/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import styles from './deleteItemsModal.scss';

const cx = classNames.bind(styles);

@withModal('deleteItemsModal')
@injectIntl
@track()
export class DeleteItemsModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    data: PropTypes.shape({
      onConfirm: PropTypes.func,
      items: PropTypes.array,
      header: PropTypes.string,
      mainContent: PropTypes.string,
      namespace: PropTypes.string,
      currentLaunch: PropTypes.object,
      eventsInfo: PropTypes.object,
    }),
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    data: {
      items: [],
      onConfirm: () => {},
      eventsInfo: {},
    },
  };
  confirmAndClose = (closeModal) => {
    this.props.tracking.trackEvent(this.props.data.eventsInfo.deleteBtn);
    this.props.data.onConfirm(this.props.data.items);
    closeModal();
  };

  render() {
    const { intl } = this.props;
    const { header, mainContent, eventsInfo } = this.props.data;
    const okButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.DELETE),
      danger: true,
      onClick: this.confirmAndClose,
      eventInfo: eventsInfo.cancelBtn,
    };
    const cancelButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.CANCEL),
      eventInfo: eventsInfo.cancelBtn,
    };
    return (
      <ModalLayout
        title={header}
        okButton={okButton}
        cancelButton={cancelButton}
        closeIconEventInfo={eventsInfo.closeIcon}
      >
        <p className={cx('message')}>{Parser(mainContent)}</p>
      </ModalLayout>
    );
  }
}
