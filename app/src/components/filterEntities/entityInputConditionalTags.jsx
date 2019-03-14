import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { InputConditionalTags } from 'components/inputs/inputConditionalTags';
import { FieldFilterEntity } from 'components/fields/fieldFilterEntity';

export class EntityInputConditionalTags extends PureComponent {
  static propTypes = {
    value: PropTypes.object.isRequired,
    title: PropTypes.string,
    smallSize: PropTypes.bool,
    removable: PropTypes.bool,
    onRemove: PropTypes.func,
    onChange: PropTypes.func,
    customProps: PropTypes.object,
  };
  static defaultProps = {
    title: '',
    smallSize: false,
    removable: true,
    placeholder: '',
    onChange: () => {},
    onRemove: () => {},
    customProps: {},
  };

  render() {
    const { value, onRemove, onChange, removable, title, smallSize, customProps } = this.props;

    return (
      <FieldFilterEntity
        title={title}
        removable={removable}
        smallSize={smallSize}
        onRemove={onRemove}
        stretchable
      >
        <InputConditionalTags
          value={value}
          onChange={onChange}
          inputProps={{ maxLength: 128 }}
          {...customProps}
        />
      </FieldFilterEntity>
    );
  }
}
