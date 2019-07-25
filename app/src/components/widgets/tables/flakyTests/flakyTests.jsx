import * as React from 'react';
import PropTypes from 'prop-types';
import { TestsTableWidget } from '../components/testsTableWidget';
import * as cfg from './flakyTestsCfg';

export const FlakyTests = ({ widget: { content } }) => (
  <TestsTableWidget tests={content.flaky} launch={content.latestLaunch} columns={cfg.columns} />
);

FlakyTests.propTypes = {
  widget: PropTypes.object.isRequired,
};
