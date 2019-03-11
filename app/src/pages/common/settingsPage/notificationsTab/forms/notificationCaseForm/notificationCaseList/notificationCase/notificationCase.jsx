import React, { Component, Fragment } from 'react';
import track from 'react-tracking';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from 'react-intl';
import className from 'classnames/bind';
import Parser from 'html-react-parser';
import { URLS } from 'common/urls';
import { validate } from 'common/utils';
import { projectIdSelector } from 'controllers/pages';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { InputTagsSearch } from 'components/inputs/inputTagsSearch';
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { FormField } from 'components/fields/formField';
import { FieldProvider } from 'components/fields/fieldProvider';
import {
  labelWidth,
  launchStatuses,
} from 'pages/common/settingsPage/notificationsTab/forms/constants';
import { SETTINGS_PAGE_EVENTS } from 'components/main/analytics/events';
import IconDelete from 'common/img/circle-cross-icon-inline.svg';
import { AttributeListField } from 'components/main/attributeList';
import { PencilCheckbox } from './pencilCheckbox';
import { messages } from './messages';
import styles from './notificationCase.scss';

const cx = className.bind(styles);
@injectIntl
@connect((state) => ({
  projectUsernamesSearch: URLS.projectUsernamesSearch(projectIdSelector(state)),
  launchNameSearch: URLS.launchNameSearch(projectIdSelector(state)),
}))
@track()
export class NotificationCase extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    notificationCase: PropTypes.string,
    projectUsernamesSearch: PropTypes.string,
    launchNameSearch: PropTypes.string,
    onDelete: PropTypes.func,
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
    notificationCase: '',
    projectUsernamesSearch: '',
    launchNameSearch: '',
    onDelete: () => {},
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

  onValidate = (err) => {
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
  parseOptions = (options) =>
    (Array.isArray(options) && options.map((option) => option.value)) || undefined;
  validateRecipientsNewItem = ({ label }) => label && validate.email(label);
  validateLaunchNamesNewItem = ({ label }) => label && label.length >= 3;

  render() {
    const {
      intl: { formatMessage },
      projectUsernamesSearch,
      launchNameSearch,
      id,
      notificationCase,
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
            {formatMessage(messages.controlPanelName)} {id + 1}
          </span>
          {!readOnly && (
            <div className={cx('control-panel-buttons')}>
              <div className={cx('control-panel-button')}>
                <FieldProvider
                  name={`${notificationCase}.confirmed`}
                  format={Boolean}
                  onValidate={this.onValidate}
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
          label={formatMessage(messages.recipientsLabel)}
          name={`${notificationCase}.recipients`}
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
              placeholder={formatMessage(messages.recipientsPlaceholder)}
              nothingFound={formatMessage(messages.recipientsHint)}
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
          name={`${notificationCase}.informOwner`}
          format={Boolean}
          disabled={!editMode}
          onChange={() =>
            tracking.trackEvent(SETTINGS_PAGE_EVENTS.CHECKBOX_LAUNCH_OWNER_NOTIFICATIONS)
          }
          fieldWrapperClassName={cx('form-input-checkbox')}
        >
          <InputCheckbox>{formatMessage(messages.launchOwnerLabel)}</InputCheckbox>
        </FormField>
        <FormField
          label={formatMessage(messages.inCaseLabel)}
          labelWidth={labelWidth}
          name={`${notificationCase}.sendCase`}
          disabled={!editMode}
          fieldWrapperClassName={cx('form-input')}
          onChange={() =>
            tracking.trackEvent(SETTINGS_PAGE_EVENTS.EDIT_IN_CASE_INPUT_NOTIFICATIONS)
          }
        >
          <InputDropdown options={this.getDropdownInputConfig()} />
        </FormField>
        <FormField
          label={formatMessage(messages.launchNamesLabel)}
          customBlock={{
            node: <p>{formatMessage(messages.launchNamesNote)}</p>,
          }}
          name={`${notificationCase}.launchNames`}
          format={this.formatOptions}
          parse={this.parseOptions}
          disabled={!editMode}
          fieldWrapperClassName={cx('form-input')}
          onChange={() => tracking.trackEvent(SETTINGS_PAGE_EVENTS.LAUNCH_NAME_INPUT_NOTIFICATIONS)}
        >
          <FieldErrorHint hintType="top">
            <InputTagsSearch
              placeholder={formatMessage(messages.launchNamesPlaceholder)}
              focusPlaceholder={formatMessage(messages.launchNamesHint)}
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
          label={formatMessage(messages.attributesLabel)}
          customBlock={{
            node: <p>{formatMessage(messages.attributesNote)}</p>,
          }}
          fieldWrapperClassName={cx('form-input')}
          name={`${notificationCase}.attributes`}
          disabled={!editMode}
          onChange={() => tracking.trackEvent(SETTINGS_PAGE_EVENTS.TAGS_INPUT_NOTIFICATIONS)}
        >
          <AttributeListField />
        </FormField>
      </Fragment>
    );
  }
}
