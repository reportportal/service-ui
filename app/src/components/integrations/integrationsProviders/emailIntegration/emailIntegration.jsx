import React from 'react';
import PropTypes from 'prop-types';

export const EmailIntegration = ({ instances }) => <div>{instances[0].id}</div>;

EmailIntegration.propTypes = {
  instances: PropTypes.array.isRequired,
};
