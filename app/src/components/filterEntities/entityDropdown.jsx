import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { FieldFilterEntity } from 'components/fields/fieldFilterEntity';

export class EntityDropdown extends Component {
  static propTypes = {
    value: PropTypes.object,
    entityId: PropTypes.string,
    title: PropTypes.string,
    smallSize: PropTypes.bool,
    removable: PropTypes.bool,
    onRemove: PropTypes.func,
    onChange: PropTypes.func,
    vertical: PropTypes.bool,
    customProps: PropTypes.object,
  };
  static defaultProps = {
    entityId: '',
    title: '',
    smallSize: false,
    value: {},
    removable: true,
    onRemove: () => {},
    onChange: () => {},
    vertical: false,
    customProps: {},
  };

  getValue = () => {
    const {
      value,
      customProps: { multiple },
    } = this.props;
    if (!multiple) {
      return value.value;
    } else if (!value.value) {
      return [];
    }
    return value.value.split(',');
  };

  handleChange = (value) => {
    const {
      customProps: { multiple },
    } = this.props;
    this.props.onChange({
      condition: this.props.value.condition,
      value: multiple ? value.join(',') : value,
    });
  };

  render() {
    const { onRemove, removable, entityId, smallSize, title, vertical, customProps } = this.props;
    return (
      <FieldFilterEntity
        title={title || entityId}
        smallSize={smallSize}
        removable={removable}
        onRemove={onRemove}
        vertical={vertical}
      >
        <InputDropdown value={this.getValue()} onChange={this.handleChange} {...customProps} />
      </FieldFilterEntity>
    );
  }
}
