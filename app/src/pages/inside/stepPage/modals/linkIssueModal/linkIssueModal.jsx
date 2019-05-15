import { Component } from 'react';
import track from 'react-tracking';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { reduxForm, FieldArray } from 'redux-form';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { activeProjectSelector } from 'controllers/user';
import { namedAvailableBtsIntegrationsSelector } from 'controllers/project';
import { ModalLayout, withModal } from 'components/main/modal';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { STEP_PAGE_EVENTS } from 'components/main/analytics/events';
import { URLS } from 'common/urls';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { FormField } from 'components/fields/formField';
import { validate, fetch } from 'common/utils';
import { BetaBadge } from 'pages/inside/common/betaBadge';
import { INTEGRATION_NAMES_TITLES } from 'components/integrations';
import { LinkIssueFields } from './linkIssueFields';
import styles from './linkIssueModal.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  linkButton: {
    id: 'LinkIssueModal.linkButton',
    defaultMessage: 'Link',
  },
  title: {
    id: 'LinkIssueModal.title',
    defaultMessage: 'Link issue',
  },
  addIssueIdTitle: {
    id: 'LinkIssueModal.addIssueIdTitle',
    defaultMessage: 'Add issue id',
  },
  btsTitle: {
    id: 'LinkIssueModal.btsTitle',
    defaultMessage: 'BTS',
  },
  integrationNameTitle: {
    id: 'LinkIssueModal.integrationNameTitle',
    defaultMessage: 'Integration name',
  },
  linkIssueSuccess: {
    id: 'LinkIssueModal.linkIssueSuccess',
    defaultMessage: 'Defect link successfully added',
  },
  linkIssueFailed: {
    id: 'LinkIssueModal.linkIssueFailed',
    defaultMessage: 'Failed to link issue',
  },
});

@withModal('linkIssueModal')
@reduxForm({
  form: 'linkIssueForm',
  validate: ({ issues }) => ({
    issues:
      issues &&
      issues.map((issue) => ({
        issueLink: (!issue.issueLink || !validate.url(issue.issueLink)) && 'urlHint',
        issueId: (!issue.issueId || !validate.issueId(issue.issueId)) && 'issueIdHint',
      })),
  }),
})
@connect(
  (state) => ({
    requestUrl: URLS.testItemsLinkIssues(activeProjectSelector(state)),
    namedBtsIntegrations: namedAvailableBtsIntegrationsSelector(state),
  }),
  {
    showNotification,
  },
)
@injectIntl
@track()
export class LinkIssueModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    requestUrl: PropTypes.string.isRequired,
    showNotification: PropTypes.func.isRequired,
    namedBtsIntegrations: PropTypes.object.isRequired,
    initialize: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    change: PropTypes.func.isRequired,
    dirty: PropTypes.bool.isRequired,
    data: PropTypes.shape({
      items: PropTypes.array,
      fetchFunc: PropTypes.func,
    }).isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  constructor(props) {
    super(props);
    this.pluginNamesOptions = Object.keys(props.namedBtsIntegrations).map((key) => ({
      value: key,
      label: INTEGRATION_NAMES_TITLES[key],
    }));
    const pluginName = this.pluginNamesOptions[0].value;

    this.props.initialize({
      issues: [{}],
    });
    this.state = {
      pluginName,
      integrationId: props.namedBtsIntegrations[pluginName][0].id,
    };
  }

  onFormSubmit = (formData) => {
    const {
      intl,
      requestUrl,
      data: { items, fetchFunc },
      namedBtsIntegrations,
    } = this.props;
    const { pluginName, integrationId } = this.state;
    const {
      integrationParameters: { project, url },
    } = namedBtsIntegrations[pluginName].find((item) => item.id === integrationId);
    const testItemIds = items.map((item) => item.id);
    const issues = formData.issues.map((issue) => ({
      ticketId: issue.issueId,
      url: issue.issueLink,
      btsProject: project,
      btsUrl: url,
    }));

    fetch(requestUrl, {
      method: 'put',
      data: {
        issues,
        testItemIds,
      },
    })
      .then(() => {
        this.closeModal();
        fetchFunc();
        this.props.showNotification({
          message: intl.formatMessage(messages.linkIssueSuccess),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
      })
      .catch(() => {
        this.props.showNotification({
          message: intl.formatMessage(messages.linkIssueFailed),
          type: NOTIFICATION_TYPES.ERROR,
        });
      });
  };

  onLink = () => (closeModal) => {
    this.props.tracking.trackEvent(STEP_PAGE_EVENTS.LOAD_BTN_LOAD_BUG_MODAL);
    this.closeModal = closeModal;
    this.props.handleSubmit(this.onFormSubmit)();
  };

  onChangePlugin = (pluginName) => {
    this.setState({
      pluginName,
      integrationId: this.props.namedBtsIntegrations[pluginName][0].id,
    });
  };

  onChangeIntegrationName = (integrationId) => {
    this.setState({
      integrationId,
    });
  };

  getCloseConfirmationConfig = () => {
    if (!this.props.dirty) {
      return null;
    }
    return {
      confirmationWarning: this.props.intl.formatMessage(COMMON_LOCALE_KEYS.CLOSE_MODAL_WARNING),
    };
  };

  getIntegrationNamesOptions = () =>
    this.props.namedBtsIntegrations[this.state.pluginName].map((item) => ({
      value: item.id,
      label: item.name,
    }));

  isMultipleBtsPlugins = () => Object.keys(this.props.namedBtsIntegrations).length > 1;

  isMultipleBtsIntegrations = () =>
    this.props.namedBtsIntegrations[this.state.pluginName].length > 1;

  render() {
    const { intl } = this.props;
    const okButton = {
      text: intl.formatMessage(messages.linkButton),
      onClick: this.onLink(),
    };
    const cancelButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.CANCEL),
      eventInfo: STEP_PAGE_EVENTS.CANCEL_BTN_LOAD_BUG_MODAL,
    };

    console.log(this.isMultipleBtsPlugins());
    console.log(this.isMultipleBtsIntegrations());

    return (
      <ModalLayout
        title={
          <span className={cx('link-issue-title')}>
            {intl.formatMessage(messages.title)}
            <BetaBadge />
          </span>
        }
        okButton={okButton}
        cancelButton={cancelButton}
        closeConfirmation={this.getCloseConfirmationConfig()}
        closeIconEventInfo={STEP_PAGE_EVENTS.CLOSE_ICON_LOAD_BUG_MODAL}
      >
        <h4 className={cx('add-issue-id-title')}>{intl.formatMessage(messages.addIssueIdTitle)}</h4>
        <div className={cx('link-issue-form-wrapper')}>
          <form>
            <FormField
              containerClassName={cx('field-container')}
              fieldWrapperClassName={cx('field-wrapper')}
              label={intl.formatMessage(messages.btsTitle)}
              labelClassName={cx('systems-dropdown-title')}
              withoutProvider
            >
              <InputDropdown
                value={this.state.pluginName}
                options={this.pluginNamesOptions}
                onChange={this.onChangePlugin}
                disabled={!this.isMultipleBtsPlugins()}
              />
            </FormField>
            <FormField
              containerClassName={cx('field-container')}
              fieldWrapperClassName={cx('field-wrapper')}
              label={intl.formatMessage(messages.integrationNameTitle)}
              labelClassName={cx('systems-dropdown-title')}
              withoutProvider
            >
              <InputDropdown
                value={this.state.integrationId}
                options={this.getIntegrationNamesOptions()}
                onChange={this.onChangeIntegrationName}
                disabled={!this.isMultipleBtsIntegrations()}
              />
            </FormField>
            <FieldArray
              name="issues"
              change={this.props.change}
              component={LinkIssueFields}
              addEventInfo={STEP_PAGE_EVENTS.ADD_NEW_ISSUE_BTN_LOAD_BUG_MODAL}
            />
          </form>
        </div>
      </ModalLayout>
    );
  }
}
