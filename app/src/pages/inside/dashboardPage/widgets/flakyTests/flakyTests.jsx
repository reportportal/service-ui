import * as React from 'react';
import PropTypes from 'prop-types';
import { TestsTableWidget } from '../components/testsTableWidget';
import * as cfg from './flakyTestsCfg';

const FlakyTests = ({ widget: { content }, nameClickHandler }) => (
  <TestsTableWidget
    tests={content.flaky}
    launchName={content.latestLaunch.name}
    nameClickHandler={nameClickHandler}
    columns={cfg.columns}
  />
);

FlakyTests.propTypes = {
  // tests: PTypes.PTTests.isRequired,
  // launch: PTypes.PTLaunch.isRequired,
  widget: PropTypes.object.isRequired,
  nameClickHandler: PropTypes.func.isRequired,
};

FlakyTests.defaultProps = {
  nameClickHandler: () => {},
};

export { FlakyTests };
