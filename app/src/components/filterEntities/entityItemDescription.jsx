import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl';
import { InputConditional } from 'components/inputs/inputConditional';
import { FieldFilterEntity } from 'components/fields/fieldFilterEntity';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { CONDITION_CNT, CONDITION_NOT_CNT, CONDITION_EQ, CONDITION_NOT_EQ } from './constants';

const conditions = [
  {
    value: CONDITION_CNT,
    label: <FormattedMessage id={'Conditions.cnt'} defaultMessage={'Contains'} />,
    shortLabel: <FormattedMessage id={'Conditions.cntShort'} defaultMessage={'cnt'} />,
  },
  {
    value: CONDITION_NOT_CNT,
    label: <FormattedMessage id={'Conditions.notCnt'} defaultMessage={'Not contains'} />,
    shortLabel: <FormattedMessage id={'Conditions.notCntShort'} defaultMessage={'!cnt'} />,
  },
  {
    value: CONDITION_EQ,
    label: <FormattedMessage id={'Conditions.eq'} defaultMessage={'Equals'} />,
    shortLabel: <FormattedMessage id={'Conditions.eqShort'} defaultMessage={'eq'} />,
  },
  {
    value: CONDITION_NOT_EQ,
    label: <FormattedMessage id={'Conditions.notEq'} defaultMessage={'Not equals'} />,
    shortLabel: <FormattedMessage id={'Conditions.notEqShort'} defaultMessage={'!eq'} />,
  },
];
const messages = defineMessages({
  placeholder: {
    id: 'EntityItemDescription.placeholder',
    defaultMessage: 'Enter description',
  },
});

@injectIntl
export class EntityItemDescription extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    value: PropTypes.object.isRequired,
    title: PropTypes.string,
    meta: PropTypes.object,
    deletable: PropTypes.bool,
    onRemove: PropTypes.func,
  };
  static defaultProps = {
    title: '',
    meta: {},
    deletable: true,
    onRemove: () => {},
  };

  render() {
    const { intl, value, onRemove, deletable, title, meta, ...rest } = this.props;

    return (
      <FieldErrorHint {...rest}>
        <FieldFilterEntity title={title} deletable={deletable} onRemove={onRemove}>
          <InputConditional
            conditions={conditions}
            value={value}
            placeholder={
              meta.placeholder ? meta.placeholder : intl.formatMessage(messages.placeholder)
            }
            maxLength={18}
            {...rest}
          />
        </FieldFilterEntity>
      </FieldErrorHint>
    );
  }
}
