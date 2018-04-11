import * as React from 'react';
import { func } from 'prop-types';
import { TestsTableWidget, PTypes } from '../components/testsTableWidget';
import * as cfg from './mostFailedTestsCfg';

class MostFailedTests extends React.PureComponent {
  static propTypes = {
    tests: PTypes.PTTests.isRequired,
    launch: PTypes.PTLaunch.isRequired,
    nameClickHandler: func.isRequired,
    issueType: PTypes.PTIssueType.isRequired,
  };

  getIssueTypeMessage = (issueType) => {
    const type = issueType.split('$')[2];
    return cfg.issueTypes[type];
  };

  render() {
    const { tests, launch, nameClickHandler, issueType } = this.props;

    return (
      <TestsTableWidget
        tests={tests}
        launchName={launch.name}
        nameClickHandler={nameClickHandler}
        issueType={this.getIssueTypeMessage(issueType)}
        columns={cfg.columns}
      />
    );
  }
}

export default MostFailedTests;
