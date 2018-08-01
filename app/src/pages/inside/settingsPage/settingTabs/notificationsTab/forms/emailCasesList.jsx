import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import { showModalAction } from 'controllers/modal';
import { compareObjectsByKeys, uniqueId } from 'common/utils';
import { GhostButton } from 'components/buttons/ghostButton';
import { EmailCase } from './emailCase';
import styles from './forms.scss';
import PlusIcon from './img/ic-plus-inline.svg';
import { OWNER, defaultRecipient } from './constants';

const messages = defineMessages({
  addNewRuleButton: {
    id: 'NotificationsForm.addNewRuleButton',
    defaultMessage: 'Add New Rule',
  },
  duplicationErrorMessage: {
    id: 'NotificationsForm.duplicationErrorMessage',
    defaultMessage: "Such notification rule already exists. You can't create duplicate.",
  },
});
const cx = classNames.bind(styles);

@injectIntl
@connect(null, {
  showModal: showModalAction,
})
export class EmailCasesList extends Component {
  static propTypes = {
    emailCases: PropTypes.array,
    showModal: PropTypes.func,
    onSubmit: PropTypes.func,
    intl: intlShape.isRequired,
    configurable: PropTypes.bool,
  };
  static defaultProps = {
    emailCases: [],
    showModal: () => {},
    onSubmit: () => {},
    configurable: false,
  };
  state = {
    emailCases: this.props.emailCases.map((emailCase) => {
      const { recipients } = emailCase;
      return {
        ...emailCase,
        ...{
          id: uniqueId(),
          informOwner: recipients.includes(OWNER),
          recipients: recipients.filter((recipient) => recipient !== OWNER),
          submitted: true,
          valid: true,
        },
      };
    }),
  };
  onDelete = ({ id, index, submitted }) => {
    const { showModal } = this.props;
    if (submitted) {
      showModal({
        id: 'deleteNotificationRuleModal',
        data: {
          id,
          index,
          onSubmit: () => this.removeEmailCase(id),
        },
      });
    } else {
      this.removeEmailCase(id);
    }
  };
  onSubmit = (data) => {
    const emailCase = this.validateEmailCase(data);
    const { valid } = emailCase;
    const emailCases = this.editEmailCasesList({
      ...emailCase,
      submitted: valid,
      showValidationMessage: !valid,
    });
    this.setState({ emailCases }, this.submit);
  };
  onChange = (data) => {
    const emailCase = this.validateEmailCase(data);
    const emailCases = this.editEmailCasesList(emailCase);
    this.setState({ emailCases });
  };
  submit = () => {
    this.props.onSubmit({
      emailCases: this.state.emailCases.map(this.convertEmailCasesForSubmission),
    });
  };
  addEmailCase = () => {
    const emailCases = [
      ...this.state.emailCases,
      { ...this.validateEmailCase(defaultRecipient), id: uniqueId() },
    ];
    this.setState({ emailCases });
  };
  removeEmailCase = (id) => {
    const emailCases = this.state.emailCases.filter((item) => item.id !== id);
    this.setState({ emailCases }, this.submit);
  };
  editEmailCasesList = (emailCase) =>
    this.state.emailCases.map((item) => (item.id === emailCase.id ? emailCase : item));
  validateEmailCase = (data) => {
    const { emailCases } = this.state;
    const { intl } = this.props;
    const hasDuplicates = emailCases
      .filter((item) => item.id !== data.id)
      .some((item) =>
        compareObjectsByKeys(item, data, [
          'informOwner',
          'launchNames',
          'recipients',
          'sendCase',
          'tags',
        ]),
      );
    return {
      ...data,
      valid: !hasDuplicates,
      validationMessage: intl.formatMessage(messages.duplicationErrorMessage),
    };
  };
  convertEmailCasesForSubmission = (obj) => {
    const { informOwner, launchNames, recipients, sendCase, tags } = obj;
    return {
      launchNames,
      sendCase,
      tags,
      recipients: informOwner ? [...recipients, OWNER] : recipients,
    };
  };
  render() {
    const { intl, configurable } = this.props;
    const { emailCases } = this.state;
    const emailCasesLength = emailCases.length;

    return (
      <Fragment>
        {emailCases.map((item, id) => {
          const emailCasesProps = {
            form: `notificationRulesForm_${item.id}`,
            key: item.id,
            initialValues: item,
            emailCase: item,
            index: id + 1,
            onDelete: this.onDelete,
            onSubmit: this.onSubmit,
            onChange: this.onChange,
            configurable: this.props.configurable,
            deletable: emailCasesLength > 1,
          };
          return <EmailCase {...emailCasesProps} />;
        })}
        {!configurable && (
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
