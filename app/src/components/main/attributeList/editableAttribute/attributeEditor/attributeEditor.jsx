import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import Parser from 'html-react-parser';
import { activeProjectSelector } from 'controllers/user';
import { validate } from 'common/utils';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import CircleCrossIcon from 'common/img/circle-cross-icon-inline.svg';
import CircleCheckIcon from 'common/img/circle-check-inline.svg';
import { AttributeInput } from './attributeInput';
import styles from './attributeEditor.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  keyLabel: {
    id: 'AttributeEditor.keyLabel',
    defaultMessage: 'Key',
  },
  valueLabel: {
    id: 'AttributeEditor.valueLabel',
    defaultMessage: 'Value',
  },
});

@connect((state) => ({
  projectId: activeProjectSelector(state),
}))
@injectIntl
export class AttributeEditor extends Component {
  static propTypes = {
    projectId: PropTypes.string,
    attributes: PropTypes.array,
    onConfirm: PropTypes.func,
    onCancel: PropTypes.func,
    handleSubmit: PropTypes.func,
    invalid: PropTypes.bool,
    keyURLCreator: PropTypes.func,
    valueURLCreator: PropTypes.func,
    intl: intlShape.isRequired,
    attribute: PropTypes.object,
  };

  static defaultProps = {
    projectId: null,
    attributes: [],
    handleSubmit: () => {},
    onConfirm: () => {},
    onCancel: () => {},
    keyURLCreator: null,
    valueURLCreator: null,
    invalid: false,
    attribute: {},
  };

  constructor(props) {
    super(props);

    this.state = {
      key: props.attribute.key,
      value: props.attribute.value,
      errors: this.getValidationErrors(props.attribute.key, props.attribute.value),
    };
  }

  getValidationErrors = (key, value) => {
    let valueError;
    if (!value) {
      valueError = 'requiredFieldHint';
    } else if (!validate.attributeKey(value)) {
      valueError = 'attributeValueLengthHint';
    }
    return {
      key: key && !validate.attributeKey(key) ? 'attributeKeyLengthHint' : undefined,
      value: valueError,
    };
  };

  byKeyComparator = (attribute, item, key, value) =>
    attribute.key === item && attribute.value === value;

  byValueComparator = (attribute, item, key) => attribute.key === key && attribute.value === item;

  formatValue = (value) => (value ? { value, label: value } : null);
  parseValue = (value) => (value ? value.value : undefined);

  handleKeyChange = (key) => {
    this.setState((oldState) => ({
      key: this.parseValue(key),
      errors: this.getValidationErrors(this.parseValue(key), oldState.value),
    }));
  };

  handleValueChange = (value) => {
    this.setState((oldState) => ({
      value: this.parseValue(value),
      errors: this.getValidationErrors(oldState.key, this.parseValue(value)),
    }));
  };

  isAttributeUnique = () =>
    !this.props.attributes.some(
      (attribute) => attribute.key === this.state.key && attribute.value === this.state.value,
    );

  isFormValid = () =>
    !this.state.errors.key && !this.state.errors.value && this.isAttributeUnique();

  handleSubmit = () => {
    if (!this.isFormValid()) {
      return;
    }
    const { key, value } = this.state;
    this.props.onConfirm({
      key,
      value,
    });
  };

  render() {
    const { projectId, attributes, onCancel, keyURLCreator, valueURLCreator, intl } = this.props;
    return (
      <div className={cx('attribute-editor')}>
        <div className={cx('control')}>
          <FieldErrorHint error={this.state.errors.key} staticHint>
            <AttributeInput
              customClass={cx('input')}
              attributes={attributes}
              async={!!keyURLCreator}
              minLength={1}
              attributeComparator={this.byKeyComparator}
              uri={keyURLCreator ? keyURLCreator(projectId) : null}
              creatable
              isClearable
              showNewLabel
              placeholder={intl.formatMessage(messages.keyLabel)}
              onChange={this.handleKeyChange}
              value={this.formatValue(this.state.key)}
              attributeKey={this.state.key}
              attributeValue={this.state.value}
            />
          </FieldErrorHint>
        </div>
        <div className={cx('control')}>
          <FieldErrorHint error={this.state.errors.value} staticHint>
            <AttributeInput
              customClass={cx('input')}
              async={!!valueURLCreator}
              minLength={1}
              attributes={attributes}
              attributeComparator={this.byValueComparator}
              uri={valueURLCreator ? valueURLCreator(projectId, this.state.key) : null}
              creatable
              showNewLabel
              onChange={this.handleValueChange}
              value={this.formatValue(this.state.value)}
              placeholder={intl.formatMessage(messages.valueLabel)}
              attributeKey={this.state.key}
              attributeValue={this.state.value}
            />
          </FieldErrorHint>
        </div>
        <div className={cx('control')}>
          <div
            className={cx('icon', 'check-icon', { disabled: !this.isFormValid() })}
            onClick={this.isFormValid() ? this.handleSubmit : null}
          >
            {Parser(CircleCheckIcon)}
          </div>
        </div>
        <div className={cx('control')}>
          <div className={cx('icon')} onClick={onCancel}>
            {Parser(CircleCrossIcon)}
          </div>
        </div>
      </div>
    );
  }
}
