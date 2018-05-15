import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import { URLS } from 'common/urls';
import { InputTagsSearch } from 'components/inputs/inputTagsSearch';
import { activeProjectSelector } from 'controllers/user';
import { connect } from 'react-redux';
import styles from './inputConditionalTags.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  tagsHint: {
    id: 'InputConditionalTags.tagsHint',
    defaultMessage: 'Please enter 1 or more characters',
  },
});

@injectIntl
@connect((state) => ({
  activeProject: activeProjectSelector(state),
}))
export class InputConditionalTags extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    value: PropTypes.object,
    conditions: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.string.isRequired,
        label: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
      }),
    ),
    placeholder: PropTypes.string,
    activeProject: PropTypes.string.isRequired,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
  };

  static defaultProps = {
    value: {},
    conditions: [],
    placeholder: '',
    onChange: () => {},
    onFocus: () => {},
    onBlur: () => {},
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

  handleClickOutside = (e) => {
    if (!this.conditionsBlock.contains(e.target)) {
      this.setState({ opened: false });
    }
  };

  formatTags = (tags) =>
    tags && !!tags.length ? tags.map((tag) => ({ value: tag, label: tag })) : [];

  parseTags = (options) => options.map((option) => option.value).join(',');

  render() {
    const { intl, value, conditions, activeProject, placeholder } = this.props;
    const formattedValue = this.formatTags(value.value.split(','));
    return (
      <div className={cx('input-conditional-tags', { opened: this.state.opened })}>
        <InputTagsSearch
          placeholder={placeholder}
          focusPlaceholder={intl.formatMessage(messages.tagsHint)}
          minLength={1}
          async
          uri={URLS.launchTagsSearch(activeProject)}
          makeOptions={this.formatTags}
          creatable
          showNewLabel
          multi
          removeSelected
          value={formattedValue.length && formattedValue[0].value ? formattedValue : []}
          onChange={this.onChangeTags}
        />
        <div className={cx('conditions-block')} ref={this.setConditionsBlockRef}>
          <div className={cx('conditions-selector')} onClick={this.onClickConditionBlock}>
            <span className={cx('condition-selected')}>
              {conditions.filter((condition) => condition.value === value.condition)[0].shortLabel}
            </span>
            <i className={cx('arrow', { rotated: this.state.opened })} />
          </div>
          <div className={cx('conditions-list', { visible: this.state.opened })}>
            {conditions.map((condition) => (
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
