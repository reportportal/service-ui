import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import fetchJsonp from 'fetch-jsonp';
import semverDiff from 'semver-diff';
import { compositeInfoSelector } from 'controllers/appInfo';
import { ServiceVersionsBlock } from './serviceVersionsBlock';

@connect((state) => ({
  compositeInfo: compositeInfoSelector(state),
}))
export class ServiceVersionsBlockWithData extends Component {
  static propTypes = {
    compositeInfo: PropTypes.object,
  };

  static defaultProps = {
    compositeInfo: {},
  };

  state = {
    services: {},
  };

  componentWillMount() {
    fetchJsonp('http://status.reportportal.io/versions', {
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
    const { compositeInfo } = this.props;

    Object.keys(compositeInfo).forEach((serviceKey) => {
      const serviceValue = compositeInfo[serviceKey];
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
