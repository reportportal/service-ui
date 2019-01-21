import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { reduxForm, formValues } from 'redux-form';
import Parser from 'html-react-parser';
import { FieldProvider } from 'components/fields/fieldProvider';
import { InputTagsSearch } from 'components/inputs/inputTagsSearch';
import { URLS } from 'common/urls';
import { activeProjectSelector } from 'controllers/user';
import { validate } from 'common/utils';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import CircleCrossIcon from 'common/img/circle-cross-icon-inline.svg';
import CircleCheckIcon from 'common/img/circle-check-inline.svg';
import styles from './attributeEditor.scss';

const cx = classNames.bind(styles);

const ValueField = formValues({ attributeKey: 'key' })(
  ({ attributeKey, parse, format, makeOptions, projectId, ...rest }) => (
    <FieldProvider name="value" format={format} parse={parse}>
      <FieldErrorHint staticHint>
        <InputTagsSearch
          customClass={cx('input')}
          async
          minLength={1}
          makeOptions={makeOptions}
          uri={URLS.launchAttributeValuesSearch(projectId, attributeKey)}
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
      valueError = 'attributeLengthHint';
    }
    return {
      key: key && !validate.attributeKey(key) ? 'attributeLengthHint' : undefined,
      value: valueError,
    };
  },
})
export class AttributeEditor extends Component {
  static propTypes = {
    projectId: PropTypes.string,
    onConfirm: PropTypes.func,
    onCancel: PropTypes.func,
    handleSubmit: PropTypes.func,
  };

  static defaultProps = {
    projectId: null,
    handleSubmit: () => {},
    onConfirm: () => {},
    onCancel: () => {},
  };

  makeOptions = (attributes) =>
    attributes && !!attributes.length ? attributes.map((tag) => ({ value: tag, label: tag })) : [];

  formatValue = (value) => (value ? { value, label: value } : null);
  parseValue = (value) => (value ? value.value : undefined);

  render() {
    const { projectId, onConfirm, onCancel, handleSubmit } = this.props;
    return (
      <div className={cx('attribute-editor')}>
        <div className={cx('control')}>
          <FieldProvider name="key" format={this.formatValue} parse={this.parseValue}>
            <FieldErrorHint staticHint>
              <InputTagsSearch
                customClass={cx('input')}
                async
                minLength={1}
                makeOptions={this.makeOptions}
                uri={URLS.launchAttributeKeysSearch(projectId)}
                isClearable
              />
            </FieldErrorHint>
          </FieldProvider>
        </div>
        <div className={cx('control')}>
          <ValueField
            parse={this.parseValue}
            format={this.formatValue}
            projectId={projectId}
            makeOptions={this.makeOptions}
          />
        </div>
        <div className={cx('control')}>
          <div className={cx('icon')} onClick={handleSubmit(onConfirm)}>
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
