import * as React from 'react';
import { func, oneOf } from 'prop-types';
import {
  STATS_FAILED,
  STATS_SKIPPED,
  STATS_PB_TOTAL,
  STATS_AB_TOTAL,
  STATS_SI_TOTAL,
  STATS_ND_TOTAL,
} from 'common/constants/statistics';
import { TestsTableWidget, PTypes } from '../components/testsTableWidget';
import * as cfg from './mostFailedTestsCfg';

const PTIssueType = oneOf([
  STATS_FAILED,
  STATS_SKIPPED,
  STATS_PB_TOTAL,
  STATS_AB_TOTAL,
  STATS_SI_TOTAL,
  STATS_ND_TOTAL,
]);

class MostFailedTests extends React.Component {
  static propTypes = {
    tests: PTypes.PTTests.isRequired,
    launch: PTypes.PTLaunch.isRequired,
    nameClickHandler: func.isRequired,
    issueType: PTIssueType.isRequired,
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

export { MostFailedTests };
