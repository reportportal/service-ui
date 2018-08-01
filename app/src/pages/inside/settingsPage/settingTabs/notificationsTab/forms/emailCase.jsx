import React, { Component, Fragment } from 'react';
import { reduxForm } from 'redux-form';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from 'react-intl';
import className from 'classnames/bind';
import { URLS } from 'common/urls';
import { validate } from 'common/utils';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { InputTagsSearch } from 'components/inputs/inputTagsSearch';
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { FormField } from 'components/fields/formField';
import { activeProjectSelector } from 'controllers/user';
import { EmailCaseHeader } from './emailCaseHeader';
import styles from './forms.scss';
import { labelWidth, launchStatuses } from './constants';
import { emailCasesMessages } from './messages';

const cx = className.bind(styles);

@injectIntl
@reduxForm({
  validate: ({ recipients, informOwner, launchNames, tags }) => ({
    recipients: !(informOwner || recipients.length) && 'recipientsHint',
    launchNames:
      !(launchNames.length ? launchNames.every(validate.notificationTagSearch) : true) &&
      'launchesHint',
    tags: !(tags.length ? tags.every(validate.notificationTagSearch) : true) && 'tagsHint',
  }),
})
@connect((state) => ({
  teamMembersSearchUrl: URLS.teamMembersSearchUrl(activeProjectSelector(state)),
  launchTagsSearch: URLS.launchTagsSearch(activeProjectSelector(state)),
  launchNamesSearch: URLS.launchNamesSearch(activeProjectSelector(state)),
}))
export class EmailCase extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    emailCase: PropTypes.object,
    teamMembersSearchUrl: PropTypes.string,
    launchTagsSearch: PropTypes.string,
    launchNamesSearch: PropTypes.string,
    index: PropTypes.number,
    onDelete: PropTypes.func,
    toggleEditMode: PropTypes.func,
    handleSubmit: PropTypes.func,
    submit: PropTypes.func,
    valid: PropTypes.bool,
    readOnly: PropTypes.bool,
    deletable: PropTypes.bool,
  };
  static defaultProps = {
    emailCase: {},
    teamMembersSearchUrl: '',
    launchTagsSearch: '',
    launchNamesSearch: '',
    index: 0,
    onDelete: () => {},
    toggleEditMode: () => {},
    handleSubmit: () => {},
    submit: () => {},
    valid: true,
    readOnly: false,
    deletable: false,
  };
  state = {
    editMode: this.props.emailCase.editMode,
  };
  onSubmit = () => {
    const { valid } = this.props;
    if (valid) {
      this.props.submit();
    }
  };
  getDropdownInputConfig = () => {
    const { intl } = this.props;
    return [
      {
        value: launchStatuses.ALWAYS,
        label: intl.formatMessage(emailCasesMessages.dropdownValueAlways),
      },
      {
        value: launchStatuses.MORE_10,
        label: intl.formatMessage(emailCasesMessages.dropdownValueMore10),
      },
      {
        value: launchStatuses.MORE_20,
        label: intl.formatMessage(emailCasesMessages.dropdownValueMore20),
      },
      {
        value: launchStatuses.MORE_50,
        label: intl.formatMessage(emailCasesMessages.dropdownValueMore50),
      },
      {
        value: launchStatuses.FAILED,
        label: intl.formatMessage(emailCasesMessages.dropdownValueFailed),
      },
      {
        value: launchStatuses.TO_INVESTIGATE,
        label: intl.formatMessage(emailCasesMessages.dropdownValueToInvestigate),
      },
    ];
  };
  formatOptions = (options) =>
    options && options.map((option) => ({ value: option, label: option }));
  parseOptions = (options) => options.map((option) => option.value);
  toggleEditMode = () => {
    const { valid: caseValid } = this.props.emailCase;
    const { valid } = this.props;

    if (caseValid && valid) {
      this.setState({ editMode: !this.state.editMode });
    }
  };
  validateRecipientsNewItem = ({ label }) => label && validate.email(label);
  validateLaunchNamesNewItem = ({ label }) => label && label.length >= 3;
  validateTagsNewItem = ({ label }) => label && label.length >= 1;
  render() {
    const {
      teamMembersSearchUrl,
      launchTagsSearch,
      launchNamesSearch,
      intl,
      onDelete,
      index,
      emailCase: { id, submitted },
      deletable,
    } = this.props;
    const { editMode } = this.state;
    return (
      <Fragment>
        <EmailCaseHeader
          id={id}
          index={index}
          onDelete={onDelete}
          editMode={editMode}
          submitted={submitted}
          toggleEditMode={this.toggleEditMode}
          onSubmit={this.onSubmit}
          readOnly={this.props.readOnly}
          deletable={deletable}
        />
        {!this.props.emailCase.valid &&
          this.props.emailCase.showValidationMessage && (
            <p className={cx('form-invalid-message')}>{this.props.emailCase.validationMessage}</p>
          )}
        <FormField
          label={intl.formatMessage(emailCasesMessages.recipientsLabel)}
          name="recipients"
          format={this.formatOptions}
          parse={this.parseOptions}
          disabled={!editMode}
          fieldWrapperClassName={cx('form-input')}
        >
          <FieldErrorHint hintType="top">
            <InputTagsSearch
              placeholder={intl.formatMessage(emailCasesMessages.recipientsPlaceholder)}
              nothingFound={intl.formatMessage(emailCasesMessages.recipientsHint)}
              minLength={3}
              async
              uri={teamMembersSearchUrl}
              makeOptions={this.formatOptions}
              creatable
              multi
              removeSelected
              isValidNewOption={this.validateRecipientsNewItem}
              dynamicSearchPromptText
            />
          </FieldErrorHint>
        </FormField>
        <FormField name="informOwner" format={Boolean} disabled={!editMode}>
          <InputCheckbox>{intl.formatMessage(emailCasesMessages.launchOwnerLabel)}</InputCheckbox>
        </FormField>
        <FormField
          label={intl.formatMessage(emailCasesMessages.inCaseLabel)}
          labelWidth={labelWidth}
          name="sendCase"
          disabled={!editMode}
          fieldWrapperClassName={cx('form-input')}
        >
          <InputDropdown options={this.getDropdownInputConfig()} />
        </FormField>

        <FormField
          label={intl.formatMessage(emailCasesMessages.launchNamesLabel)}
          description={intl.formatMessage(emailCasesMessages.launchNamesNote)}
          name="launchNames"
          format={this.formatOptions}
          parse={this.parseOptions}
          disabled={!editMode}
          fieldWrapperClassName={cx('form-input')}
        >
          <FieldErrorHint hintType="top">
            <InputTagsSearch
              placeholder={intl.formatMessage(emailCasesMessages.launchNamesPlaceholder)}
              focusPlaceholder={intl.formatMessage(emailCasesMessages.launchNamesHint)}
              async
              minLength={3}
              uri={launchNamesSearch}
              makeOptions={this.formatOptions}
              creatable
              multi
              removeSelected
              isValidNewOption={this.validateLaunchNamesNewItem}
            />
          </FieldErrorHint>
        </FormField>
        <FormField
          label={intl.formatMessage(emailCasesMessages.tagsLabel)}
          description={intl.formatMessage(emailCasesMessages.tagsNote)}
          fieldWrapperClassName={cx('form-input')}
          name="tags"
          format={this.formatOptions}
          parse={this.parseOptions}
          disabled={!editMode}
        >
          <FieldErrorHint hintType="top">
            <InputTagsSearch
              placeholder={intl.formatMessage(emailCasesMessages.tagsPlaceholder)}
              focusPlaceholder={intl.formatMessage(emailCasesMessages.tagsHint)}
              async
              uri={launchTagsSearch}
              minLength={1}
              makeOptions={this.formatOptions}
              creatable
              multi
              removeSelected
              isValidNewOption={this.validateTagsNewItem}
            />
          </FieldErrorHint>
        </FormField>
      </Fragment>
    );
  }
}
