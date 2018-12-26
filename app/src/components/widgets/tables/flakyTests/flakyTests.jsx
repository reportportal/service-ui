import * as React from 'react';
import PropTypes from 'prop-types';
import { TestsTableWidget } from '../components/testsTableWidget';
import * as cfg from './flakyTestsCfg';

export const FlakyTests = ({ widget: { content }, nameClickHandler }) => (
  <TestsTableWidget
    tests={content.flaky}
    launchName={content.latestLaunch.name}
    nameClickHandler={nameClickHandler}
    columns={cfg.columns}
  />
);

FlakyTests.propTypes = {
  widget: PropTypes.object.isRequired,
  nameClickHandler: PropTypes.func,
};
FlakyTests.defaultProps = {
  nameClickHandler: () => {},
};
