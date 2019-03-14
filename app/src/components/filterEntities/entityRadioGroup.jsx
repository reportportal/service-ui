import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import { FieldFilterEntity } from 'components/fields/fieldFilterEntity';
import { InputRadioGroup } from 'components/inputs/inputRadioGroup';

@injectIntl
export class EntityRadioGroup extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    value: PropTypes.object.isRequired,
    removable: PropTypes.bool,
    onChange: PropTypes.func,
    onRemove: PropTypes.func,
    title: PropTypes.string,
    customProps: PropTypes.object,
    smallSize: PropTypes.bool,
    vertical: PropTypes.bool,
  };
  static defaultProps = {
    title: '',
    removable: true,
    onChange: () => {},
    onRemove: () => {},
    smallSize: false,
    vertical: false,
    customProps: {},
  };
  onChange = (value) => {
    const {
      value: { condition },
    } = this.props;
    this.props.onChange({ value, condition });
  };
  render() {
    const {
      value: { value },
      onRemove,
      removable,
      title,
      vertical,
      smallSize,
      customProps,
    } = this.props;
    return (
      <FieldFilterEntity
        title={title}
        removable={removable}
        onRemove={onRemove}
        vertical={vertical}
        smallSize={smallSize}
      >
        <InputRadioGroup value={value} onChange={this.onChange} {...customProps} />
      </FieldFilterEntity>
    );
  }
}
