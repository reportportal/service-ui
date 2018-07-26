import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm, initialize } from 'redux-form';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import { ModalField } from 'components/main/modal';
import { Input } from 'components/inputs/input';
import { InputTextArea } from 'components/inputs/inputTextArea';
import { InputBigSwitcher } from 'components/inputs/inputBigSwitcher';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { validate } from 'common/utils';
import { WIDGET_WIZARD_FORM } from '../constants';

const LABEL_WIDTH = 175;

const messages = defineMessages({
  nameLabel: {
    id: 'WizardThirdStepForm.nameLabel',
    defaultMessage: 'Widget name',
  },
  namePlaceholder: {
    id: 'WizardThirdStepForm.namePlaceholder',
    defaultMessage: 'Enter widget name',
  },
  descriptionLabel: {
    id: 'WizardThirdStepForm.descriptionLabel',
    defaultMessage: 'Description',
  },
  descriptionPlaceholder: {
    id: 'WizardThirdStepForm.descriptionPlaceholder',
    defaultMessage: 'Add some description to widget',
  },
  shareLabel: {
    id: 'WizardThirdStepForm.shareLabel',
    defaultMessage: 'Share',
  },
});

@injectIntl
@reduxForm({
  form: WIDGET_WIZARD_FORM,
  destroyOnUnmount: false,
  forceUnregisterOnUnmount: true,
  validate: ({ name }) => ({
    name: !validate.widgetName(name) && 'widgetNameHint',
  }),
})
@connect(
  null,
  {
    initializeWizardThirdStepForm: (data) => initialize(WIDGET_WIZARD_FORM, data, true),
  },
)
export class WizardThirdStepForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    initializeWizardThirdStepForm: PropTypes.func.isRequired,
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
    props.initializeWizardThirdStepForm({
      name: `${props.widgetTitle}_${this.getUniqPostfix()}`,
      description: '',
      share: false,
    });
  }

  getUniqPostfix = () =>
    new Date()
      .valueOf()
      .toString()
      .slice(-3);

  render() {
    const { intl, handleSubmit, onSubmit } = this.props;
    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalField label={intl.formatMessage(messages.nameLabel)} labelWidth={LABEL_WIDTH}>
          <FieldProvider name={'name'} placeholder={intl.formatMessage(messages.namePlaceholder)}>
            <FieldErrorHint>
              <Input maxLength="128" />
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
