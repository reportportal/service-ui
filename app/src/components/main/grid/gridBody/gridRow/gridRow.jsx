import React, { Component } from 'react';
import track from 'react-tracking';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { columnPropTypes } from '../../propTypes';
import { GridCell } from './gridCell';
import { CheckboxCell } from './checkboxCell';
import styles from './gridRow.scss';

const cx = classNames.bind(styles);

@track()
export class GridRow extends Component {
  static propTypes = {
    columns: PropTypes.arrayOf(PropTypes.shape(columnPropTypes)),
    value: PropTypes.object,
    selectable: PropTypes.bool,
    selectedItems: PropTypes.arrayOf(PropTypes.object),
    onToggleSelection: PropTypes.func,
    changeOnlyMobileLayout: PropTypes.bool,
    rowClassMapper: PropTypes.func,
    toggleAccordionEventInfo: PropTypes.object,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    columns: [],
    value: {},
    selectable: false,
    selectedItems: [],
    onToggleSelection: () => {},
    changeOnlyMobileLayout: false,
    rowClassMapper: () => {},
    toggleAccordionEventInfo: {},
  };

  state = {
    withAccordion: false,
    expanded: false,
  };
  componentDidMount() {
    this.handleAccordion();
  }
  componentDidUpdate() {
    this.handleAccordion();
  }
  setupRef = (overflowCell) => {
    this.overflowCell = overflowCell;
  };
  setupAccordion = () => {
    this.setState({ withAccordion: true });
    this.overflowCell.style.maxHeight = `${this.overflowCellMaxHeight}px`;
  };
  removeAccordion = () => {
    this.setState({ withAccordion: false });
    this.overflowCell.style.maxHeight = null;
  };
  handleAccordion = () => {
    if (!this.overflowCell) {
      return;
    }
    if (this.overflowCell.offsetHeight > this.overflowCellMaxHeight) {
      !this.state.withAccordion && this.setupAccordion();
    } else if (this.overflowCell.offsetHeight < this.overflowCellMaxHeight) {
      this.state.withAccordion && this.removeAccordion();
    }
  };

  toggleAccordion = () => {
    if (!this.overflowCell) {
      return;
    }
    this.props.tracking.trackEvent(this.props.toggleAccordionEventInfo);
    this.setState({ expanded: !this.state.expanded }, () => {
      this.overflowCell.style.maxHeight = !this.state.expanded
        ? `${this.overflowCellMaxHeight}px`
        : null;
    });
  };

  isItemSelected = () => this.props.selectedItems.some((item) => item.id === this.props.value.id);

  render() {
    const { columns, value, selectable, changeOnlyMobileLayout, rowClassMapper } = this.props;
    const { expanded } = this.state;
    const customClasses = (rowClassMapper && rowClassMapper(value)) || {};
    return (
      <div
        className={cx('grid-row-wrapper', {
          selected: this.isItemSelected(),
          ...customClasses,
        })}
      >
        {this.state.withAccordion && (
          <div className={cx('accordion-wrapper-mobile')}>
            <div
              className={cx('accordion-toggler-mobile', { rotated: this.state.expanded })}
              onClick={this.toggleAccordion}
            />
          </div>
        )}
        <div className={cx('grid-row', { 'change-mobile': changeOnlyMobileLayout })}>
          {columns.map((column, i) => {
            if (column.maxHeight) {
              this.overflowCellMaxHeight = column.maxHeight;
            }
            return (
              <GridCell
                key={column.id || i}
                refFunction={column.maxHeight ? this.setupRef : null}
                mobileWidth={column.mobileWidth}
                value={value}
                align={column.align}
                component={column.component}
                formatter={column.formatter}
                title={column.title}
                customProps={column.customProps}
                expanded={expanded}
                toggleExpand={this.toggleAccordion}
              />
            );
          })}
          {selectable && (
            <GridCell
              align={'right'}
              component={CheckboxCell}
              value={value}
              customProps={{
                selected: this.isItemSelected(),
                onChange: this.props.onToggleSelection,
              }}
            />
          )}
        </div>
        {this.state.withAccordion && (
          <div className={cx('grid-row')}>
            <div className={cx('accordion-wrapper')}>
              <div className={cx('accordion-block', { expanded: this.state.expanded })}>
                <div
                  className={cx('accordion-toggler', { rotated: this.state.expanded })}
                  onClick={this.toggleAccordion}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}
