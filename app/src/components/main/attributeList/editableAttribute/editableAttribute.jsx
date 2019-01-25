import { Component } from 'react';
import PropTypes from 'prop-types';
import { Attribute } from './attribute';
import { AttributeEditor } from './attributeEditor';

export class EditableAttribute extends Component {
  static propTypes = {
    attribute: PropTypes.object,
    editMode: PropTypes.bool,
    onEdit: PropTypes.func,
    onRemove: PropTypes.func,
    onChange: PropTypes.func,
  };

  static defaultProps = {
    attribute: {},
    editMode: false,
    onEdit: () => {},
    onRemove: () => {},
    onChange: () => {},
  };

  enterEditMode = () => this.props.onEdit(this.props.attribute);

  exitEditMode = () => this.props.onEdit(null);

  calculateFormName = (attribute) =>
    attribute && attribute.key && attribute.value
      ? `attributesEditor__${attribute.key}_${attribute.value}`.replace(/\W/g, '_')
      : 'attributesEditor';

  render() {
    const { attribute, onChange, editMode, ...rest } = this.props;
    return editMode ? (
      <AttributeEditor
        {...rest}
        form={this.calculateFormName(attribute)}
        initialValues={attribute}
        onConfirm={onChange}
        onCancel={this.exitEditMode}
      />
    ) : (
      <Attribute {...this.props} onClick={this.enterEditMode} />
    );
  }
}
