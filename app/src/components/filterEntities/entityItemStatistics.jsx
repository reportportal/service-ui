import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl';
import { InputConditional } from 'components/inputs/inputConditional';
import { FieldFilterEntity } from 'components/fields/fieldFilterEntity';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { CONDITION_EQ, CONDITION_GREATER_EQ, CONDITION_LESS_EQ } from './constants';

const conditions = [
  {
    value: CONDITION_GREATER_EQ,
    label: <FormattedMessage id={'Conditions.gte'} defaultMessage={'Greater than or equal'} />,
    shortLabel: (
      <FormattedMessage id={'Conditions.gteShort'} defaultMessage={String.fromCharCode(8805)} />
    ),
  },
  {
    value: CONDITION_LESS_EQ,
    label: <FormattedMessage id={'Conditions.lte'} defaultMessage={'Less than or equal'} />,
    shortLabel: (
      <FormattedMessage id={'Conditions.lteShort'} defaultMessage={String.fromCharCode(8804)} />
    ),
  },
  {
    value: CONDITION_EQ,
    label: <FormattedMessage id={'Conditions.eq'} defaultMessage={'Equals'} />,
    shortLabel: <FormattedMessage id={'Conditions.eqShort'} defaultMessage={'eq'} />,
  },
];
const messages = defineMessages({
  placeholder: {
    id: 'EntityItemStatistics.placeholder',
    defaultMessage: 'Enter quantity',
  },
});

@injectIntl
export class EntityItemStatistics extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    value: PropTypes.object.isRequired,
    entityId: PropTypes.string,
    title: PropTypes.string,
    deletable: PropTypes.bool,
    onRemove: PropTypes.func,
  };
  static defaultProps = {
    entityId: '',
    title: '',
    deletable: true,
    onRemove: () => {},
  };

  render() {
    const { intl, value, onRemove, deletable, entityId, title, ...rest } = this.props;
    return (
      <FieldErrorHint {...rest}>
        <FieldFilterEntity title={title || entityId} deletable={deletable} onRemove={onRemove}>
          <InputConditional
            conditions={conditions}
            value={value}
            maxLength={18}
            placeholder={intl.formatMessage(messages.placeholder)}
            {...rest}
          />
        </FieldFilterEntity>
      </FieldErrorHint>
    );
  }
}
