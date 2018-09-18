import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl';
import Parser from 'html-react-parser';
import isEqual from 'fast-deep-equal';
import classNames from 'classnames/bind';
import { ContainerWithTabs } from 'components/main/containerWithTabs';
import PlusIcon from 'common/img/plus-button-inline.svg';
import { DEFAULT_JIRA_CONFIG, MOCK_PASSWORD } from '../constants';
import { JiraInstanceForm } from './jiraInstanceForm';
import styles from './jiraInstances.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  instancesTitle: {
    id: 'JiraInstances.instancesTitle',
    defaultMessage: 'BTS Instances:',
  },
  newInstanceTitle: {
    id: 'JiraInstances.newInstanceTitle',
    defaultMessage: 'Add new instance',
  },
});

@injectIntl
export class JiraInstances extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    instances: PropTypes.array,
  };

  static defaultProps = {
    instances: [],
  };

  static createTabsConfig = (instances) =>
    instances.map(({ project, ...rest }) => ({
      name: project,
      content: <JiraInstanceForm instanceData={{ ...rest, project, password: MOCK_PASSWORD }} />,
    }));

  static getNewProjectInstance = (removableConfig = {}, url = '') => ({
    name: <FormattedMessage id={'JiraInstances.newProject'} defaultMessage={'New project'} />,
    content: (
      <JiraInstanceForm
        newItem
        instanceData={{
          ...DEFAULT_JIRA_CONFIG,
          url,
        }}
      />
    ),
    removable: removableConfig.removable,
    onRemove: removableConfig.removable ? removableConfig.removeTabHandle : null,
  });

  static getDerivedStateFromProps(props, state) {
    if (!isEqual(props.instances, state.instances)) {
      const projects = JiraInstances.createTabsConfig(props.instances);
      let activeInstance = 0;
      if (state.activeInstance < projects.length) {
        activeInstance = state.activeInstance;
      }
      return {
        instances: props.instances,
        projects: (projects.length && projects) || [JiraInstances.getNewProjectInstance()],
        instancesQuantity: projects.length,
        activeInstance,
      };
    }
    return null;
  }

  constructor(props) {
    super(props);
    const projects = JiraInstances.createTabsConfig(props.instances);

    this.state = {
      instances: props.instances,
      projects: (projects.length && projects) || [JiraInstances.getNewProjectInstance()],
      instancesQuantity: projects.length,
      activeInstance: 0,
    };
  }

  removeTabHandle = () => {
    const { projects, prevActive } = this.state;
    this.setState({
      projects: [...projects.slice(0, projects.length - 1)],
      activeInstance: prevActive,
    });
  };

  addNewProject = () => {
    const { projects, activeInstance } = this.state;
    if (this.checkIfNewInstanceWasAdded()) {
      return;
    }

    const removableConfig = {
      removable: true,
      removeTabHandle: this.removeTabHandle,
    };

    this.setState({
      projects: [
        ...projects,
        JiraInstances.getNewProjectInstance(removableConfig, this.props.instances[0].url),
      ],
      prevActive: activeInstance,
      activeInstance: projects.length,
    });
  };

  checkIfNewInstanceWasAdded = () => this.state.projects.length === this.props.instances.length + 1;

  tabChangeHandle = (activeInstance) => {
    this.checkIfNewInstanceWasAdded() && this.removeTabHandle();
    this.setState({
      activeInstance,
    });
  };

  render() {
    const { intl } = this.props;

    return (
      <div className={cx('jira-instances')}>
        <span className={cx('instances-title')}>{intl.formatMessage(messages.instancesTitle)}</span>
        <ContainerWithTabs
          active={this.state.activeInstance}
          onChange={this.tabChangeHandle}
          customClass={cx('projects-tabs')}
          data={this.state.projects}
        />
        <div
          className={cx('new-instance-button', { disabled: this.checkIfNewInstanceWasAdded() })}
          onClick={this.addNewProject}
        >
          <span className={cx('new-instance-icon')}>{Parser(PlusIcon)}</span>
          <span className={cx('new-instance-title')}>
            {intl.formatMessage(messages.newInstanceTitle)}
          </span>
        </div>
      </div>
    );
  }
}
