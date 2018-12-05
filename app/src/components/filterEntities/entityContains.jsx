import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import { FieldFilterEntity } from 'components/fields/fieldFilterEntity';
import { Input } from 'components/inputs/input';

@injectIntl
export class EntityContains extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    value: PropTypes.object.isRequired,
    title: PropTypes.string,
    smallSize: PropTypes.bool,
    removable: PropTypes.bool,
    onRemove: PropTypes.func,
    onChange: PropTypes.func,
    onBlur: PropTypes.func,
    vertical: PropTypes.bool,
  };
  static defaultProps = {
    title: '',
    smallSize: false,
    removable: true,
    onRemove: () => {},
    onChange: () => {},
    onBlur: () => {},
    vertical: false,
  };
  onChangeInput = (e) => {
    this.props.onChange({ value: e.target.value });
  };
  onBlurInput = (e) => {
    this.props.onBlur({ value: e.target.value });
  };

  render() {
    const { intl, onRemove, removable, title, smallSize, vertical, value, ...rest } = this.props;

    return (
      <FieldFilterEntity
        stretchable
        title={title}
        smallSize={smallSize}
        removable={removable}
        onRemove={onRemove}
        vertical={vertical}
      >
        <Input
          value={value.value}
          maxLength={'128'}
          readOnly
          {...rest}
          onChange={this.onChangeInput}
          onBlur={this.onBlurInput}
        />
      </FieldFilterEntity>
    );
  }
}
