import { Component } from 'react';
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
export class DeleteItemsModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    data: PropTypes.shape({
      onConfirm: PropTypes.func,
      items: PropTypes.array,
      header: PropTypes.string,
      mainContent: PropTypes.string,
      warning: PropTypes.string,
      userId: PropTypes.string,
      namespace: PropTypes.string,
      currentLaunch: PropTypes.object,
    }),
  };

  static defaultProps = {
    data: {
      items: [],
      onConfirm: () => {},
    },
  };
  confirmAndClose = (closeModal) => {
    this.props.data.onConfirm(this.props.data.items);
    closeModal();
  };

  isWarningNeed = () =>
    this.props.data.items.find(
      (item) =>
        (item.owner && item.owner !== this.props.data.userId) ||
        (this.props.data.currentLaunch &&
          this.props.data.currentLaunch.owner !== this.props.data.userId),
    );

  render() {
    const { intl } = this.props;
    const { header, mainContent, warning } = this.props.data;
    const okButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.DELETE),
      danger: true,
      onClick: this.confirmAndClose,
    };
    const cancelButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    };
    return (
      <ModalLayout
        title={header}
        okButton={okButton}
        cancelButton={cancelButton}
        warningMessage={this.isWarningNeed() ? warning : null}
      >
        <p className={cx('message')}>{Parser(mainContent)}</p>
      </ModalLayout>
    );
  }
}
