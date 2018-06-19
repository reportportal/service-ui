import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { FieldFilterEntity } from 'components/fields/fieldFilterEntity';

export class EntityDropdown extends Component {
  static propTypes = {
    value: PropTypes.object,
    meta: PropTypes.object,
    entityId: PropTypes.string,
    title: PropTypes.string,
    removable: PropTypes.bool,
    onRemove: PropTypes.func,
    onChange: PropTypes.func,
  };
  static defaultProps = {
    entityId: '',
    title: '',
    value: {},
    meta: {},
    removable: true,
    onRemove: () => {},
    onChange: () => {},
  };

  handleChange = (value) => {
    this.props.onChange({
      condition: this.props.value.condition,
      value: this.props.meta.multiple ? value.join(',') : value,
    });
  };

  render() {
    const { value, onRemove, removable, entityId, title, meta } = this.props;
    return (
      <FieldFilterEntity title={title || entityId} removable={removable} onRemove={onRemove}>
        <InputDropdown
          options={meta.options}
          value={meta.multiple ? value.value.split(',') : value.value}
          onChange={this.handleChange}
          multiple={meta.multiple}
          selectAll={meta.selectAll}
        />
      </FieldFilterEntity>
    );
  }
}
