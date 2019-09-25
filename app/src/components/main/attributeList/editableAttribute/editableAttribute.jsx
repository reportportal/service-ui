import PropTypes from 'prop-types';
import { Attribute } from './attribute';
import { AttributeEditor } from './attributeEditor';

export const EditableAttribute = ({
  attribute,
  onChange,
  onEdit,
  onCancelEdit,
  editMode,
  ...rest
}) =>
  editMode ? (
    <AttributeEditor {...rest} attribute={attribute} onConfirm={onChange} onCancel={onCancelEdit} />
  ) : (
    <Attribute {...rest} attribute={attribute} onClick={onEdit} />
  );

EditableAttribute.propTypes = {
  attribute: PropTypes.object,
  attributes: PropTypes.array,
  editMode: PropTypes.bool,
  disabled: PropTypes.bool,
  onEdit: PropTypes.func,
  onRemove: PropTypes.func,
  onChange: PropTypes.func,
  onCancelEdit: PropTypes.func,
  keyURLCreator: PropTypes.func,
  valueURLCreator: PropTypes.func,
};
EditableAttribute.defaultProps = {
  attribute: {},
  attributes: [],
  editMode: false,
  disabled: false,
  onEdit: () => {},
  onRemove: () => {},
  onChange: () => {},
  onCancelEdit: () => {},
  keyURLCreator: null,
  valueURLCreator: null,
};
