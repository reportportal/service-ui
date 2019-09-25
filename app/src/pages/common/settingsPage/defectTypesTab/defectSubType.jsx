import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { injectIntl, intlShape } from 'react-intl';

import CircleCrossIcon from 'common/img/circle-cross-icon-inline.svg';
import PencilIcon from 'common/img/pencil-icon-inline.svg';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { showModalAction } from 'controllers/modal';
import { deleteDefectSubTypeAction, updateDefectSubTypeAction } from 'controllers/project';
import { SETTINGS_PAGE_EVENTS } from 'components/main/analytics/events';
import { withHoverableTooltip } from 'components/main/tooltips/hoverableTooltip';
import { C3Chart } from 'components/widgets/common/c3chart';

import { defectTypeShape } from './defectTypeShape';
import { DefectSubTypeForm } from './defectSubTypeForm';

import styles from './defectTypesTab.scss';
import { messages } from './defectTypesMessages';

const cx = classNames.bind(styles);

const ColorMarker = ({ color }) => (
  <span className={cx('color-marker')} style={{ backgroundColor: color }} />
);

ColorMarker.propTypes = {
  color: PropTypes.string.isRequired,
};

const DefectTypeName = withHoverableTooltip({
  TooltipComponent: ({ locator }) => `locator: ${locator}`,
  data: {
    placement: 'top',
    dynamicWidth: true,
  },
})(({ color, longName }) => (
  <span className={cx('defect-type-name-wrap')}>
    <ColorMarker color={color} />
    <span className={cx('defect-type-name')}>{longName}</span>
  </span>
));

DefectTypeName.propTypes = {
  color: PropTypes.string.isRequired,
  longName: PropTypes.string.isRequired,
  locator: PropTypes.string.isRequired,
};

@connect(null, {
  showModal: showModalAction,
  deleteDefectSubTypeAction,
  updateDefectSubTypeAction,
})
@injectIntl
export class DefectSubType extends Component {
  static propTypes = {
    data: defectTypeShape,
    parentType: defectTypeShape.isRequired,
    group: PropTypes.arrayOf(defectTypeShape),
    showModal: PropTypes.func.isRequired,
    isPossibleUpdateSettings: PropTypes.bool.isRequired,
    deleteDefectSubTypeAction: PropTypes.func.isRequired,
    updateDefectSubTypeAction: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
  };

  static defaultProps = {
    data: {},
    group: null,
  };

  state = {
    isEditMode: false,
  };

  getChartConfig = () => ({
    data: {
      columns: this.props.group.map(({ locator }) => [locator, 100]),
      colors: this.props.group.reduce((acc, { locator, color }) => {
        acc[locator] = color;
        return acc;
      }, {}),
      type: 'donut',
    },
    donut: {
      expand: false,
      width: 12,
      label: {
        show: false,
      },
    },
    interaction: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    tooltip: {
      show: false,
    },
    size: {
      width: 56,
      height: 56,
    },
  });

  setEditMode = () => {
    this.setState({ isEditMode: true });
  };

  stopEditing = () => {
    this.setState({ isEditMode: false });
  };

  showDeleteConfirmationDialog = () => {
    const {
      showModal,
      data: { longName },
      parentType,
      intl,
    } = this.props;

    showModal({
      id: 'deleteItemsModal',
      data: {
        onConfirm: this.deleteDefectSubType,
        header: intl.formatMessage(messages.deleteModalHeader),
        mainContent: intl.formatMessage(messages.deleteModalContent, {
          name: longName,
          parentName: parentType.longName,
        }),
        eventsInfo: {
          closeIcon: SETTINGS_PAGE_EVENTS.CLOSE_ICON_DELETE_DEFECT_TYPE_MODAL,
          cancelBtn: SETTINGS_PAGE_EVENTS.CANCEL_BTN_DELETE_DEFECT_TYPE_MODAL,
          deleteBtn: SETTINGS_PAGE_EVENTS.DELETE_BTN_DELETE_DEFECT_TYPE_MODAL,
        },
      },
    });
  };

  deleteDefectSubType = () => {
    this.props.deleteDefectSubTypeAction(this.props.data);
  };

  updateDefectSubType = (values, dispatch, props) => {
    props.dirty &&
      this.props.updateDefectSubTypeAction([
        {
          ...values,
          shortName: values.shortName.toUpperCase(),
        },
      ]);

    this.stopEditing();
  };

  render() {
    const {
      data,
      data: { color, locator, longName, shortName },
      group,
      intl,
      isPossibleUpdateSettings,
    } = this.props;

    const { isEditMode } = this.state;

    return (
      <div className={cx('defect-type')}>
        {isEditMode ? (
          <DefectSubTypeForm
            form={data.locator}
            initialValues={data}
            onDelete={this.showDeleteConfirmationDialog}
            onConfirm={this.updateDefectSubType}
          />
        ) : (
          <Fragment>
            <div className={cx('name-cell')}>
              <DefectTypeName color={color} longName={longName} locator={locator} />
            </div>
            <div className={cx('abbr-cell')}>{shortName}</div>
            <div className={cx('color-cell')}>
              <ColorMarker color={color} />
            </div>
            <div className={cx('buttons-cell')}>
              {!group &&
                (isPossibleUpdateSettings && (
                  <Fragment>
                    <button
                      className={cx('action-button', 'edit-button')}
                      aria-label={intl.formatMessage(COMMON_LOCALE_KEYS.EDIT)}
                      title={intl.formatMessage(COMMON_LOCALE_KEYS.EDIT)}
                      onClick={this.setEditMode}
                    >
                      {Parser(PencilIcon)}
                    </button>
                    <button
                      className={cx('action-button', 'delete-button')}
                      aria-label={intl.formatMessage(COMMON_LOCALE_KEYS.DELETE)}
                      title={intl.formatMessage(COMMON_LOCALE_KEYS.DELETE)}
                      onClick={this.showDeleteConfirmationDialog}
                    >
                      {Parser(CircleCrossIcon)}
                    </button>
                  </Fragment>
                ))}
            </div>
          </Fragment>
        )}

        {group && (
          <div className={cx('diagram-cell')}>
            <C3Chart className={cx('defect-type-chart')} config={this.getChartConfig()} />
          </div>
        )}
      </div>
    );
  }
}
