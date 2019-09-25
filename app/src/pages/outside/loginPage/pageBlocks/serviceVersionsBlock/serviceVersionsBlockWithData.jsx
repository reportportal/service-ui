import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import fetchJsonp from 'fetch-jsonp';
import semverDiff from 'semver-diff';
import { appInfoSelector } from 'controllers/appInfo';
import { ServiceVersionsBlock } from './serviceVersionsBlock';

@connect((state) => ({
  appInfo: appInfoSelector(state),
}))
export class ServiceVersionsBlockWithData extends Component {
  static propTypes = {
    appInfo: PropTypes.object,
  };

  static defaultProps = {
    appInfo: {},
  };

  state = {
    services: {},
  };

  componentWillMount() {
    fetchJsonp('https://status.reportportal.io/versions', {
      jsonpCallback: 'jsonp',
    })
      .then((res) => res.json())
      .then((latestServiceVersions) =>
        this.setState({
          services: this.calculateServices(latestServiceVersions),
        }),
      );
  }

  calculateServices = (latestServiceVersions) => {
    const services = {};
    const { appInfo } = this.props;

    Object.keys(appInfo).forEach((serviceKey) => {
      const serviceValue = appInfo[serviceKey];
      if (!(serviceValue && serviceValue.build)) return false;

      const currentVersion = serviceValue.build.version;

      if (!currentVersion) return false;

      const latestVersion = latestServiceVersions[serviceValue.build.repo];

      services[serviceKey] = {
        name: serviceValue.build.name,
        version: serviceValue.build.version,
        newVersion: latestVersion || null,
        repo: serviceValue.build.repo || null,
        isDeprecated:
          serviceValue.build.repo && latestVersion && semverDiff(currentVersion, latestVersion),
      };

      return true;
    });

    return services;
  };

  render() {
    return <ServiceVersionsBlock services={this.state.services} />;
  }
}
