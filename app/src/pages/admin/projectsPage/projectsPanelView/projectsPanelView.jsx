/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { loadingSelector, projectsSelector } from 'controllers/administrate/projects';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { ProjectPanel } from './projectPanel';
import styles from './projectsPanelView.scss';

const cx = classNames.bind(styles);

@connect((state) => ({
  projects: projectsSelector(state),
  loading: loadingSelector(state),
}))
export class ProjectsPanelView extends Component {
  static propTypes = {
    projects: PropTypes.array,
    loading: PropTypes.bool,
    onMembers: PropTypes.func,
    onSettings: PropTypes.func,
    onAssign: PropTypes.func,
    onUnassign: PropTypes.func,
    onDelete: PropTypes.func,
  };

  static defaultProps = {
    projects: [],
    loading: false,
    onMembers: () => {},
    onSettings: () => {},
    onAssign: () => {},
    onUnassign: () => {},
    onDelete: () => {},
  };

  // TODO: The request for organizations is made together with the request for all projects.
  // Create a store for organizations and drop a selector here that returns organizations.
  constructor(props) {
    super(props);
    this.state = {
      organizations: [],
    };

    fetch(URLS.organizationsList()).then((response) => {
      this.setState({ organizations: response?.content || [] });
    });
  }

  getPanelList = (projects) => {
    const { organizations } = this.state;

    return projects.map((project) => {
      const { organizationId } = project;

      const organizationSlug = organizations.find(({ id }) => id === Number(organizationId))?.slug;
      const projectWithOrganizationSlug = {
        ...project,
        organizationSlug,
      };

      return (
        <div className={cx('panel')} key={project.id}>
          <ProjectPanel
            project={projectWithOrganizationSlug}
            onMembersClick={this.props.onMembers}
            onSettingsClick={this.props.onSettings}
            onAssign={this.props.onAssign}
            onUnassign={this.props.onUnassign}
            onDelete={this.props.onDelete}
          />
        </div>
      );
    });
  };

  render() {
    const { projects, loading } = this.props;
    return (
      <Fragment>
        {loading && (
          <div className={cx('spinner-block')}>
            <SpinningPreloader />
          </div>
        )}
        {!loading &&
          (projects.length ? (
            <div className={cx('panel-list')}>{this.getPanelList(projects)}</div>
          ) : (
            ''
          ))}
      </Fragment>
    );
  }
}
