import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Input } from 'components/inputs/input';

export const InputWithIcon = ({ icon, ...rest }) => (
  <Fragment>
    <Input {...rest} />
    {icon}
  </Fragment>
);

InputWithIcon.propTypes = {
  icon: PropTypes.node,
};

InputWithIcon.defaultProps = {
  icon: null,
};
