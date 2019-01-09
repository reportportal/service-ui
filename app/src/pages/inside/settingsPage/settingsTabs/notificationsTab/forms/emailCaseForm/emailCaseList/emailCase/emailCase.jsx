import React, { Component, Fragment } from 'react';
import track from 'react-tracking';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from 'react-intl';
import className from 'classnames/bind';
import Parser from 'html-react-parser';
import { URLS } from 'common/urls';
import { validate } from 'common/utils';
import { activeProjectSelector } from 'controllers/user';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { InputTagsSearch } from 'components/inputs/inputTagsSearch';
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { FormField } from 'components/fields/formField';
import { FieldProvider } from 'components/fields/fieldProvider';
import {
  labelWidth,
  launchStatuses,
} from 'pages/inside/settingsPage/settingsTabs/notificationsTab/forms/constants';
import { SETTINGS_PAGE_EVENTS } from 'components/main/analytics/events';
import IconDelete from 'common/img/circle-cross-icon-inline.svg';
import styles from './emailCase.scss';
import { PencilCheckbox } from './pencilCheckbox';
import { messages } from './messages';

const cx = className.bind(styles);
@injectIntl
@connect((state) => ({
  projectUsernamesSearch: URLS.projectUsernamesSearch(activeProjectSelector(state)),
  launchTagsSearch: URLS.launchTagsSearch(activeProjectSelector(state)),
  launchNameSearch: URLS.launchNameSearch(activeProjectSelector(state)),
}))
@track()
export class EmailCase extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    emailCase: PropTypes.string,
    projectUsernamesSearch: PropTypes.string,
    launchTagsSearch: PropTypes.string,
    launchNameSearch: PropTypes.string,
    onDelete: PropTypes.func,
    valid: PropTypes.bool,
    readOnly: PropTypes.bool,
    deletable: PropTypes.bool,
    confirmed: PropTypes.bool,
    submitted: PropTypes.bool,
    id: PropTypes.number,
    numberOfConfirmedRules: PropTypes.number,
    totalNumberOfFields: PropTypes.number,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };
  static defaultProps = {
    emailCase: '',
    projectUsernamesSearch: '',
    launchTagsSearch: '',
    launchNameSearch: '',
    onDelete: () => {},
    valid: true,
    readOnly: false,
    deletable: false,
    confirmed: false,
    submitted: false,
    id: 0,
    numberOfConfirmedRules: 0,
    totalNumberOfFields: 0,
  };
  state = {
    isDuplicating: false,
  };
  onDelete = (index) => () => {
    const { confirmed, submitted, tracking } = this.props;
    const showConfirmation = submitted || confirmed;
    tracking.trackEvent(SETTINGS_PAGE_EVENTS.DELETE_RULE_NOTIFICATIONS);
    this.props.onDelete(index, showConfirmation);
  };
  onError = (err) => {
    const message = this.getErrorMessage(err);
    this.setState({ isDuplicating: message });
  };
  getDropdownInputConfig = () => {
    const { intl } = this.props;
    return [
      {
        value: launchStatuses.ALWAYS,
        label: intl.formatMessage(messages.dropdownValueAlways),
      },
      {
        value: launchStatuses.MORE_10,
        label: intl.formatMessage(messages.dropdownValueMore10),
      },
      {
        value: launchStatuses.MORE_20,
        label: intl.formatMessage(messages.dropdownValueMore20),
      },
      {
        value: launchStatuses.MORE_50,
        label: intl.formatMessage(messages.dropdownValueMore50),
      },
      {
        value: launchStatuses.FAILED,
        label: intl.formatMessage(messages.dropdownValueFailed),
      },
      {
        value: launchStatuses.TO_INVESTIGATE,
        label: intl.formatMessage(messages.dropdownValueToInvestigate),
      },
    ];
  };
  getErrorMessage = (err) => {
    const { intl } = this.props;
    switch (err) {
      case 'hasDuplicates':
        return intl.formatMessage(messages.duplicationErrorMessage);
      default:
        return false;
    }
  };
  formatOptions = (options) =>
    options && options.map((option) => ({ value: option, label: option }));
  parseOptions = (options) => (options && options.map((option) => option.value)) || undefined;
  validateRecipientsNewItem = ({ label }) => label && validate.email(label);
  validateLaunchNamesNewItem = ({ label }) => label && label.length >= 3;
  validateTagsNewItem = ({ label }) => label && label.length >= 1;
  render() {
    const {
      projectUsernamesSearch,
      launchTagsSearch,
      launchNameSearch,
      intl,
      id,
      emailCase,
      confirmed,
      readOnly,
      numberOfConfirmedRules,
      totalNumberOfFields,
      tracking,
    } = this.props;
    const editMode = !confirmed;
    const deletable = totalNumberOfFields > 1 && (!confirmed || numberOfConfirmedRules > 1);
    const { isDuplicating } = this.state;

    return (
      <Fragment>
        <div className={cx('control-panel')}>
          <span className={cx('control-panel-name')}>
            {intl.formatMessage(messages.controlPanelName)} {id + 1}
          </span>
          {!readOnly && (
            <div className={cx('control-panel-buttons')}>
              <div className={cx('control-panel-button')}>
                <FieldProvider
                  name={`${emailCase}.confirmed`}
                  format={Boolean}
                  onError={this.onError}
                >
                  <PencilCheckbox />
                </FieldProvider>
              </div>
              {deletable && (
                <button className={cx('control-panel-button')} onClick={this.onDelete(id)}>
                  {Parser(IconDelete)}
                </button>
              )}
            </div>
          )}
        </div>
        {isDuplicating && <p className={cx('form-invalid-message')}>{isDuplicating}</p>}
        <FormField
          label={intl.formatMessage(messages.recipientsLabel)}
          name={`${emailCase}.recipients`}
          format={this.formatOptions}
          parse={this.parseOptions}
          disabled={!editMode}
          fieldWrapperClassName={cx('form-input')}
          onChange={() =>
            tracking.trackEvent(SETTINGS_PAGE_EVENTS.EDIT_RECIPIENTS_INPUT_NOTIFICATIONS)
          }
        >
          <FieldErrorHint hintType="top">
            <InputTagsSearch
              placeholder={intl.formatMessage(messages.recipientsPlaceholder)}
              nothingFound={intl.formatMessage(messages.recipientsHint)}
              minLength={3}
              async
              uri={projectUsernamesSearch}
              makeOptions={this.formatOptions}
              creatable
              multi
              removeSelected
              isValidNewOption={this.validateRecipientsNewItem}
              dynamicSearchPromptText
            />
          </FieldErrorHint>
        </FormField>
        <FormField
          name={`${emailCase}.informOwner`}
          format={Boolean}
          disabled={!editMode}
          onChange={() =>
            tracking.trackEvent(SETTINGS_PAGE_EVENTS.CHECKBOX_LAUNCH_OWNER_NOTIFICATIONS)
          }
          fieldWrapperClassName={cx('form-input-checkbox')}
        >
          <InputCheckbox>{intl.formatMessage(messages.launchOwnerLabel)}</InputCheckbox>
        </FormField>
        <FormField
          label={intl.formatMessage(messages.inCaseLabel)}
          labelWidth={labelWidth}
          name={`${emailCase}.sendCase`}
          disabled={!editMode}
          fieldWrapperClassName={cx('form-input')}
          onChange={() =>
            tracking.trackEvent(SETTINGS_PAGE_EVENTS.EDIT_IN_CASE_INPUT_NOTIFICATIONS)
          }
        >
          <InputDropdown options={this.getDropdownInputConfig()} />
        </FormField>
        <FormField
          label={intl.formatMessage(messages.launchNamesLabel)}
          customBlock={{
            node: <p>{intl.formatMessage(messages.launchNamesNote)}</p>,
          }}
          name={`${emailCase}.launchNames`}
          format={this.formatOptions}
          parse={this.parseOptions}
          disabled={!editMode}
          fieldWrapperClassName={cx('form-input')}
          onChange={() => tracking.trackEvent(SETTINGS_PAGE_EVENTS.LAUNCH_NAME_INPUT_NOTIFICATIONS)}
        >
          <FieldErrorHint hintType="top">
            <InputTagsSearch
              placeholder={intl.formatMessage(messages.launchNamesPlaceholder)}
              focusPlaceholder={intl.formatMessage(messages.launchNamesHint)}
              async
              minLength={3}
              uri={launchNameSearch}
              makeOptions={this.formatOptions}
              creatable
              multi
              removeSelected
              isValidNewOption={this.validateLaunchNamesNewItem}
            />
          </FieldErrorHint>
        </FormField>
        <FormField
          label={intl.formatMessage(messages.tagsLabel)}
          customBlock={{
            node: <p>{intl.formatMessage(messages.tagsNote)}</p>,
          }}
          fieldWrapperClassName={cx('form-input')}
          name={`${emailCase}.tags`}
          format={this.formatOptions}
          parse={this.parseOptions}
          disabled={!editMode}
          onChange={() => tracking.trackEvent(SETTINGS_PAGE_EVENTS.TAGS_INPUT_NOTIFICATIONS)}
        >
          <FieldErrorHint hintType="top">
            <InputTagsSearch
              placeholder={intl.formatMessage(messages.tagsPlaceholder)}
              focusPlaceholder={intl.formatMessage(messages.tagsHint)}
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
