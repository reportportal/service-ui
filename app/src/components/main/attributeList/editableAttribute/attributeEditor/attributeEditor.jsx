import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { reduxForm, formValues } from 'redux-form';
import Parser from 'html-react-parser';
import { FieldProvider } from 'components/fields/fieldProvider';
import { URLS } from 'common/urls';
import { activeProjectSelector } from 'controllers/user';
import { validate } from 'common/utils';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import CircleCrossIcon from 'common/img/circle-cross-icon-inline.svg';
import CircleCheckIcon from 'common/img/circle-check-inline.svg';
import { AttributeInput } from './attributeInput';
import styles from './attributeEditor.scss';

const cx = classNames.bind(styles);

const ValueField = formValues({ attributeKey: 'key' })(
  ({ attributeKey, parse, format, attributeComparator, projectId, ...rest }) => (
    <FieldProvider name="value" format={format} parse={parse}>
      <FieldErrorHint staticHint>
        <AttributeInput
          customClass={cx('input')}
          async
          minLength={1}
          attributeComparator={attributeComparator}
          uri={URLS.launchAttributeValuesSearch(projectId, attributeKey)}
          creatable
          showNewLabel
          {...rest}
        />
      </FieldErrorHint>
    </FieldProvider>
  ),
);

@connect((state) => ({
  projectId: activeProjectSelector(state),
}))
@reduxForm({
  validate: ({ key, value }) => {
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
  },
})
export class AttributeEditor extends Component {
  static propTypes = {
    projectId: PropTypes.string,
    attributes: PropTypes.array,
    onConfirm: PropTypes.func,
    onCancel: PropTypes.func,
    handleSubmit: PropTypes.func,
    invalid: PropTypes.bool,
  };

  static defaultProps = {
    projectId: null,
    attributes: [],
    handleSubmit: () => {},
    onConfirm: () => {},
    onCancel: () => {},
    invalid: false,
  };

  byKeyComparator = (attribute, item, key, value) =>
    attribute.key === item && attribute.value === value;

  byValueComparator = (attribute, item, key) => attribute.key === key && attribute.value === item;

  formatValue = (value) => (value ? { value, label: value } : null);
  parseValue = (value) => (value ? value.value : undefined);

  render() {
    const { projectId, attributes, onConfirm, onCancel, handleSubmit } = this.props;
    return (
      <div className={cx('attribute-editor')}>
        <div className={cx('control')}>
          <FieldProvider name="key" format={this.formatValue} parse={this.parseValue}>
            <FieldErrorHint staticHint>
              <AttributeInput
                customClass={cx('input')}
                attributes={attributes}
                async
                minLength={1}
                attributeComparator={this.byKeyComparator}
                uri={URLS.launchAttributeKeysSearch(projectId)}
                creatable
                isClearable
                showNewLabel
              />
            </FieldErrorHint>
          </FieldProvider>
        </div>
        <div className={cx('control')}>
          <ValueField
            parse={this.parseValue}
            format={this.formatValue}
            projectId={projectId}
            attributeComparator={this.byValueComparator}
            attributes={attributes}
          />
        </div>
        <div className={cx('control')}>
          <div
            className={cx('icon', { disabled: this.props.invalid })}
            onClick={handleSubmit(onConfirm)}
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
