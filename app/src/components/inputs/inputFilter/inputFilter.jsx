import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { EntitiesGroup } from '../../filterEntities/entitiesGroup/entitiesGroup';
import { InputFilterToolbar } from './inputFilterToolbar/inputFilterToolbar';
import AddFilterIcon from '../../../common/img/add-filter-inline.svg';
import CrossIcon from '../../../common/img/cross-icon-inline.svg';
import styles from './inputFilter.scss';
import SearchIcon from './img/search-icon-inline.svg';

const cx = classNames.bind(styles);

export class InputFilter extends Component {
  static propTypes = {
    value: PropTypes.string,
    placeholder: PropTypes.string,
    maxLength: PropTypes.string,
    className: PropTypes.string,
    active: PropTypes.bool,
    disabled: PropTypes.bool,
    error: PropTypes.string,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    onKeyUp: PropTypes.func,
    refFunction: PropTypes.func,
    filterEntities: PropTypes.array,
    onAdd: PropTypes.func,
    onRemove: PropTypes.func,
    onValidate: PropTypes.func,
    filterErrors: PropTypes.object,
    onApply: PropTypes.func,
    onCancel: PropTypes.func,
    onClear: PropTypes.func,
    onFilterChange: PropTypes.func,
    onFilterValidate: PropTypes.func,
    onFilterRemove: PropTypes.func,
    onFilterAdd: PropTypes.func,
  };

  static defaultProps = {
    value: '',
    placeholder: '',
    maxLength: '254',
    className: '',
    active: false,
    disabled: false,
    error: '',
    onChange: () => {},
    onFocus: () => {},
    onBlur: () => {},
    onKeyUp: () => {},
    refFunction: () => {},
    filterEntities: [],
    onAdd: () => {},
    onRemove: () => {},
    onValidate: () => {},
    filterErrors: {},
    onApply: () => {},
    onCancel: () => {},
    onClear: () => {},
    onFilterChange: () => {},
    onFilterValidate: () => {},
    onFilterRemove: () => {},
    onFilterAdd: () => {},
  };

  state = {
    opened: false,
  };

  onChangeInput = (e) => {
    this.props.onChange({ value: e.target.value });
  };

  onClickClear = () => {
    this.props.onChange({ value: '' });
  };

  onClickAddFilter = () => {
    this.setState({ opened: true });
  };

  render() {
    const {
      error,
      value,
      active,
      disabled,
      className,
      placeholder,
      maxLength,
      onFocus,
      onBlur,
      onKeyUp,
      onFilterChange,
      onFilterValidate,
      onFilterRemove,
      onFilterAdd,
      filterErrors,
      filterEntities,
      onCancel,
      onApply,
      onClear,
    } = this.props;
    return (
      <div>
        <div className={cx('input-search', { error, active, disabled })}>
          <div className={cx('icon', 'search')}>{Parser(SearchIcon)}</div>
          <div className={cx('icon', 'add-filter')} onClick={this.onClickAddFilter}>
            {Parser(AddFilterIcon)}
          </div>
          <div className={cx('icon', 'cross')} onClick={this.onClickClear}>
            {Parser(CrossIcon)}
          </div>
          <input
            className={cx('input', className)}
            value={value}
            disabled={disabled}
            placeholder={placeholder}
            maxLength={maxLength}
            onChange={this.onChangeInput}
            onFocus={onFocus}
            onBlur={onBlur}
            onKeyUp={onKeyUp}
          />
        </div>
        <div className={cx('all-filters-container', { opened: this.state.opened && !disabled })}>
          <div className={cx('all-filters')}>
            <EntitiesGroup
              onChange={onFilterChange}
              onValidate={onFilterValidate}
              onRemove={onFilterRemove}
              onAdd={onFilterAdd}
              errors={filterErrors}
              entities={filterEntities}
              staticMode
              vertical
            />
          </div>
          <InputFilterToolbar onApply={onApply} onClear={onClear} onCancel={onCancel} />
        </div>
      </div>
    );
  }
}
