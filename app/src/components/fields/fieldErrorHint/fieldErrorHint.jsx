import { cloneElement, Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import styles from './fieldErrorHint.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  loginHint: {
    id: 'RegistrationForm.loginHint',
    defaultMessage:
      'Login should have size from 1 to 128 symbols, latin, numeric characters, hyphen, underscore, dot.',
  },
  nameHint: {
    id: 'RegistrationForm.nameHint',
    defaultMessage:
      'Full name should have size from 3 to 256 symbols, latin, cyrillic, numeric characters, hyphen, underscore, dot, space.',
  },
  passwordHint: {
    id: 'RegistrationForm.passwordHint',
    defaultMessage: 'Password should have size from 4 to 128 symbols.',
  },
  emailHint: {
    id: 'Common.validation.email',
    defaultMessage: 'Email is incorrect. Please enter correct email.',
  },
  confirmPasswordHint: {
    id: 'RegistrationForm.confirmPasswordHint',
    defaultMessage: 'Passwords do not match.',
  },
  filterNameError: {
    id: 'FiltersPage.filterNameLength',
    defaultMessage: 'Filter name length should have size from 3 to 128 characters.',
  },
  sharedWidgetSearchHint: {
    id: 'SharedWidgetsSearch.sharedWidgetSearchHint',
    defaultMessage: 'Value should have size from 3 to 256.',
  },
  launchNameHint: {
    id: '  LaunchMergeModal.launchNameHint',
    defaultMessage: 'Launch name should have size from 3 to 256.',
  },
  launchDescriptionHint: {
    id: '  LaunchMergeModal.launchDescriptionHint',
    defaultMessage: 'Description should have size not more than 1024 symbols.',
  },
  dashboardNameHint: {
    id: 'AddEditDashboard.dashboardNameHint',
    defaultMessage: 'Dashboard name should have size  from 3 to 128.',
  },
  dashboardNameSearchHint: {
    id: 'SearchDashboardForm.dashboardNameSearchHint',
    defaultMessage: 'Dashboard name should have size from 3 to 128',
  },
  minShouldMatchHint: {
    id: 'AccuracyFormBlock.minShouldMatchHint',
    defaultMessage: 'The parameter should have value from 50 to 100',
  },
  minDocFreqHint: {
    id: 'AccuracyFormBlock.minDocFreqHint',
    defaultMessage: 'The parameter should have value from 1 to 10',
  },
  minTermFreqHint: {
    id: 'AccuracyFormBlock.minTermFreqHint',
    defaultMessage: 'The parameter should have value from 1 to 10',
  },
  profilePassword: {
    id: 'ChangePasswordModal.profilePassword',
    defaultMessage: 'Password should have size from 4 to 128 symbols',
  },
  profileConfirmPassword: {
    id: 'ChangePasswordModal.profileConfirmPassword',
    defaultMessage: 'Passwords do not match',
  },
  profileUserName: {
    id: 'ChangePasswordModal.profileUserName',
    defaultMessage:
      'Full name should have size from 3 to 256 symbols, latin, cyrillic, numeric characters, hyphen, underscore, dot, space.',
  },
  profileEmail: {
    id: 'ChangePasswordModal.profileEmail',
    defaultMessage: 'Email is incorrect.',
  },
  itemNameEntityHint: {
    id: 'LaunchLevelEntities.itemNameEntityHint',
    defaultMessage: 'At least 3 symbols required',
  },
  launchNumericEntityHint: {
    id: 'LaunchLevelEntities.launchNumberEntityHint',
    defaultMessage: 'This filter accepts only digits',
  },
  launchDescriptionEntityHint: {
    id: 'LaunchLevelEntities.launchDescriptionEntityHint',
    defaultMessage: 'At least 3 symbols required',
  },
  demoDataPostfixHint: {
    id: 'DemoDataTabForm.demoDataPostfixHint',
    defaultMessage: 'Postfix should have size from 1 to 90',
  },
  recipientsHint: {
    id: 'AddEditNotificationCaseModal.recipientsHint',
    defaultMessage: 'Select at least one recipient',
  },
  launchesHint: {
    id: 'AddEditNotificationCaseModal.launchesHint',
    defaultMessage: 'Launch name should have size from 3 to 256',
  },
  urlHint: {
    id: 'LinkIssueModal.urlHint',
    defaultMessage: 'Link should match a valid website address',
  },
  issueIdHint: {
    id: 'LinkIssueModal.issueIdHint',
    defaultMessage: 'Issue ID should have size from 1 to 128',
  },
  requiredFieldHint: {
    id: 'Common.requiredFieldHint',
    defaultMessage: 'This field is required',
  },
  attributeKeyLengthHint: {
    id: 'AttributeEditor.attributeKeyLengthHint',
    defaultMessage: 'Attribute key should have size from 1 to 128',
  },
  attributeValueLengthHint: {
    id: 'AttributeEditor.attributeValueLengthHint',
    defaultMessage: 'Attribute value should have size from 1 to 128',
  },
  defectLongNameHint: {
    id: 'DefectTypesTab.defectLongNameHint',
    defaultMessage: "Full name should have size from '3' to '55'",
  },
  defectShortNameHint: {
    id: 'DefectTypesTab.defectShortNameHint',
    defaultMessage: "Short name should have size from '1' to '4'",
  },
  projectNameLengthHint: {
    id: 'ProjectsPage.projectNameLengthHint',
    defaultMessage:
      "Project name should have size from '3' to '256', latin, numeric characters, hyphen, underscore.",
  },
  projectDuplicateHint: {
    id: 'ProjectsPage.projectDuplicateHint',
    defaultMessage: 'Project with the same name already exists in system',
  },
  btsUrlHint: {
    id: 'JiraConnectionFormFields.btsUrlHint',
    defaultMessage: 'Please provide a valid BTS link',
  },
  btsProjectHint: {
    id: 'JiraConnectionFormFields.btsProjectHint',
    defaultMessage: 'Project name should have size from 1 to 55',
  },
});

@injectIntl
export class FieldErrorHint extends Component {
  static propTypes = {
    hintType: PropTypes.string,
    children: PropTypes.node,
    intl: intlShape,
    error: PropTypes.string,
    active: PropTypes.bool,
    staticHint: PropTypes.bool,
  };

  static defaultProps = {
    intl: {},
    hintType: 'bottom',
    children: null,
    error: '',
    active: false,
    staticHint: false,
  };

  isHintVisible = () => {
    const { error, active, staticHint } = this.props;
    if (staticHint) {
      return !!error;
    }
    return !!error && active;
  };

  render() {
    const { hintType, children, intl, error, active, staticHint, ...rest } = this.props;
    const classes = cx('field-error-hint', `type-${hintType}`);

    return (
      <div className={classes}>
        {children && cloneElement(children, { error, active, ...rest })}
        <div className={cx('hint', { 'static-hint': staticHint, visible: this.isHintVisible() })}>
          <div className={cx('hint-content', `type-${hintType}`, { 'static-hint': staticHint })}>
            {error && messages[error] ? intl.formatMessage(messages[error]) : error}
          </div>
        </div>
      </div>
    );
  }
}
