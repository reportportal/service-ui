import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { namedIntegrationsSelectorsMap } from 'controllers/project';
import { showDefaultErrorNotification } from 'controllers/notification';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { INTEGRATIONS_INFO_COMPONENTS_MAP } from '../../constants';

@connect(
  (state, ownProps) => ({
    projectIntegrations: namedIntegrationsSelectorsMap[ownProps.integrationType.name](state),
  }),
  { showDefaultErrorNotification },
)
export class IntegrationInfoContainer extends Component {
  static propTypes = {
    onItemClick: PropTypes.func.isRequired,
    integrationType: PropTypes.object.isRequired,
    projectIntegrations: PropTypes.array.isRequired,
    showDefaultErrorNotification: PropTypes.func.isRequired,
  };

  state = {
    loading: true,
    globalIntegrations: [],
  };

  componentDidMount() {
    this.fetchGlobalIntegrations();
  }

  fetchGlobalIntegrations = () => {
    const { integrationType } = this.props;

    fetch(URLS.globalIntegrationsByPluginName(integrationType.name))
      .then((globalIntegrations) => {
        this.setState({
          globalIntegrations,
          loading: false,
        });
      })
      .catch((error) => {
        this.props.showDefaultErrorNotification(error);
        this.setState({
          loading: false,
        });
      });
  };

  render() {
    const { integrationType, projectIntegrations, onItemClick } = this.props;

    const IntegrationInfoComponent = INTEGRATIONS_INFO_COMPONENTS_MAP[integrationType.name];

    return (
      <Fragment>
        {this.state.loading ? (
          <SpinningPreloader />
        ) : (
          IntegrationInfoComponent && (
            <IntegrationInfoComponent
              pluginData={integrationType}
              onItemClick={onItemClick}
              projectIntegrations={projectIntegrations}
              globalIntegrations={this.state.globalIntegrations}
              onConfirm={this.fetchGlobalIntegrations}
            />
          )
        )}
      </Fragment>
    );
  }
}
