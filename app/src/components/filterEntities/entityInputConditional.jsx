import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import { InputConditional } from 'components/inputs/inputConditional';
import { FieldFilterEntity } from 'components/fields/fieldFilterEntity';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';

const messages = defineMessages({
  placeholder: {
    id: 'entityInputConditional.defaultPlaceholder',
    defaultMessage: 'Enter name',
  },
});

@injectIntl
export class EntityInputConditional extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    value: PropTypes.object.isRequired,
    title: PropTypes.string,
    smallSize: PropTypes.bool,
    removable: PropTypes.bool,
    onChange: PropTypes.func,
    onRemove: PropTypes.func,
    placeholder: PropTypes.shape({
      id: PropTypes.string,
      defaultMessage: PropTypes.string,
    }),
    maxLength: PropTypes.number,
    customProps: PropTypes.object,
  };
  static defaultProps = {
    title: '',
    smallSize: false,
    removable: true,
    onChange: () => {},
    onRemove: () => {},
    placeholder: messages.placeholder,
    maxLength: 128,
    customProps: {},
  };

  render() {
    const {
      intl,
      value,
      onRemove,
      removable,
      title,
      smallSize,
      customProps,
      onChange,
      maxLength,
      placeholder,
      ...rest
    } = this.props;
    return (
      <FieldErrorHint {...rest}>
        <FieldFilterEntity
          title={title}
          smallSize={smallSize}
          removable={removable}
          onRemove={onRemove}
        >
          <InputConditional
            maxLength={maxLength}
            placeholder={intl.formatMessage(messages.placeholder)}
            onChange={onChange}
            value={value}
            {...customProps}
          />
        </FieldFilterEntity>
      </FieldErrorHint>
    );
  }
}
