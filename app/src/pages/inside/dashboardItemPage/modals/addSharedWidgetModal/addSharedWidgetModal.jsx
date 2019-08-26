import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { activeProjectSelector } from 'controllers/user';
import { withModal, ModalLayout } from 'components/main/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { showScreenLockAction } from 'controllers/screenLock';
import { getDefaultWidgetConfig } from '../common/utils';
import { SharedWidgetInfoSection } from './sharedWidgetInfoSection';
import { SharedWidgetsListSection } from './sharedWidgetsListSection';
import styles from './addSharedWidgetModal.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  headerText: {
    id: 'AddSharedWidgetModal.headerText',
    defaultMessage: 'Add shared widget',
  },
});

@withModal('addSharedWidgetModal')
@connect(
  (state) => ({
    projectId: activeProjectSelector(state),
  }),
  {
    showScreenLockAction,
  },
)
@injectIntl
export class AddSharedWidgetModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    showScreenLockAction: PropTypes.func.isRequired,
    data: PropTypes.shape({
      onConfirm: PropTypes.func,
      currentDashboard: PropTypes.object,
    }),
    projectId: PropTypes.string,
  };

  static defaultProps = {
    data: {
      onConfirm: () => {},
      currentDashboard: {},
    },
    projectId: '',
  };

  state = {
    selectedWidget: null,
  };

  onSelectWidget = (selectedWidget) => this.setState({ selectedWidget });

  onAdd = (closeModal) => {
    const {
      data: { onConfirm },
    } = this.props;
    const { widgetType, id } = this.state.selectedWidget;
    this.props.showScreenLockAction();
    const widget = {
      widgetId: id,
      ...getDefaultWidgetConfig(widgetType),
    };
    onConfirm(widget, closeModal);
  };

  getCloseConfirmationConfig = () => {
    if (!this.state.selectedWidget) {
      return null;
    }
    return {
      confirmationWarning: this.props.intl.formatMessage(COMMON_LOCALE_KEYS.CLOSE_MODAL_WARNING),
      confirmationWarningClassName: cx('confirmation-wrapper'),
    };
  };

  render() {
    const {
      intl: { formatMessage },
      projectId,
      data: { currentDashboard },
    } = this.props;
    const okButton = {
      text: formatMessage(COMMON_LOCALE_KEYS.ADD),
      onClick: this.onAdd,
      disabled: !this.state.selectedWidget,
    };
    const cancelButton = {
      text: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    };

    return (
      <ModalLayout
        title={formatMessage(messages.headerText)}
        okButton={okButton}
        cancelButton={cancelButton}
        className={cx('add-shared-widget-modal')}
        closeConfirmation={this.getCloseConfirmationConfig()}
      >
        <div className={cx('shared-widget-modal-content')}>
          <SharedWidgetInfoSection
            selectedWidget={this.state.selectedWidget}
            projectId={projectId}
          />
          <SharedWidgetsListSection
            projectId={projectId}
            currentDashboard={currentDashboard}
            selectedWidget={this.state.selectedWidget}
            onSelectWidget={this.onSelectWidget}
          />
        </div>
      </ModalLayout>
    );
  }
}
