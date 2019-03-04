import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import AddFilterIcon from 'common/img/add-filter-inline.svg';
import CrossIcon from 'common/img/cross-icon-inline.svg';
import SearchIcon from 'common/img/search-icon-inline.svg';
import { EntitiesGroup } from 'components/filterEntities/entitiesGroup';
import { InputFilterToolbar } from './inputFilterToolbar';
import styles from './inputFilter.scss';

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
    filterEntities: PropTypes.array,
    onAdd: PropTypes.func,
    onRemove: PropTypes.func,
    onValidate: PropTypes.func,
    filterErrors: PropTypes.object,
    onClear: PropTypes.func,
    onFilterChange: PropTypes.func,
    onFilterValidate: PropTypes.func,
    onFilterRemove: PropTypes.func,
    onFilterAdd: PropTypes.func,
    onFilterApply: PropTypes.func,
    onFilterStringChange: PropTypes.func,
    filterActive: PropTypes.bool,
    onCancel: PropTypes.func,
  };

  static defaultProps = {
    value: '',
    placeholder: '',
    maxLength: '256',
    className: '',
    active: false,
    disabled: false,
    error: '',
    onChange: () => {},
    filterEntities: [],
    onAdd: () => {},
    onRemove: () => {},
    onValidate: () => {},
    filterErrors: {},
    onClear: () => {},
    onFilterChange: () => {},
    onFilterValidate: () => {},
    onFilterRemove: () => {},
    onFilterAdd: () => {},
    onFilterApply: () => {},
    onFilterStringChange: () => {},
    filterActive: false,
    onCancel: () => {},
  };

  state = {
    opened: false,
  };

  handleChangeInput = (e) => this.props.onFilterStringChange(e.target.value);

  handleClickClear = () => this.props.onFilterStringChange('');

  handleApply = () => {
    this.setState({ opened: false });
    this.props.onFilterApply();
  };

  handleCancel = () => {
    this.setState({ opened: false });
    this.props.onCancel();
  };

  togglePopup = () => this.setState({ opened: !this.state.opened });

  render() {
    const {
      error,
      active,
      disabled,
      className,
      placeholder,
      maxLength,
      onFilterChange,
      onFilterValidate,
      onFilterRemove,
      onFilterAdd,
      filterErrors,
      filterEntities,
      onClear,
      value,
      filterActive,
    } = this.props;
    return (
      <React.Fragment>
        <div
          className={cx('input-filter', { error, active, disabled: disabled || this.state.opened })}
        >
          <div className={cx('icon', 'search')}>{Parser(SearchIcon)}</div>
          <div
            className={cx('icon', 'add-filter', { inactive: !filterActive })}
            onClick={this.togglePopup}
          >
            {Parser(AddFilterIcon)}
          </div>
          {!!value && (
            <div className={cx('icon', 'cross')} onClick={this.handleClickClear}>
              {Parser(CrossIcon)}
            </div>
          )}
          <input
            className={cx('input', className)}
            value={value}
            disabled={disabled || this.state.opened}
            placeholder={placeholder}
            maxLength={maxLength}
            onChange={this.handleChangeInput}
          />
        </div>
        {this.state.opened && (
          <div className={cx('filters-container')}>
            <div className={cx('filters')}>
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
            <InputFilterToolbar
              onApply={this.handleApply}
              onClear={onClear}
              onCancel={this.handleCancel}
              entities={filterEntities}
            />
          </div>
        )}
      </React.Fragment>
    );
  }
}
