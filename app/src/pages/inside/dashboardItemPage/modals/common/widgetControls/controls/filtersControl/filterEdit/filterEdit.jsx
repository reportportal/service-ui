import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { InputRadio } from 'components/inputs/inputRadio';
import { messages } from '../common/messages';
import { AddEditFilter } from '../common/addEditFilter';
import styles from './filterEdit.scss';

const cx = classNames.bind(styles);

export class FilterEdit extends Component {
  static propTypes = {
    filter: PropTypes.object.isRequired,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
  };

  static defaultProps = {
    onSave: () => {},
    onCancel: () => {},
    onChange: () => {},
  };

  onFilterSave = () => this.props.onSave(this.props.filter);

  getCustomBlock = (filter) => (
    <div className={cx('filter-edit-header')}>
      <InputRadio value={filter.id} ownValue={filter.id} name="filter-item" circleAtTop>
        {filter.name}
      </InputRadio>
    </div>
  );

  render() {
    const { filter, onCancel, onChange } = this.props;

    return (
      <AddEditFilter
        filter={filter}
        onCancel={onCancel}
        onSubmit={this.onFilterSave}
        onChange={onChange}
        customBlock={this.getCustomBlock(filter)}
        blockTitle={messages.editTitle}
      />
    );
  }
}
