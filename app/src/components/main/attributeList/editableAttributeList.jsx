import { Component } from 'react';
import PropTypes from 'prop-types';
import { AttributeList } from './attributeList';

const NEW_ATTRIBUTE = {
  system: false,
  edited: true,
};

export class EditableAttributeList extends Component {
  static propTypes = {
    attributes: PropTypes.arrayOf(PropTypes.object),
    onChange: PropTypes.func,
    disabled: PropTypes.bool,
    keyURLCreator: PropTypes.func,
    valueURLCreator: PropTypes.func,
  };

  static defaultProps = {
    attributes: [],
    onChange: () => {},
    disabled: false,
    keyURLCreator: null,
    valueURLCreator: null,
  };

  handleAddNew = () => {
    const { attributes, onChange } = this.props;
    onChange([...attributes, NEW_ATTRIBUTE]);
  };

  handleChange = (attributes) => {
    this.props.onChange(attributes);
  };

  render() {
    return (
      <AttributeList
        attributes={this.props.attributes}
        onChange={this.handleChange}
        onRemove={this.handleChange}
        onAddNew={this.handleAddNew}
        disabled={this.props.disabled}
        keyURLCreator={this.props.keyURLCreator}
        valueURLCreator={this.props.valueURLCreator}
      />
    );
  }
}
