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
    smallSize: PropTypes.bool,
    removable: PropTypes.bool,
    onRemove: PropTypes.func,
    onChange: PropTypes.func,
    vertical: PropTypes.bool,
  };
  static defaultProps = {
    entityId: '',
    title: '',
    smallSize: false,
    value: {},
    meta: {},
    removable: true,
    onRemove: () => {},
    onChange: () => {},
    vertical: false,
  };

  getValue = () => {
    const { value, meta } = this.props;
    if (!meta.multiple) {
      return value.value;
    } else if (!value.value) {
      return [];
    }
    return value.value.split(',');
  };

  handleChange = (value) => {
    this.props.onChange({
      condition: this.props.value.condition,
      value: this.props.meta.multiple ? value.join(',') : value,
    });
  };

  render() {
    const { onRemove, removable, entityId, smallSize, title, meta, vertical } = this.props;
    return (
      <FieldFilterEntity
        title={title || entityId}
        smallSize={smallSize}
        removable={removable}
        onRemove={onRemove}
        vertical={vertical}
      >
        <InputDropdown
          options={meta.options}
          value={this.getValue()}
          onChange={this.handleChange}
          multiple={meta.multiple}
          selectAll={meta.selectAll}
        />
      </FieldFilterEntity>
    );
  }
}
