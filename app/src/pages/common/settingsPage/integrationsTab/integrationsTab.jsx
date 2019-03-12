import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { projectIdSelector } from 'controllers/pages';
import { groupedIntegrationsSelector } from 'controllers/project';
import { IntegrationsList } from './integrationsList';
import styles from './integrationsTab.scss';

const cx = classNames.bind(styles);

@connect((state) => ({
  projectId: projectIdSelector(state),
  groupedIntegrations: groupedIntegrationsSelector(state),
}))
export class IntegrationsTab extends Component {
  static propTypes = {
    projectId: PropTypes.string.isRequired,
    groupedIntegrations: PropTypes.object.isRequired,
  };

  render() {
    return (
      <div className={cx('integrations-tab')}>
        <IntegrationsList groupedIntegrations={this.props.groupedIntegrations} />
      </div>
    );
  }
}
