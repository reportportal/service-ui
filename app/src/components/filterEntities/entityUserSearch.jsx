import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import { FieldFilterEntity } from 'components/fields/fieldFilterEntity';
import { InputTagsSearch } from 'components/inputs/inputTagsSearch';

const messages = defineMessages({
  placeholder: {
    id: 'EntityUserSearch.placeholder',
    defaultMessage: 'Enter username',
  },
  focusPlaceholder: {
    id: 'EntityUserSearch.focusPlaceholder',
    defaultMessage: 'At least 3 symbols required.',
  },
});

@injectIntl
export class EntityUserSearch extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    value: PropTypes.object.isRequired,
    title: PropTypes.string,
    smallSize: PropTypes.bool,
    usersSearchUrl: PropTypes.string.isRequired,
    removable: PropTypes.bool,
    onRemove: PropTypes.func,
    onChange: PropTypes.func,
    vertical: PropTypes.bool,
  };
  static defaultProps = {
    title: '',
    smallSize: false,
    removable: true,
    onRemove: () => {},
    onChange: () => {},
    vertical: false,
  };

  onChange = (value) => {
    this.props.onChange({
      condition: this.props.value.condition,
      value: value.map((val) => val.value).join(','),
    });
  };
  formatValue = (values) => values.map((value) => ({ value, label: value }));

  render() {
    const {
      intl,
      value,
      onRemove,
      removable,
      title,
      smallSize,
      usersSearchUrl,
      vertical,
    } = this.props;
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
          placeholder={intl.formatMessage(messages.placeholder)}
          focusPlaceholder={intl.formatMessage(messages.focusPlaceholder)}
          minLength={3}
          async
          uri={usersSearchUrl}
          makeOptions={this.formatValue}
          creatable
          showNewLabel
          multi
          removeSelected
          onChange={this.onChange}
          inputProps={{ maxLength: 128 }}
        />
      </FieldFilterEntity>
    );
  }
}
