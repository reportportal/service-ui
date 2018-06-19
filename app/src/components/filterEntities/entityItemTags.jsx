import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl';
import { InputConditionalTags } from 'components/inputs/inputConditionalTags';
import { FieldFilterEntity } from 'components/fields/fieldFilterEntity';
import { CONDITION_HAS, CONDITION_NOT_HAS, CONDITION_IN, CONDITION_NOT_IN } from './constants';

const conditions = [
  {
    value: CONDITION_HAS,
    label: <FormattedMessage id={'Conditions.all'} defaultMessage={'All'} />,
    shortLabel: <FormattedMessage id={'Conditions.allShort'} defaultMessage={'All'} />,
  },
  {
    value: CONDITION_NOT_IN,
    label: <FormattedMessage id={'Conditions.withoutAll'} defaultMessage={'Without all'} />,
    shortLabel: <FormattedMessage id={'Conditions.withoutAllShort'} defaultMessage={'!all'} />,
  },
  {
    value: CONDITION_IN,
    label: <FormattedMessage id={'Conditions.any'} defaultMessage={'Any'} />,
    shortLabel: <FormattedMessage id={'Conditions.anyShort'} defaultMessage={'Any'} />,
  },
  {
    value: CONDITION_NOT_HAS,
    label: <FormattedMessage id={'Conditions.withoutAny'} defaultMessage={'Without any'} />,
    shortLabel: <FormattedMessage id={'Conditions.withoutAnyShort'} defaultMessage={'!any'} />,
  },
];
const messages = defineMessages({
  placeholder: {
    id: 'EntityItemTags.placeholder',
    defaultMessage: 'Enter tags',
  },
});

@injectIntl
export class EntityItemTags extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    value: PropTypes.object.isRequired,
    title: PropTypes.string,
    removable: PropTypes.bool,
    onRemove: PropTypes.func,
  };
  static defaultProps = {
    title: '',
    removable: true,
    onRemove: () => {},
  };

  render() {
    const { intl, onRemove, removable, title, ...rest } = this.props;

    return (
      <FieldFilterEntity title={title} removable={removable} onRemove={onRemove} stretchable>
        <InputConditionalTags
          {...rest}
          conditions={conditions}
          placeholder={intl.formatMessage(messages.placeholder)}
        />
      </FieldFilterEntity>
    );
  }
}
