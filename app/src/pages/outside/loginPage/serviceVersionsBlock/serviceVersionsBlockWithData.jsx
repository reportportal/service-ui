import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import fetchJsonp from 'fetch-jsonp';
import semverDiff from 'semver-diff';
import { ServiceVersionsBlock } from './serviceVersionsBlock';

@connect((state) => ({
  serviceVersions: state.appInfo,
}))
export class ServiceVersionsBlockWithData extends Component {
  static propTypes = {
    serviceVersions: PropTypes.object,
  };

  static defaultProps = {
    serviceVersions: {},
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
          services: this.calculateServices(this.props.serviceVersions, latestServiceVersions),
        }),
      );
  }

  calculateServices = (serviceVersions, latestServiceVersions) => {
    const services = {};

    Object.keys(serviceVersions).map((serviceKey) => {
      const component = serviceVersions[serviceKey];
      const componentKeys = Object.keys(component);

      if (!componentKeys.length) return false;

      componentKeys.map((objKey) => {
        const value = component[objKey];

        if (!value.build) return false;

        const currentVersion = value.build.version;

        if (!currentVersion) return false;

        const latestVersion = latestServiceVersions[value.build.repo];

        services[objKey] = {
          name: value.build.name,
          version: value.build.version,
          newVersion: latestVersion || null,
          repo: value.build.repo || null,
          isDeprecated:
            value.build.repo && latestVersion && semverDiff(currentVersion, latestVersion),
        };

        return true;
      });

      return true;
    });

    return services;
  };

  render() {
    return <ServiceVersionsBlock services={this.state.services} />;
  }
}
