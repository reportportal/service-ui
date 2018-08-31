/*  This file has one disabled eslint rule. This is made, because in examples redux-form Fields Array array indexes
    are used as key for react components
  */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import { showModalAction } from 'controllers/modal';
import { GhostButton } from 'components/buttons/ghostButton';
import { defaultRecipient } from 'pages/inside/settingsPage/settingTabs/notificationsTab/forms/constants';
import { EmailCase } from './emailCase';
import styles from './emailCasesList.scss';
import PlusIcon from './img/ic-plus-inline.svg';

const messages = defineMessages({
  addNewRuleButton: {
    id: 'EmailCaseList.addNewRuleButton',
    defaultMessage: 'Add New Rule',
  },
});
const cx = classNames.bind(styles);

@injectIntl
@connect(null, {
  showModal: showModalAction,
})
export class EmailCaseList extends Component {
  static propTypes = {
    showModal: PropTypes.func,
    intl: intlShape.isRequired,
    configurable: PropTypes.bool,
    fields: PropTypes.object,
    readOnly: PropTypes.bool,
  };
  static defaultProps = {
    showModal: () => {},
    configurable: false,
    fields: {},
    readOnly: false,
  };
  onDelete = (index, showConfirmation) => {
    const { showModal } = this.props;

    if (showConfirmation) {
      showModal({
        id: 'deleteNotificationRuleModal',
        data: {
          index: index + 1,
          onSubmit: () => this.removeEmailCase(index),
        },
      });
    } else {
      this.removeEmailCase(index);
    }
  };
  addEmailCase = () => {
    this.props.fields.push(defaultRecipient);
  };
  removeEmailCase = (index) => {
    this.props.fields.remove(index);
  };

  render() {
    const { intl, fields, readOnly } = this.props;
    const { submit } = this;
    const deletable = fields.length > 1;

    return (
      <Fragment>
        {fields.map((item, id, fieldsArray) => {
          const { submitted, confirmed } = fieldsArray.get(id);
          const customProps = {
            deletable,
            submitted,
            readOnly,
            submit,
            confirmed,
          };

          return (
            <EmailCase
              key={`index_${id}`} // eslint-disable-line react/no-array-index-key
              id={id}
              emailCase={item}
              onDelete={this.onDelete}
              {...customProps}
            />
          );
        })}
        {!readOnly && (
          <div className={cx('notification-form-button')}>
            <GhostButton icon={PlusIcon} onClick={this.addEmailCase}>
              {intl.formatMessage(messages.addNewRuleButton)}
            </GhostButton>
          </div>
        )}
      </Fragment>
    );
  }
}
