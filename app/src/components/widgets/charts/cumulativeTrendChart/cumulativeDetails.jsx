import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import isEqual from 'fast-deep-equal';
import { activeProjectSelector } from 'controllers/user';
import RightArrowIcon from 'common/img/arrow-right-inline.svg';
import { DefectTypeBlock } from 'pages/inside/common/infoLine/defectTypeBlock';
import { DEFECT_TYPES_SEQUENCE } from 'common/constants/defectTypes';
import LeftArrowIcon from 'common/img/arrow-left-small-inline.svg';
import styles from './cumulativeDetails.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  BackToChart: {
    id: 'CumulativeChart.BackToChart',
    defaultMessage: 'Back to chart',
  },
  NameTitle: {
    id: 'LaunchLevelEntities.NameTitle',
    defaultMessage: 'Launch name',
  },
  TotalTitle: {
    id: 'LaunchLevelEntities.TotalTitle',
    defaultMessage: 'Total',
  },
  PassedTitle: {
    id: 'LaunchLevelEntities.PassedTitle',
    defaultMessage: 'Passed',
  },
  FailedTitle: {
    id: 'LaunchLevelEntities.FailedTitle',
    defaultMessage: 'Failed',
  },
  SkippedTitle: {
    id: 'LaunchLevelEntities.SkippedTitle',
    defaultMessage: 'Skipped',
  },
  PassRate: {
    id: 'LaunchLevelEntities.PassRate',
    defaultMessage: 'Pass. rate',
  },
  DefectType: {
    id: 'LaunchLevelEntities.DefectType',
    defaultMessage: 'Defect type',
  },
});

@connect((state) => ({
  activeProject: activeProjectSelector(state),
}))
@injectIntl
export class CumulativeDetails extends PureComponent {
  static propTypes = {
    intl: intlShape.isRequired,
    widget: PropTypes.object,
    activeAttribute: PropTypes.object,
    activeAttributes: PropTypes.array,
    activeProject: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
  };

  static defaultProps = {
    widget: null,
    activeAttribute: null,
    activeAttributes: [],
  };

  state = {
    launches: [],
  };

  componentDidUpdate(prevProps) {
    if (!isEqual(prevProps.widget.content, this.props.widget.content)) {
      this.fetchLaunches();
    }
  }

  getLaunchIds = () => {
    const {
      widget: {
        content: { result },
      },
    } = this.props;

    return result.reduce((ids, bar) => [...ids, ...bar.content.launchIds], []);
  };

  getPassingRate = (passed, total) => `${Math.round(100 * passed / total)}%`;

  fetchLaunches = () => {
    fetch(URLS.launchByIds(this.props.activeProject, this.getLaunchIds()), {
      method: 'get',
    }).then((res) => {
      this.setState({
        launches: res.content,
      });
    });
  };

  renderGridCell = (content) => <div className={cx('grid-cell')}>{content}</div>;

  render() {
    const {
      onClose,
      activeAttributes,
      intl: { formatMessage },
    } = this.props;

    const {
      NameTitle,
      FailedTitle,
      PassedTitle,
      SkippedTitle,
      TotalTitle,
      PassRate,
      DefectType,
      BackToChart,
    } = messages;

    const COLUMNS = [
      formatMessage(NameTitle),
      formatMessage(FailedTitle),
      formatMessage(PassedTitle),
      formatMessage(SkippedTitle),
      formatMessage(TotalTitle),
      formatMessage(PassRate),
      formatMessage(DefectType),
    ];

    return (
      <Fragment>
        <div className={cx('details-legend')}>
          <i className={cx('icon')}>{Parser(LeftArrowIcon)}</i>

          <span className={cx('back-link')} onClick={onClose}>
            {formatMessage(BackToChart)}
          </span>

          {activeAttributes.map((attr, i) => (
            <span className={cx('attribute')} key={attr.key}>
              {attr.key}: {attr.value}{' '}
              {i + 1 < activeAttributes.length && (
                <i className={cx('icon', 'icon-right')}>{Parser(RightArrowIcon)}</i>
              )}
            </span>
          ))}
        </div>

        <div className={cx('grid')}>
          <div className={cx('grid-header')}>
            {COLUMNS.map((column) => this.renderGridCell(column))}
          </div>

          {this.state.launches.map((launch) => {
            const {
              id,
              name,
              statistics: {
                executions: { failed, passed, skipped, total },
              },
            } = launch;

            const passingRate = this.getPassingRate(
              launch.statistics.executions.passed,
              launch.statistics.executions.total,
            );

            const values = [name, failed, passed, skipped, total, passingRate];

            return (
              <div className={cx('grid-row')} key={id}>
                {values.map((value) => this.renderGridCell(value))}

                {this.renderGridCell(
                  DEFECT_TYPES_SEQUENCE.map((defect) => {
                    const value = launch.statistics.defects[defect.toLowerCase()];

                    return value ? (
                      <div key={defect} className={cx('defect-type')}>
                        <DefectTypeBlock type={defect} data={value} />
                      </div>
                    ) : null;
                  }),
                )}
              </div>
            );
          })}
        </div>
      </Fragment>
    );
  }
}
