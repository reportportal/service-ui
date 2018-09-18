import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { btsIntegrationsSelector } from 'controllers/project';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { SYSTEM_TYPES } from './instancesBlock/constants';
import { JiraInstances } from './instancesBlock/jiraInstances';
import { RallyInstanceForm } from './instancesBlock/rallyInstanceForm';
import styles from './bugTrackingSystemTab.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  systemTypeCaption: {
    id: 'BugTrackingSystemTab.systemTypeCaption',
    defaultMessage: 'Bug tracking system',
  },
  noMicroServiceMessage: {
    id: 'BugTrackingSystemTab.noMicroServiceMessage',
    defaultMessage: 'To configure bug tracking system, please deploy appropriate micro-service',
  },
  configureNewSystemWarning: {
    id: 'BugTrackingSystemTab.configureNewSystemWarning',
    defaultMessage:
      'Warning! If you configure new system settings, the current project will be reset!',
  },
});

const systemInstancesMap = {
  [SYSTEM_TYPES.jira]: JiraInstances,
  [SYSTEM_TYPES.rally]: RallyInstanceForm,
};

@connect((state) => ({
  btsIntegrations: btsIntegrationsSelector(state),
}))
@injectIntl
export class BugTrackingSystemTab extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    btsIntegrations: PropTypes.array,
  };

  static defaultProps = {
    btsIntegrations: [],
  };

  constructor(props) {
    super(props);
    this.dropDownOptions = props.btsIntegrations.map((item) => ({
      value: item.integrationType.name,
      label: item.integrationType.name.toUpperCase(),
    }));

    this.state = {
      systemType:
        (props.btsIntegrations.length && props.btsIntegrations[0].integrationType.name) ||
        (this.dropDownOptions.length && this.dropDownOptions[0].value) ||
        '',
    };
  }

  onChangeSystemType = (value) => {
    this.setState({
      systemType: value,
    });
  };

  getInstances = () =>
    (
      this.props.btsIntegrations.find((item) => item.integrationType.name === this.state.systemType)
        .integrationParameters || {}
    ).instances || [];

  checkIfTheConfigureNewSystem = () =>
    this.getInstances().length
      ? this.props.btsIntegrations[0].integrationType.name !== this.state.systemType
      : false;

  render() {
    const { intl, btsIntegrations } = this.props;
    const InstancesComponent = systemInstancesMap[this.state.systemType];

    return (
      <div className={cx('bug-tracking-system-tab')}>
        <div className={cx('system-type-block')}>
          <span className={cx('system-type-caption')}>
            {intl.formatMessage(messages.systemTypeCaption)}
          </span>
          <div className={cx('system-type-input-wrapper')}>
            <InputDropdown
              options={this.dropDownOptions}
              value={this.state.systemType}
              onChange={this.onChangeSystemType}
              disabled={!btsIntegrations.length}
              mobileDisabled
            />
          </div>
          <div className={cx('disabling-cover')} />
        </div>
        {btsIntegrations.length ? (
          <Fragment>
            {this.checkIfTheConfigureNewSystem() && (
              <span className={cx('configure-new-system-warning')}>
                {intl.formatMessage(messages.configureNewSystemWarning)}
              </span>
            )}
            <InstancesComponent instances={this.getInstances()} />
          </Fragment>
        ) : (
          <div className={cx('no-micro-service-message')}>
            {intl.formatMessage(messages.noMicroServiceMessage)}
          </div>
        )}
      </div>
    );
  }
}
