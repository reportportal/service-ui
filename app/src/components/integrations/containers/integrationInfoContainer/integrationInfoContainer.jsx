import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { namedIntegrationsSelectorsMap } from 'controllers/project';
import { showDefaultErrorNotification } from 'controllers/notification';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { INTEGRATIONS_IMAGES_MAP, INTEGRATION_NAMES_TITLES } from '../../constants';
import { INTEGRATIONS_DESCRIPTIONS_MAP } from '../../messages';
import { InfoSection } from './infoSection';
import { InstancesSection } from './instancesSection';

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
    const {
      integrationType: { name, details: { version } = {} },
      projectIntegrations,
      onItemClick,
    } = this.props;

    return (
      <Fragment>
        {this.state.loading ? (
          <SpinningPreloader />
        ) : (
          <Fragment>
            <InfoSection
              image={INTEGRATIONS_IMAGES_MAP[name]}
              description={INTEGRATIONS_DESCRIPTIONS_MAP[name]}
              version={version}
              title={INTEGRATION_NAMES_TITLES[name]}
            />
            <InstancesSection
              globalIntegrations={this.state.globalIntegrations}
              projectIntegrations={projectIntegrations}
              onItemClick={onItemClick}
              instanceType={name}
            />
          </Fragment>
        )}
      </Fragment>
    );
  }
}
