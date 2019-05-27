import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { reduxForm, formValueSelector } from 'redux-form';
import className from 'classnames/bind';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { ModalLayout, ModalField, withModal } from 'components/main/modal';
import { Input } from 'components/inputs/input';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { InputTextArea } from 'components/inputs/inputTextArea';
import { InputSwitcher } from 'components/inputs/inputSwitcher';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { FieldProvider } from 'components/fields/fieldProvider';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { validate } from 'common/utils';
import { PATTERN_TYPES, REGEX_PATTERN, STRING_PATTERN } from 'common/constants/patternTypes';
import { patternsSelector } from 'controllers/project';
import { RegExEditor } from 'components/inputs/regExEditor';
import styles from './createPatternModal.scss';

const cx = className.bind(styles);
const LABEL_WIDTH = 110;

const messages = defineMessages({
  patternName: {
    id: 'PatternAnalysis.patternName',
    defaultMessage: 'Pattern Name',
  },
  patternType: {
    id: 'PatternAnalysis.patternType',
    defaultMessage: 'Type',
  },
  patternCondition: {
    id: 'PatternAnalysis.patternCondition',
    defaultMessage: 'Pattern Condition',
  },
  active: {
    id: 'PatternAnalysis.active',
    defaultMessage: 'Active',
  },
  inactive: {
    id: 'PatternAnalysis.inactive',
    defaultMessage: 'Inactive',
  },
});

const createPatternFormSelector = formValueSelector('createPatternForm');

@withModal('createPatternModal')
@connect((state, ownProps) => ({
  selectedType: createPatternFormSelector(state, 'type'),
  validate: ({ name, value }) => ({
    name:
      ((!name || !validate.patternNameLength(name, patternsSelector(state))) &&
        'patternNameLengthHint') ||
      (name &&
        !validate.patternNameUnique(
          name,
          ownProps.data.pattern && ownProps.data.pattern.id,
          patternsSelector(state),
        ) &&
        'patternNameDuplicateHint'),
    value: !value && 'requiredFieldHint',
  }),
}))
@reduxForm({
  form: 'createPatternForm',
})
@injectIntl
export class CreatePatternModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    data: PropTypes.shape({
      pattern: PropTypes.object,
      isNewPattern: PropTypes.bool,
      onSave: PropTypes.func,
      modalTitle: PropTypes.string,
    }),
    handleSubmit: PropTypes.func.isRequired,
    initialize: PropTypes.func.isRequired,
    selectedType: PropTypes.string,
  };

  static defaultProps = {
    data: {},
    selectedType: STRING_PATTERN,
  };

  componentDidMount() {
    this.props.initialize(this.props.data.pattern);
  }

  saveAndClose = (closeModal) => (pattern) => {
    this.props.data.onSave(pattern);
    closeModal();
  };

  renderHeaderElements = () => (
    <div className={cx('header-active-switcher-container')}>
      <div className={cx('header-active-switcher')}>
        <FieldProvider name="enabled" format={(value) => !!value}>
          <InputSwitcher />
        </FieldProvider>
      </div>
      <div className={cx('header-active-switcher-label')}>
        {this.props.intl.formatMessage(messages.active)}
      </div>
    </div>
  );

  render() {
    const {
      intl: { formatMessage },
      data: { isNewPattern, modalTitle },
      handleSubmit,
      selectedType,
    } = this.props;

    return (
      <ModalLayout
        title={modalTitle}
        okButton={{
          text: formatMessage(COMMON_LOCALE_KEYS.SAVE),
          onClick: (closeModal) => handleSubmit(this.saveAndClose(closeModal))(),
        }}
        cancelButton={{
          text: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
        }}
        renderHeaderElements={this.renderHeaderElements}
      >
        <ModalField label={formatMessage(messages.patternName)} labelWidth={LABEL_WIDTH}>
          <FieldProvider name="name" type="text">
            <FieldErrorHint>
              <Input maxLength={'55'} />
            </FieldErrorHint>
          </FieldProvider>
        </ModalField>
        <ModalField label={formatMessage(messages.patternType)} labelWidth={LABEL_WIDTH}>
          <FieldProvider name="type" type="text">
            <FieldErrorHint>
              <InputDropdown options={PATTERN_TYPES} disabled={!isNewPattern} />
            </FieldErrorHint>
          </FieldProvider>
        </ModalField>
        <ModalField label={formatMessage(messages.patternCondition)} labelWidth={LABEL_WIDTH}>
          <FieldProvider name="value" type="text">
            <FieldErrorHint>
              {selectedType === REGEX_PATTERN ? (
                <RegExEditor readonly={!isNewPattern} />
              ) : (
                <InputTextArea readonly={!isNewPattern} />
              )}
            </FieldErrorHint>
          </FieldProvider>
        </ModalField>
      </ModalLayout>
    );
  }
}
