import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import styles from './projectsAndRolesColumn.scss';

const cx = classNames.bind(styles);
const formatProjectRole = (projectRole) => projectRole.toLowerCase().replace(/_/g, ' ');

export class ProjectsAndRolesColumn extends Component {
  static propTypes = {
    className: PropTypes.string.isRequired,
    value: PropTypes.object,
  };
  static defaultProps = {
    value: {},
  };
  state = {
    expanded: false,
  };
  handleExpand = () => {
    this.setState({ expanded: !this.state.expanded });
  };
  render() {
    const { className, value } = this.props;
    const allProjects = Object.keys(value.assignedProjects);
    const firstProjects = allProjects.slice(0, 2);
    const restProjects = allProjects.slice(2);
    return (
      <div className={cx('projects-and-roles-col', className)}>
        <span className={cx('mobile-label', 'projects-and-roles-mobile-label')}>
          <FormattedMessage
            id={'AllUsersGrid.projectsAndRolesCol'}
            defaultMessage={'Projects and roles'}
          />
        </span>
        {firstProjects.map((project, index) => (
          <span key={project} className={cx('project')}>
            {project}
            {index < firstProjects.length - 1 && ', '}
            <span className={cx('shown-on-mobile')}>
              {index >= 0 && ', '}
              <span className={cx('project-role')}>
                {formatProjectRole(value.assignedProjects[project].projectRole)}
              </span>
            </span>
          </span>
        ))}
        {this.state.expanded &&
          restProjects.map((project, index) => (
            <span key={project} className={cx('project', 'shown-on-mobile')}>
              {project}
              {index < restProjects.length && ', '}
              <span className={cx('project-role')}>
                {formatProjectRole(value.assignedProjects[project].projectRole)}
              </span>
            </span>
          ))}
        {restProjects.length > 0 &&
          !this.state.expanded && (
            <span className={cx('show-more-projects')} onClick={this.handleExpand}>
              +{restProjects.length}
              <span className={cx('mobile-label', 'show-more-projects-label')}>
                <FormattedMessage id={'ProjectsAndRolesColumn.more'} defaultMessage={'more'} />
              </span>
            </span>
          )}
      </div>
    );
  }
}
