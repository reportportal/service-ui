import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { injectIntl, intlShape } from 'react-intl';

import { C3Chart } from 'components/widgets/charts/common/c3chart';
import { Input } from 'components/inputs/input';
import { ColorPicker } from 'components/main/colorPicker';
import CircleCrossIcon from 'common/img/circle-cross-icon-inline.svg';
import CircleCheckIcon from 'common/img/circle-check-inline.svg';
import PencilIcon from 'common/img/pencil-icon-inline.svg';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';

import { defectTypeShape } from './defectTypeShape';
import { messages } from './defectTypesMessages';

import styles from './defectTypesTab.scss';

const cx = classNames.bind(styles);

const ColorMarker = ({ color }) => (
  <span className={cx('color-marker')} style={{ backgroundColor: color }} />
);

ColorMarker.propTypes = {
  color: PropTypes.string.isRequired,
};

@injectIntl
export class DefectSubType extends Component {
  static propTypes = {
    data: defectTypeShape,
    parentType: defectTypeShape.isRequired,
    group: PropTypes.arrayOf(defectTypeShape),
    intl: intlShape.isRequired,
  };

  static defaultProps = {
    data: {},
    group: null,
  };

  static getDerivedStateFromProps(props) {
    if (!props.data.id) {
      return {
        isEditMode: true,
      };
    }
    return null;
  }

  state = {
    isEditMode: false,
  };

  getChartConfig() {
    return {
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
    };
  }

  setEditMode = () => {
    this.setState({ isEditMode: true });
  };

  render() {
    const {
      data: { color, longName, shortName },
      parentType,
      group,
      intl,
    } = this.props;

    const { isEditMode } = this.state;

    return (
      <div className={cx('defect-type')}>
        {isEditMode ? (
          <Fragment>
            <div className={cx('name-cell')}>
              <Input
                placeholder={intl.formatMessage(messages.defectNameCol)}
                value={longName || ''}
              />
            </div>
            <div className={cx('abbr-cell')}>
              <Input
                placeholder={intl.formatMessage(messages.abbreviationCol)}
                value={shortName || ''}
              />
            </div>
            <div className={cx('color-cell')}>
              <ColorPicker color={color || parentType.color} />
            </div>
            <div className={cx('buttons-cell')}>
              <button
                className={cx('action-button', 'confirm-button')}
                aria-label={intl.formatMessage(COMMON_LOCALE_KEYS.CONFIRM)}
                title={intl.formatMessage(COMMON_LOCALE_KEYS.CONFIRM)}
              >
                {Parser(CircleCheckIcon)}
              </button>
              <button
                className={cx('action-button', 'delete-button')}
                aria-label={intl.formatMessage(COMMON_LOCALE_KEYS.DELETE)}
                title={intl.formatMessage(COMMON_LOCALE_KEYS.DELETE)}
              >
                {Parser(CircleCrossIcon)}
              </button>
            </div>
          </Fragment>
        ) : (
          <Fragment>
            <div className={cx('name-cell')}>
              <span className={cx('defect-type-name-wrap')}>
                <ColorMarker color={color} />
                <span className={cx('defect-type-name')}>{longName}</span>
              </span>
            </div>
            <div className={cx('abbr-cell')}>{shortName}</div>
            <div className={cx('color-cell')}>
              <ColorMarker color={color} />
            </div>
            <div className={cx('buttons-cell')}>
              {!group && (
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
                  >
                    {Parser(CircleCrossIcon)}
                  </button>
                </Fragment>
              )}
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
