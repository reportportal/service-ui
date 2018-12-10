import React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'components/inputs/input';
import { DynamicField } from '../../dynamicField';

export const TextField = ({ field, customBlock }) => (
  <DynamicField field={field} customBlock={customBlock}>
    <Input mobileDisabled />
  </DynamicField>
);

TextField.propTypes = {
  field: PropTypes.object.isRequired,
  customBlock: PropTypes.object,
};

TextField.defaultProps = {
  customBlock: {},
};
