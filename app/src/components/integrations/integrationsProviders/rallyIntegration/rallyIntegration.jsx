import React from 'react';
import PropTypes from 'prop-types';

export const RallyIntegration = ({ instances }) => <div>{instances[0].id}</div>;

RallyIntegration.propTypes = {
  instances: PropTypes.array.isRequired,
};
