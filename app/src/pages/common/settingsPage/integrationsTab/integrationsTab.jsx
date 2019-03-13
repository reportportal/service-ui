import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { projectIdSelector } from 'controllers/pages';
import { uniqueGroupedIntegrationsSelector } from 'controllers/project';
import { IntegrationModal } from 'components/integrations';
import { IntegrationsList } from './integrationsList';
import styles from './integrationsTab.scss';

const cx = classNames.bind(styles);

@connect((state) => ({
  projectId: projectIdSelector(state),
  uniqueGroupedIntegrations: uniqueGroupedIntegrationsSelector(state),
}))
export class IntegrationsTab extends Component {
  static propTypes = {
    projectId: PropTypes.string.isRequired,
    uniqueGroupedIntegrations: PropTypes.object.isRequired,
  };

  state = {
    popupData: null,
  };

  togglePopupHandler = (popupData) => this.setState({ popupData });

  render() {
    return (
      <div className={cx('integrations-tab')}>
        <IntegrationsList
          activeItem={(this.state.popupData || {}).integrationType}
          onItemClick={this.togglePopupHandler}
          groupedIntegrations={this.props.uniqueGroupedIntegrations}
        />
        {this.state.popupData && (
          <IntegrationModal data={this.state.popupData} hideModalAction={this.togglePopupHandler} />
        )}
      </div>
    );
  }
}
