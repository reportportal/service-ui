import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { projectIdSelector } from 'controllers/pages';
import { activeProjectSelector } from 'controllers/user';
import { removeIntegrationAction } from 'controllers/plugins';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { INTEGRATION_NAMES_TITLES } from '../../constants';
import { INTEGRATION_FORM } from './integrationForm/constants';
import { ConnectionSection } from './connectionSection';
import { IntegrationForm } from './integrationForm';
import styles from './integrationSettings.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  failedConnectMessage: {
    id: 'IntegrationSettings.failedConnectMessage',
    defaultMessage: 'Failed connect to {pluginName} integration: {error}',
  },
});

@connect(
  (state) => ({
    projectId: projectIdSelector(state),
    activeProject: activeProjectSelector(state),
  }),
  {
    removeIntegrationAction,
  },
)
@injectIntl
export class IntegrationSettings extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    projectId: PropTypes.string,
    activeProject: PropTypes.string.isRequired,
    data: PropTypes.object.isRequired,
    formFieldsComponent: PropTypes.func.isRequired,
    goToPreviousPage: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
    removeIntegrationAction: PropTypes.func.isRequired,
    editAuthConfig: PropTypes.object,
    isEmptyConfiguration: PropTypes.bool,
    isGlobal: PropTypes.bool,
    formKey: PropTypes.string,
  };

  static defaultProps = {
    projectId: '',
    editAuthConfig: null,
    isEmptyConfiguration: false,
    isGlobal: false,
    formKey: INTEGRATION_FORM,
  };

  state = {
    connected: false,
    loading: true,
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
      data: { id },
      projectId,
      activeProject,
    } = this.props;

    this.setState({
      loading: true,
    });

    fetch(URLS.testIntegrationConnection(projectId || activeProject, id))
      .then(() => {
        this.setState({
          connected: true,
          loading: false,
          updated: false,
        });
      })
      .catch(({ message }) => {
        this.setState({
          connected: false,
          errorMessage: message,
          loading: false,
          updated: false,
        });
      });
  };

  updateIntegrationHandler = (data, onConfirm, metaData) => {
    this.props.onUpdate(
      data,
      () => {
        onConfirm();
        this.setState({
          updated: true,
        });
      },
      metaData,
    );
  };

  removeIntegration = () => {
    const {
      data: { id },
      isGlobal,
      goToPreviousPage,
    } = this.props;

    this.props.removeIntegrationAction(id, isGlobal, goToPreviousPage);
  };

  render() {
    const {
      intl: { formatMessage },
      data,
      formFieldsComponent,
      editAuthConfig,
      isEmptyConfiguration,
      formKey,
      isGlobal,
    } = this.props;
    const { loading, connected, errorMessage } = this.state;
    const pluginName = data.integrationType.name;

    return (
      <div className={cx('integration-settings')}>
        {loading ? (
          <SpinningPreloader />
        ) : (
          <Fragment>
            <ConnectionSection
              blocked={data.blocked}
              failedConnectionMessage={
                connected
                  ? null
                  : formatMessage(messages.failedConnectMessage, {
                      pluginName: INTEGRATION_NAMES_TITLES[pluginName] || pluginName,
                      error: errorMessage,
                    })
              }
              onRemoveIntegration={this.removeIntegration}
              editAuthConfig={editAuthConfig}
            />
            <IntegrationForm
              form={formKey}
              data={data}
              connected={connected}
              pluginName={pluginName}
              isGlobal={isGlobal}
              onSubmit={this.updateIntegrationHandler}
              formFieldsComponent={formFieldsComponent}
              isEmptyConfiguration={isEmptyConfiguration}
            />
          </Fragment>
        )}
      </div>
    );
  }
}
