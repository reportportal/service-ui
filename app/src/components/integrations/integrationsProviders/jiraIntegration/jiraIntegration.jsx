import React from 'react';
import PropTypes from 'prop-types';

export const JiraIntegration = ({ instances }) => <div>{instances[0].id}</div>;

JiraIntegration.propTypes = {
  instances: PropTypes.array.isRequired,
};
