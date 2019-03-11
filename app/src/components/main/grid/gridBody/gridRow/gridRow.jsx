import React, { Component } from 'react';
import track from 'react-tracking';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { LOG_MESSAGE_HIGHLIGHT_TIMEOUT } from '../../constants';
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
    rowHighlightingConfig: PropTypes.shape({
      onGridRowHighlighted: PropTypes.func,
      isGridRowHighlighted: PropTypes.bool,
      highlightedRowId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
    excludeFromSelection: PropTypes.arrayOf(PropTypes.object),
  };

  static defaultProps = {
    columns: [],
    value: {},
    selectable: false,
    selectedItems: [],
    onToggleSelection: () => {},
    changeOnlyMobileLayout: false,
    rowClassMapper: null,
    toggleAccordionEventInfo: {},
    rowHighlightingConfig: {},
    excludeFromSelection: [],
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
    if (this.checkIfTheHighlightNeeded()) {
      this.highLightGridRow();
    }
  }
  get isItemSelected() {
    return this.props.selectedItems.some((item) => item.id === this.props.value.id);
  }
  get isItemDisabled() {
    return this.props.excludeFromSelection.some((item) => item.id === this.props.value.id);
  }
  setupRef = (overflowCell) => {
    this.overflowCell = overflowCell;
  };
  setupAccordion = () => {
    this.setState({ withAccordion: true });
    this.overflowCell.style.maxHeight = `${this.overflowCellMaxHeight}px`;
  };

  getHighLightBlockSize = () =>
    this.rowRef && this.rowRef.current
      ? {
          height: `${this.rowRef.current.clientHeight}px`,
          width: `${this.rowRef.current.clientWidth}px`,
        }
      : {};

  getHighlightBlockClasses = () =>
    this.checkIfTheHighlightNeeded() ? this.highLightBlockClasses : '';

  checkIfTheHighlightNeeded = () => {
    const { highlightedRowId, isGridRowHighlighted } = this.props.rowHighlightingConfig;
    return (
      this.highlightBlockRef.current &&
      highlightedRowId === this.props.value.id &&
      !isGridRowHighlighted
    );
  };

  highlightBlockRef = React.createRef();

  rowRef = React.createRef();

  highLightBlockClasses = `${cx('highlight')} ${cx('hide-highlight')}`;

  highLightGridRow() {
    this.highlightBlockRef.current.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
      this.props.rowHighlightingConfig.onGridRowHighlighted();
    }, LOG_MESSAGE_HIGHLIGHT_TIMEOUT);
  }

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
  render() {
    const { columns, value, selectable, changeOnlyMobileLayout, rowClassMapper } = this.props;
    const { expanded } = this.state;
    const customClasses = (rowClassMapper && rowClassMapper(value)) || {};

    return (
      <div
        className={cx('grid-row-wrapper', {
          selected: this.isItemSelected,
          ...customClasses,
        })}
        data-id={value.id}
        ref={this.rowRef}
      >
        <div className={cx('grid-row')}>
          <div
            ref={this.highlightBlockRef}
            className={cx('highlight-block', this.getHighlightBlockClasses())}
            style={this.getHighLightBlockSize()}
          />
        </div>
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
                disabled: this.isItemDisabled,
                selected: this.isItemSelected,
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
