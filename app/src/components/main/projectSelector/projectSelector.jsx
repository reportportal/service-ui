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
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ScrollWrapper from 'components/common/scrollWrapper/scrollWrapper';
import styles from './projectSelector.scss';

const cx = classNames.bind(styles);

class ProjectSelector extends Component {

  constructor(props) {
    super(props);
    this.state = {
      activeProject: props.activeProject,
      opened: false,
    };
  }

  onClickProjectItem = (e) => {
    this.setState({ activeProject: e.currentTarget.dataset.project, opened: false });
  };
  toggleShowList = () => {
    this.setState({ opened: !this.state.opened });
  };

  render() {
    return (
      <div className={cx('project-selector')}>
        <div className={cx('current-project-block')} onClick={this.toggleShowList}>
          <div className={cx('current-project-name')}>
            { this.state.activeProject }
          </div>
          <div className={cx({ 'show-list-icon': true, 'turned-over': this.state.opened })} />
        </div>
        <div className={cx({ 'projects-list': true, shown: this.state.opened })}>
          <ScrollWrapper autoHeight autoHeightMax={600}>
            {
            Array.map(this.props.projects, project => (
              <div key={project} data-project={project} className={cx({ 'project-list-item': true, active: project === this.state.activeProject })} onClick={this.onClickProjectItem}>
                {project}
              </div>
              ))
            }
          </ScrollWrapper>
        </div>
      </div>
    );
  }
}

ProjectSelector.propTypes = {
  projects: PropTypes.arrayOf(PropTypes.string),
  activeProject: PropTypes.string,
};

ProjectSelector.defaultProps = {
  projects: [],
  activeProject: '',
};

export default ProjectSelector;
