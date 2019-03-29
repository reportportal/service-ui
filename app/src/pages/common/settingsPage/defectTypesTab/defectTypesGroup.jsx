import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, intlShape } from 'react-intl';

import { C3Chart } from 'components/widgets/charts/common/c3chart';
import { GhostButton } from 'components/buttons/ghostButton';
import PlusIcon from 'common/img/plus-button-inline.svg';

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
export class DefectTypesGroup extends Component {
  static propTypes = {
    group: PropTypes.arrayOf(defectTypeShape).isRequired,
    intl: intlShape.isRequired,
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

  MAX_DEFECT_SUBTYPES_COUNT = 15;

  render() {
    const { group, intl } = this.props;

    return (
      <div>
        {group.map(({ id, longName, shortName, color }, i) => (
          <div key={id} className={cx('defect-type')}>
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
            {i === 0 && (
              <div className={cx('diagram-cell')}>
                <C3Chart className={cx('defect-type-chart')} config={this.getChartConfig()} />
              </div>
            )}
          </div>
        ))}
        <div className={cx('defect-type-group-footer')}>
          <GhostButton icon={PlusIcon} disabled={group.length >= this.MAX_DEFECT_SUBTYPES_COUNT}>
            {intl.formatMessage(messages.addDefectType)}
          </GhostButton>

          <div className={cx('defect-type-count-msg')}>
            {group.length < this.MAX_DEFECT_SUBTYPES_COUNT
              ? `${this.MAX_DEFECT_SUBTYPES_COUNT - group.length} ${intl.formatMessage(
                  messages.subtypesCanBeAdded,
                )}`
              : intl.formatMessage(messages.allSubtypesAreAdded, {
                  count: this.MAX_DEFECT_SUBTYPES_COUNT,
                })}
          </div>
        </div>
      </div>
    );
  }
}
