import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { columnPropTypes } from '../../propTypes';
import { GridCell } from './gridCell';
import { CheckboxCell } from './checkboxCell';
import styles from './gridRow.scss';

const cx = classNames.bind(styles);

export class GridRow extends Component {
  static propTypes = {
    columns: PropTypes.arrayOf(PropTypes.shape(columnPropTypes)),
    value: PropTypes.object,
    selectable: PropTypes.bool,
    selectedItems: PropTypes.arrayOf(PropTypes.object),
    onToggleSelection: PropTypes.func,
  };

  static defaultProps = {
    columns: [],
    value: {},
    selectable: false,
    selectedItems: [],
    onToggleSelection: () => {},
  };

  state = {
    withAccordion: false,
    expanded: false,
  };

  setupAccordion = (overflowCell) => {
    this.overflowCell = overflowCell;
    if (this.overflowCell && this.overflowCell.offsetHeight > this.overflowCellMaxHeight) {
      this.setState({ withAccordion: true });
      this.overflowCell.style.maxHeight = `${this.overflowCellMaxHeight}px`;
    }
  };

  toggleAccordion = () => {
    this.setState({ expanded: !this.state.expanded });
    this.overflowCell.style.maxHeight = this.state.expanded ? `${this.overflowCellMaxHeight}px` : null;
  };

  isItemSelected = () => this.props.selectedItems.some(item => item.id === this.props.value.id);

  render() {
    const { columns, value, selectable } = this.props;
    return (
      <div className={cx('grid-row-wrapper', { selected: this.isItemSelected() })}>
        {
          this.state.withAccordion
            &&
              <div className={cx('accordion-wrapper-mobile')}>
                <div
                  className={cx({ 'accordion-toggler-mobile': true, rotated: this.state.expanded })}
                  onClick={this.toggleAccordion}
                />
              </div>
        }
        <div className={cx('grid-row')}>
          {
            columns.map((column, i) => {
              if (column.maxHeight) {
                this.overflowCellMaxHeight = column.maxHeight;
              }
              return (
                <GridCell
                  key={column.id || i}
                  refFunction={column.maxHeight ? this.setupAccordion : null}
                  mobileWidth={column.mobileWidth}
                  value={value}
                  align={column.align}
                  component={column.component}
                  formatter={column.formatter}
                  title={column.title}
                  customProps={column.customProps}
                />
              );
            })
          }
          {
            selectable
              && <GridCell
                align={'right'}
                component={CheckboxCell}
                value={value}
                customProps={{
                  selected: this.isItemSelected(),
                  onChange: this.props.onToggleSelection,
                }}
              />
          }
        </div>
        {
          this.state.withAccordion
            &&
              <div className={cx('grid-row')}>
                <div className={cx('accordion-wrapper')}>
                  <div className={cx('accordion-block')}>
                    <div
                      className={cx({ 'accordion-toggler': true, rotated: this.state.expanded })}
                      onClick={this.toggleAccordion}
                    />
                  </div>
                </div>
              </div>
        }
      </div>
    );
  }
}
