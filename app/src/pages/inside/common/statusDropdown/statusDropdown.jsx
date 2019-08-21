import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import className from 'classnames/bind';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { activeProjectSelector } from 'controllers/user';
import { fetchTestItemsAction } from 'controllers/testItem';
import { NOTIFICATION_TYPES, showNotification } from 'controllers/notification';
import { fetch } from 'common/utils/fetch';
import { URLS } from 'common/urls';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { formatStatus } from 'common/utils/localizationUtils';
import { PASSED, FAILED, SKIPPED, INTERRUPTED, IN_PROGRESS } from 'common/constants/testStatuses';
import { ATTRIBUTE_KEY_MANUALLY } from './constants';
import styles from './statusDropdown.scss';

const cx = className.bind(styles);

const messages = defineMessages({
  itemUpdateSuccess: {
    id: 'EditItemsModal.itemUpdateSuccess',
    defaultMessage: 'Completed successfully!',
  },
  itemUpdateError: {
    id: 'EditItemsModal.itemUpdateError',
    defaultMessage: 'Completed with error!',
  },
});

@connect(
  (state) => ({
    currentProject: activeProjectSelector(state),
  }),
  {
    fetchFunc: fetchTestItemsAction,
    showMessage: showNotification,
  },
)
@injectIntl
export class StatusDropdown extends Component {
  static propTypes = {
    currentProject: PropTypes.string.isRequired,
    intl: intlShape.isRequired,
    itemId: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired,
    attributes: PropTypes.array,
    description: PropTypes.string,
    fetchFunc: PropTypes.func,
    showMessage: PropTypes.func,
  };

  static defaultProps = {
    attributes: [],
    description: '',
    fetchFunc: () => {},
    showMessage: () => {},
  };

  updateItem = (newStatus) => {
    const {
      intl: { formatMessage },
      currentProject,
      status: oldStatus,
      itemId,
      attributes,
      description,
      fetchFunc,
      showMessage,
    } = this.props;
    const newAttribute = { key: ATTRIBUTE_KEY_MANUALLY, value: newStatus.toLowerCase() };
    const newAttributes = attributes
      .filter((item) => item.key !== ATTRIBUTE_KEY_MANUALLY)
      .concat(newAttribute);
    const data = {
      attributes: newAttributes,
      description,
      status: newStatus,
    };

    if (newStatus === oldStatus) return;

    fetch(URLS.testItemUpdate(currentProject, itemId), { method: 'put', data })
      .then(() => {
        showMessage({
          message: formatMessage(messages.itemUpdateSuccess),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
        fetchFunc();
      })
      .catch(() => {
        showMessage({
          message: formatMessage(messages.itemUpdateError),
          type: NOTIFICATION_TYPES.ERROR,
        });
      });
  };

  generateOptions = (status) => {
    const { intl } = this.props;
    if (status === IN_PROGRESS)
      return [{ label: formatStatus(intl.formatMessage, IN_PROGRESS), value: IN_PROGRESS }];

    const STATUS_TYPES = [PASSED, FAILED, SKIPPED];
    if (status === INTERRUPTED) STATUS_TYPES.push(INTERRUPTED);

    return STATUS_TYPES.map((item) => ({
      label: formatStatus(intl.formatMessage, item),
      value: item,
    }));
  };

  render() {
    const { status } = this.props;
    return (
      <div className={cx('status-dropdown')}>
        <InputDropdown
          options={this.generateOptions(status)}
          value={status}
          onChange={this.updateItem}
          customClasses={{
            dropdown: cx('dropdown'),
            selectBlock: cx('select-block'),
            arrow: cx('arrow'),
            value: cx('value'),
            selectList: cx('select-list'),
          }}
          mobileDisabled
        />
      </div>
    );
  }
}
