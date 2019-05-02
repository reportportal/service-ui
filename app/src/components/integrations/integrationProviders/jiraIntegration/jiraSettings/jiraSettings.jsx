import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { projectIdSelector } from 'controllers/pages';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { ConnectionSection, IntegrationForm } from '../../../elements';
import { JiraIssueFormFields } from '../jiraIssueFormFields';
import styles from './jiraSettings.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  failedConnectMessage: {
    id: 'JiraSettings.failedConnectMessage',
    defaultMessage:
      'Please, check current authorization settings or general project health status in Jira!',
  },
});

@connect((state) => ({
  projectId: projectIdSelector(state),
}))
@injectIntl
export class JiraSettings extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    projectId: PropTypes.string.isRequired,
    data: PropTypes.object.isRequired,
    goToPreviousPage: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
  };

  state = {
    connected: false,
    loading: false,
    updated: false,
  };

  componentDidMount() {
    this.testIntegrationConnection();
  }

  componentDidUpdate() {
    if (this.state.updated && !this.state.loading) {
      this.testIntegrationConnection();
    }
  }

  testIntegrationConnection = () => {
    const {
      data: {
        id,
        integrationParameters: { url, project },
      },
      projectId,
    } = this.props;

    this.setState({
      loading: true,
    });

    fetch(URLS.connectToBtsIntegration(projectId, id), {
      method: 'put',
      data: {
        url,
        btsProject: project,
      },
    })
      .then(() => {
        this.setState({
          connected: true,
          loading: false,
          updated: false,
        });
      })
      .catch(() => {
        this.setState({
          connected: false,
          loading: false,
          updated: false,
        });
      });
  };

  updateIntegrationHandler = (data, onConfirm) => {
    this.props.onUpdate(data, () => {
      onConfirm();
      this.setState({
        updated: true,
      });
    });
  };

  render() {
    const {
      intl: { formatMessage },
      data,
      goToPreviousPage,
    } = this.props;
    const { loading, connected } = this.state;

    return (
      <div className={cx('jira-settings')}>
        {loading ? (
          <SpinningPreloader />
        ) : (
          <Fragment>
            <ConnectionSection
              disabled={data.blocked}
              failedConnectionMessage={
                connected ? null : formatMessage(messages.failedConnectMessage)
              }
              integrationId={data.id}
              onRemoveConfirmation={goToPreviousPage}
            />
            <IntegrationForm
              data={data}
              onSubmit={this.updateIntegrationHandler}
              formFieldsComponent={JiraIssueFormFields}
            />
          </Fragment>
        )}
      </div>
    );
  }
}
