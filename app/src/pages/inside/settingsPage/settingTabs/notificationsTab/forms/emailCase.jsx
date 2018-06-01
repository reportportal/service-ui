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
import { FieldProvider } from 'components/fields/fieldProvider';
import { ModalField } from 'components/main/modal';
import { activeProjectSelector } from 'controllers/user';
import { FormControls } from './formControls/index';
import { FormRow } from './formRow/index';
import styles from './forms.scss';
import { labelWidth } from './constants';
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
        value: 'ALWAYS',
        label: intl.formatMessage(emailCasesMessages.dropdownValueAlways),
        disabled: false,
      },
      {
        value: 'MORE_10',
        label: intl.formatMessage(emailCasesMessages.dropdownValueMore10),
        disabled: false,
      },
      {
        value: 'MORE_20',
        label: intl.formatMessage(emailCasesMessages.dropdownValueMore20),
        disabled: false,
      },
      {
        value: 'MORE_50',
        label: intl.formatMessage(emailCasesMessages.dropdownValueMore50),
        disabled: false,
      },
      {
        value: 'FAILED',
        label: intl.formatMessage(emailCasesMessages.dropdownValueFailed),
        disabled: false,
      },
      {
        value: 'TO_INVESTIGATE',
        label: intl.formatMessage(emailCasesMessages.dropdownValueToInvestigate),
        disabled: false,
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
        <FormControls
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
        <FormRow>
          <ModalField
            label={intl.formatMessage(emailCasesMessages.recipientsLabel)}
            labelWidth={labelWidth}
          >
            <div className={cx('form-input')}>
              <FieldProvider
                name="recipients"
                format={this.formatOptions}
                parse={this.parseOptions}
                disabled={!editMode}
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
              </FieldProvider>
            </div>
          </ModalField>
        </FormRow>
        <FormRow>
          <div className={cx('form-input-owner')}>
            <FieldProvider name="informOwner" format={Boolean} disabled={!editMode}>
              <InputCheckbox>
                {intl.formatMessage(emailCasesMessages.launchOwnerLabel)}
              </InputCheckbox>
            </FieldProvider>
          </div>
        </FormRow>
        <FormRow>
          <ModalField
            label={intl.formatMessage(emailCasesMessages.inCaseLabel)}
            labelWidth={labelWidth}
          >
            <div className={cx('form-input', 'dropdown')}>
              <FieldProvider name="sendCase" disabled={!editMode}>
                <InputDropdown options={this.getDropdownInputConfig()} />
              </FieldProvider>
            </div>
          </ModalField>
        </FormRow>
        <FormRow
          note={() => (
            <div className={cx('note')}>
              {intl.formatMessage(emailCasesMessages.launchNamesNote)}
            </div>
          )}
        >
          <ModalField
            label={intl.formatMessage(emailCasesMessages.launchNamesLabel)}
            labelWidth={labelWidth}
          >
            <div className={cx('form-input')}>
              <FieldProvider
                name="launchNames"
                format={this.formatOptions}
                parse={this.parseOptions}
                disabled={!editMode}
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
                  />
                </FieldErrorHint>
              </FieldProvider>
            </div>
          </ModalField>
        </FormRow>
        <FormRow
          note={() => (
            <div className={cx('note')}>{intl.formatMessage(emailCasesMessages.tagsNote)}</div>
          )}
        >
          <ModalField
            label={intl.formatMessage(emailCasesMessages.tagsLabel)}
            labelWidth={labelWidth}
          >
            <div className={cx('form-input')}>
              <FieldProvider
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
                  />
                </FieldErrorHint>
              </FieldProvider>
            </div>
          </ModalField>
        </FormRow>
      </Fragment>
    );
  }
}
