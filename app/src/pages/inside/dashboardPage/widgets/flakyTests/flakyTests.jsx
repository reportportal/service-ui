import * as React from 'react';
import { func } from 'prop-types';
import { TestsTableWidget, PTypes } from '../components/testsTableWidget';
import * as cfg from './flakyTestsCfg';

class MostFailedTests extends React.PureComponent {
  static propTypes = {
    tests: PTypes.PTTests.isRequired,
    launch: PTypes.PTLaunch.isRequired,
    nameClickHandler: func.isRequired,
  };

  render() {
    const { tests, launch, nameClickHandler } = this.props;

    return (
      <TestsTableWidget
        tests={tests}
        launchName={launch.name}
        nameClickHandler={nameClickHandler}
        columns={cfg.columns}
      />
    );
  }
}

export default MostFailedTests;
