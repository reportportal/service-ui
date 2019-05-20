import PropTypes from 'prop-types';

export const dynamicFieldShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  fieldType: PropTypes.string.isRequired,
  fieldName: PropTypes.string.isRequired,
  definedValues: PropTypes.arrayOf(
    PropTypes.shape({
      valueId: PropTypes.string,
      valueName: PropTypes.string,
    }),
  ),
  required: PropTypes.bool,
  value: PropTypes.array,
  disabled: PropTypes.bool,
});
