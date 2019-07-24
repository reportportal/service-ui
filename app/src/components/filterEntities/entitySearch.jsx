import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import { FieldFilterEntity } from 'components/fields/fieldFilterEntity';
import { InputTagsSearch } from 'components/inputs/inputTagsSearch';

@injectIntl
export class EntitySearch extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    value: PropTypes.object.isRequired,
    title: PropTypes.string,
    smallSize: PropTypes.bool,
    removable: PropTypes.bool,
    onRemove: PropTypes.func,
    onChange: PropTypes.func,
    vertical: PropTypes.bool,
    customProps: PropTypes.object,
  };
  static defaultProps = {
    title: '',
    smallSize: false,
    removable: true,
    onRemove: () => {},
    onChange: () => {},
    vertical: false,
    customProps: {},
  };

  onChange = (value) => {
    this.props.onChange({
      condition: this.props.value.condition,
      value: value.map((val) => val.value).join(','),
    });
  };
  formatValue = (values) => values.map((value) => ({ value, label: value }));
  render() {
    const { value, onRemove, removable, title, smallSize, vertical, customProps } = this.props;
    const formattedValue = this.formatValue(value.value.split(','));
    return (
      <FieldFilterEntity
        stretchable
        title={title}
        smallSize={smallSize}
        removable={removable}
        onRemove={onRemove}
        vertical={vertical}
      >
        <InputTagsSearch
          value={formattedValue.length && formattedValue[0].value ? formattedValue : []}
          minLength={3}
          async
          makeOptions={this.formatValue}
          creatable
          showNewLabel
          multi
          removeSelected
          onChange={this.onChange}
          {...customProps}
        />
      </FieldFilterEntity>
    );
  }
}
