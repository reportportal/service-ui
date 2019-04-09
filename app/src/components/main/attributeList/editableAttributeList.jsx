import { Component } from 'react';
import PropTypes from 'prop-types';
import { AttributeList } from './attributeList';

const NEW_ATTRIBUTE = { system: false };

export class EditableAttributeList extends Component {
  static propTypes = {
    attributes: PropTypes.arrayOf(PropTypes.object),
    onChange: PropTypes.func,
    disabled: PropTypes.bool,
    keyURLCreator: PropTypes.func.isRequired,
    valueURLCreator: PropTypes.func.isRequired,
  };

  static defaultProps = {
    attributes: [],
    onChange: () => {},
    disabled: false,
  };

  state = {
    activeAttribute: null,
    isNew: false,
  };

  getAttributes = () => {
    const { isNew, activeAttribute } = this.state;
    const { attributes } = this.props;
    return isNew ? [...attributes, activeAttribute] : attributes;
  };

  changeActiveAttribute = (attribute, isNew = false) =>
    this.setState({ activeAttribute: attribute, isNew });

  handleAddNew = () => this.changeActiveAttribute(NEW_ATTRIBUTE, true);

  handleChange = (newAttribute) => {
    this.changeActiveAttribute(null);
    this.props.onChange(newAttribute);
  };

  render() {
    return (
      <AttributeList
        attributes={this.getAttributes()}
        editedAttribute={this.state.activeAttribute}
        onChange={this.handleChange}
        onEdit={this.changeActiveAttribute}
        onAddNew={this.handleAddNew}
        disabled={this.props.disabled}
        keyURLCreator={this.props.keyURLCreator}
        valueURLCreator={this.props.valueURLCreator}
      />
    );
  }
}
