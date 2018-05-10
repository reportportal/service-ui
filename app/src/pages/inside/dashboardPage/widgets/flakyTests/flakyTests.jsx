import * as React from 'react';
import { func } from 'prop-types';
import { TestsTableWidget, PTypes } from '../components/testsTableWidget';
import * as cfg from './flakyTestsCfg';

const FlakyTests = ({ tests, launch, nameClickHandler }) => (
  <TestsTableWidget
    tests={tests}
    launchName={launch.name}
    nameClickHandler={nameClickHandler}
    columns={cfg.columns}
  />
);

FlakyTests.propTypes = {
  tests: PTypes.PTTests.isRequired,
  launch: PTypes.PTLaunch.isRequired,
  nameClickHandler: func.isRequired,
};

export { FlakyTests };
