import PropTypes from 'prop-types';
import { EditableAttributeList } from './editableAttributeList';

export const AttributeListField = ({ value, ...rest }) => (
  <EditableAttributeList attributes={value} {...rest} />
);
AttributeListField.propTypes = {
  value: PropTypes.array,
};
AttributeListField.defaultProps = {
  value: [],
};
