import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import { InputTagsSearch } from 'components/inputs/inputTagsSearch';
import {
  CONDITION_HAS,
  CONDITION_NOT_HAS,
  CONDITION_ANY,
  CONDITION_NOT_ANY,
} from 'components/filterEntities/constants';
import { getInputConditions } from 'common/constants/inputConditions';
import styles from './inputConditionalTags.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  tagsHint: {
    id: 'InputConditionalTags.tagsHint',
    defaultMessage: 'Please enter 1 or more characters',
  },
});

@injectIntl
export class InputConditionalTags extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    value: PropTypes.object,
    conditions: PropTypes.arrayOf(PropTypes.string),
    inputProps: PropTypes.object,
    placeholder: PropTypes.string,
    uri: PropTypes.string.isRequired,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
  };

  static defaultProps = {
    value: {},
    inputProps: {},
    placeholder: '',
    onChange: () => {},
    onFocus: () => {},
    onBlur: () => {},
    conditions: [CONDITION_HAS, CONDITION_NOT_HAS, CONDITION_ANY, CONDITION_NOT_ANY],
  };
  state = {
    opened: false,
  };

  componentDidMount() {
    document.addEventListener('click', this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  }

  onClickConditionBlock = () => {
    this.setState({ opened: !this.state.opened });
  };

  onClickConditionItem = (condition) => {
    if (condition.value !== this.props.value.condition) {
      this.setState({ opened: false });
      this.props.onChange({ value: this.props.value.value, condition: condition.value });
    }
  };

  onChangeTags = (tags) => {
    this.props.onChange({ value: this.parseTags(tags), condition: this.props.value.condition });
  };

  setConditionsBlockRef = (conditionsBlock) => {
    this.conditionsBlock = conditionsBlock;
  };
  getConditions = () => {
    const { conditions } = this.props;
    return getInputConditions(conditions);
  };
  handleClickOutside = (e) => {
    if (!this.conditionsBlock.contains(e.target)) {
      this.setState({ opened: false });
    }
  };

  formatTags = (tags) =>
    tags && !!tags.length ? tags.map((tag) => ({ value: tag, label: tag })) : [];

  parseTags = (options) => options.map((option) => option.value).join(',');

  render() {
    const { intl, value, uri, placeholder, inputProps } = this.props;
    const formattedValue = value.value ? this.formatTags(value.value.split(',')) : [];
    return (
      <div className={cx('input-conditional-tags', { opened: this.state.opened })}>
        <InputTagsSearch
          placeholder={placeholder}
          focusPlaceholder={intl.formatMessage(messages.tagsHint)}
          minLength={1}
          async
          uri={uri}
          makeOptions={this.formatTags}
          creatable
          showNewLabel
          multi
          removeSelected
          value={formattedValue.length && formattedValue[0].value ? formattedValue : []}
          onChange={this.onChangeTags}
          inputProps={inputProps}
        />
        <div className={cx('conditions-block')} ref={this.setConditionsBlockRef}>
          <div className={cx('conditions-selector')} onClick={this.onClickConditionBlock}>
            <span className={cx('condition-selected')}>
              {this.getConditions().length &&
                value.condition &&
                this.getConditions().filter((condition) => condition.value === value.condition)[0]
                  .shortLabel}
            </span>
            <i className={cx('arrow', { rotated: this.state.opened })} />
          </div>
          <div className={cx('conditions-list', { visible: this.state.opened })}>
            {this.getConditions() &&
              this.getConditions().map((condition) => (
                <div
                  key={condition.value}
                  className={cx('condition', {
                    active: condition.value === value.condition,
                    disabled: condition.disabled,
                  })}
                  onClick={() => {
                    !condition.disabled && this.onClickConditionItem(condition);
                  }}
                >
                  {condition.label}
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  }
}
