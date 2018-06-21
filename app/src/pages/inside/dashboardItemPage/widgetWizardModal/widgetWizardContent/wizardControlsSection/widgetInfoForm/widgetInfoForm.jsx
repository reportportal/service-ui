import React, { Component } from 'react';
import { reduxForm } from 'redux-form';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import { ModalField } from 'components/main/modal';
import { Input } from 'components/inputs/input';
import { InputTextArea } from 'components/inputs/inputTextArea';
import { InputBigSwitcher } from 'components/inputs/inputBigSwitcher';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { validate } from 'common/utils';
import { WIDGET_INFO_FORM } from '../constants';

const LABEL_WIDTH = 175;

const messages = defineMessages({
  nameLabel: {
    id: 'WidgetInfoForm.nameLabel',
    defaultMessage: 'Widget name',
  },
  namePlaceholder: {
    id: 'WidgetInfoForm.namePlaceholder',
    defaultMessage: 'Enter widget name',
  },
  descriptionLabel: {
    id: 'WidgetInfoForm.descriptionLabel',
    defaultMessage: 'Description',
  },
  descriptionPlaceholder: {
    id: 'WidgetInfoForm.descriptionPlaceholder',
    defaultMessage: 'Add some description to widget',
  },
  shareLabel: {
    id: 'WidgetInfoForm.shareLabel',
    defaultMessage: 'Share',
  },
});

@injectIntl
@reduxForm({
  form: WIDGET_INFO_FORM,
  validate: ({ name }) => ({
    name: !validate.widgetName(name) && 'widgetNameHint',
  }),
})
export class WidgetInfoForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    initialize: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    onSubmit: PropTypes.func,
    widgetTitle: PropTypes.string,
  };
  static defaultProps = {
    widgetTitle: '',
    onSubmit: () => {},
  };

  constructor(props) {
    super(props);
    props.initialize({
      name: `${props.widgetTitle}_${new Date()
        .valueOf()
        .toString()
        .slice(-2)}`,
      description: '',
      share: false,
    });
  }

  render() {
    const { intl, handleSubmit, onSubmit } = this.props;
    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalField label={intl.formatMessage(messages.nameLabel)} labelWidth={LABEL_WIDTH}>
          <FieldProvider name={'name'} placeholder={intl.formatMessage(messages.namePlaceholder)}>
            <FieldErrorHint>
              <Input maxLength={'128'} />
            </FieldErrorHint>
          </FieldProvider>
        </ModalField>
        <ModalField label={intl.formatMessage(messages.descriptionLabel)} labelWidth={LABEL_WIDTH}>
          <FieldProvider
            name={'description'}
            placeholder={intl.formatMessage(messages.descriptionPlaceholder)}
          >
            <InputTextArea />
          </FieldProvider>
        </ModalField>
        <ModalField label={intl.formatMessage(messages.shareLabel)} labelWidth={LABEL_WIDTH}>
          <FieldProvider name={'share'} format={Boolean} parse={Boolean}>
            <InputBigSwitcher />
          </FieldProvider>
        </ModalField>
      </form>
    );
  }
}
