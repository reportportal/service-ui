import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { ModalLayout, ModalField, withModal } from 'components/main/modal';
import { Input } from 'components/inputs/input';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { FieldProvider } from 'components/fields/fieldProvider';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { commonValidators } from 'common/utils';
import { patternsSelector } from 'controllers/project';

const LABEL_WIDTH = 110;

const messages = defineMessages({
  patternName: {
    id: 'PatternAnalysis.patternName',
    defaultMessage: 'Pattern Name',
  },
  renamePatternMessage: {
    id: 'PatternAnalysis.renamePatternMessage',
    defaultMessage: 'Rename pattern rule',
  },
});

@withModal('renamePatternModal')
@connect((state, ownProps) => ({
  validate: ({ name }) => ({
    name: commonValidators.createPatternNameValidator(
      ownProps.data.pattern && ownProps.data.pattern.id,
      patternsSelector(state),
    )(name),
  }),
}))
@reduxForm({
  form: 'renamePatternForm',
})
@injectIntl
export class RenamePatternModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    data: PropTypes.shape({
      pattern: PropTypes.object,
      onSave: PropTypes.func,
    }),
    handleSubmit: PropTypes.func.isRequired,
    initialize: PropTypes.func.isRequired,
  };

  static defaultProps = {
    data: {},
  };

  componentDidMount() {
    this.props.initialize(this.props.data.pattern);
  }

  saveAndClose = (closeModal) => (pattern) => {
    this.props.data.onSave(pattern);
    closeModal();
  };

  render() {
    const {
      intl: { formatMessage },
      handleSubmit,
    } = this.props;

    return (
      <ModalLayout
        title={formatMessage(messages.renamePatternMessage)}
        okButton={{
          text: formatMessage(COMMON_LOCALE_KEYS.SAVE),
          onClick: (closeModal) => handleSubmit(this.saveAndClose(closeModal))(),
        }}
        cancelButton={{
          text: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
        }}
      >
        <ModalField label={formatMessage(messages.patternName)} labelWidth={LABEL_WIDTH}>
          <FieldProvider name="name" type="text">
            <FieldErrorHint>
              <Input maxLength={'55'} />
            </FieldErrorHint>
          </FieldProvider>
        </ModalField>
      </ModalLayout>
    );
  }
}
