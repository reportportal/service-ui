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
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import styles from './projectSelector.scss';

const cx = classNames.bind(styles);

export class ProjectSelector extends Component {
  static propTypes = {
    projects: PropTypes.arrayOf(PropTypes.string),
    activeProject: PropTypes.string,
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
  handleOutsideClick = (e) => {
    if (!this.node.contains(e.target) && this.state.opened) {
      this.setState({ opened: false });
    }
  };
  toggleShowList = () => {
    this.setState({ opened: !this.state.opened });
  };

  render() {
    return (
      <div ref={(node) => { this.node = node; }} className={cx('project-selector')} onClick={this.toggleShowList} >
        <div className={cx('current-project-block')}>
          <div className={cx('current-project-name')}>
            { this.props.activeProject }
          </div>
          <div className={cx({ 'show-list-icon': true, 'turned-over': this.state.opened })} />
        </div>
        <div className={cx({ 'projects-list': true, shown: this.state.opened })} >
          <ScrollWrapper autoHeight autoHeightMax={600}>
            {
            Array.map(this.props.projects, project => (
              <NavLink key={project} className={cx('project-list-item')} activeClassName={cx('active')} to={`/${project}`}>
                {project}
              </NavLink>
            ))
            }
          </ScrollWrapper>
        </div>
      </div>
    );
  }
}
