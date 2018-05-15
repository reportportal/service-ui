import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { URLS } from 'common/urls';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import { FieldFilterEntity } from 'components/fields/fieldFilterEntity';
import { InputTagsSearch } from 'components/inputs/inputTagsSearch';
import { activeProjectSelector } from 'controllers/user';

const messages = defineMessages({
  placeholder: {
    id: 'EntityLaunchOwner.placeholder',
    defaultMessage: 'Enter username',
  },
  focusPlaceholder: {
    id: 'EntityLaunchOwner.focusPlaceholder',
    defaultMessage: 'At least 3 symbols required.',
  },
});

@injectIntl
@connect((state) => ({
  ownersSearchUrl: URLS.launchOwnersSearch(activeProjectSelector(state)),
}))
export class EntityLaunchOwner extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    value: PropTypes.object.isRequired,
    title: PropTypes.string,
    ownersSearchUrl: PropTypes.string.isRequired,
    deletable: PropTypes.bool,
    onRemove: PropTypes.func,
    onChange: PropTypes.func,
  };
  static defaultProps = {
    title: '',
    deletable: true,
    onRemove: () => {},
    onChange: () => {},
  };

  onChange = (value) => {
    this.props.onChange({
      condition: this.props.value.condition,
      value: value.map((val) => val.value).join(','),
    });
  };
  formatValue = (values) => values.map((value) => ({ value, label: value }));

  render() {
    const { intl, value, onRemove, deletable, title, ownersSearchUrl } = this.props;
    const formattedValue = this.formatValue(value.value.split(','));
    return (
      <FieldFilterEntity stretchable title={title} deletable={deletable} onRemove={onRemove}>
        <InputTagsSearch
          value={formattedValue.length && formattedValue[0].value ? formattedValue : []}
          placeholder={intl.formatMessage(messages.placeholder)}
          focusPlaceholder={intl.formatMessage(messages.focusPlaceholder)}
          minLength={3}
          async
          uri={ownersSearchUrl}
          makeOptions={this.formatValue}
          creatable
          showNewLabel
          multi
          removeSelected
          onChange={this.onChange}
        />
      </FieldFilterEntity>
    );
  }
}
