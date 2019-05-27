/*
 * Copyright 2017 EPAM Systems
 *
 *
 * This file is part of EPAM Report Portal.
 * https://github.com/reportportal/service-ui
 *
 * Report Portal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Report Portal is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Report Portal.  If not, see <http://www.gnu.org/licenses/>.
 */

import classNames from 'classnames/bind';
import track from 'react-tracking';
import React, { Component } from 'react';
import { NavLink } from 'redux-first-router-link';
import PropTypes from 'prop-types';
import { HEADER_EVENTS } from 'components/main/analytics/events';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { PROJECT_PAGE } from 'controllers/pages/constants';
import styles from './projectSelector.scss';

const cx = classNames.bind(styles);

@track()
export class ProjectSelector extends Component {
  static propTypes = {
    projects: PropTypes.arrayOf(PropTypes.string),
    activeProject: PropTypes.string,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };
  static defaultProps = {
    projects: [],
    activeProject: '',
  };
  state = {
    opened: false,
  };
  componentDidMount() {
    document.addEventListener('click', this.handleOutsideClick, false);
  }
  componentWillUnmount() {
    document.removeEventListener('click', this.handleOutsideClick, false);
  }

  onClickProjectName = () => {
    this.props.tracking.trackEvent(HEADER_EVENTS.CLICK_PROJECT_NAME_LINK);
  };

  toggleShowList = () => {
    this.props.tracking.trackEvent(HEADER_EVENTS.CLICK_PROJECT_DROPDOWN);
    this.setState({ opened: !this.state.opened });
  };

  handleOutsideClick = (e) => {
    if (this.node && !this.node.contains(e.target) && this.state.opened) {
      this.setState({ opened: false });
    }
  };

  render() {
    return (
      <div
        ref={(node) => {
          this.node = node;
        }}
        className={cx('project-selector')}
        onClick={this.toggleShowList}
      >
        <div className={cx('current-project-block')}>
          <div className={cx('current-project-name')}>{this.props.activeProject}</div>
          <div className={cx('show-list-icon', { 'turned-over': this.state.opened })} />
        </div>
        <div className={cx({ 'projects-list': true, shown: this.state.opened })}>
          <ScrollWrapper autoHeight autoHeightMax={600}>
            {Array.map(this.props.projects, (project) => (
              <NavLink
                to={{ type: PROJECT_PAGE, payload: { projectId: project } }}
                key={project}
                className={cx('project-list-item')}
                activeClassName={cx('active')}
                onClick={this.onClickProjectName}
              >
                {project}
              </NavLink>
            ))}
          </ScrollWrapper>
        </div>
      </div>
    );
  }
}
