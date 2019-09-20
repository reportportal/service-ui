import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { orderedDefectFieldsSelector } from 'controllers/project';
import {
  defectLinkSelector,
  statisticsLinkSelector,
  TEST_ITEMS_TYPE_LIST,
} from 'controllers/testItem';
import { activeProjectSelector } from 'controllers/user';
import { TEST_ITEM_PAGE } from 'controllers/pages';
import { TotalStatistics } from './totalStatistics';
import { OverallDefects } from './overallDefects';
import styles from './overallStatistics.scss';

const cx = classNames.bind(styles);

@connect(
  (state) => ({
    orderedContentFields: orderedDefectFieldsSelector(state),
    project: activeProjectSelector(state),
    getDefectLink: defectLinkSelector(state),
    getStatisticsLink: statisticsLinkSelector(state),
  }),
  {
    navigate: (linkAction) => linkAction,
  },
)
export class OverallStatisticsPanel extends React.PureComponent {
  static propTypes = {
    widget: PropTypes.object.isRequired,
    orderedContentFields: PropTypes.array.isRequired,
    project: PropTypes.string.isRequired,
    getDefectLink: PropTypes.func.isRequired,
    getStatisticsLink: PropTypes.func.isRequired,
    navigate: PropTypes.func.isRequired,
    isPreview: PropTypes.bool,
  };

  static defaultProps = {
    isPreview: false,
  };

  onTotalStatisticsClick = (...statuses) => {
    const { widget, getStatisticsLink } = this.props;

    const launchesLimit = widget.contentParameters.itemsCount;
    const link = getStatisticsLink({
      statuses,
      launchesLimit,
    });
    const navigationParams = this.getDefaultNavigationParams();

    this.props.navigate(Object.assign(link, navigationParams));
  };

  onOverallDefectsClick = (defects) => {
    const { widget, getDefectLink } = this.props;

    const launchesLimit = widget.contentParameters.itemsCount;
    const link = getDefectLink({
      defects,
      itemId: TEST_ITEMS_TYPE_LIST,
      launchesLimit,
    });
    const navigationParams = this.getDefaultNavigationParams();

    this.props.navigate(Object.assign(link, navigationParams));
  };

  getOrderedValues = () => {
    const { widget, orderedContentFields } = this.props;
    const values = widget.content.result[0].values;

    return orderedContentFields
      .filter((key) => widget.contentParameters.contentFields.indexOf(key) !== -1)
      .map((key) => ({ key, value: values[key] || 0 }));
  };

  getTotals = () => {
    const { widget } = this.props;
    const values = widget.content.result[0].values;
    const fields = widget.contentParameters.contentFields.filter(
      (field) => field.indexOf('executions') !== -1,
    );
    const newValues = {};

    fields.forEach((field) => {
      newValues[field] = values[field] || 0;
    });

    return newValues;
  };

  getDefaultNavigationParams = () => ({
    payload: {
      projectId: this.props.project,
      filterId: this.props.widget.appliedFilters[0].id,
      testItemIds: TEST_ITEMS_TYPE_LIST,
    },
    type: TEST_ITEM_PAGE,
  });

  render() {
    const { isPreview } = this.props;

    return (
      <div className={cx('container')}>
        <div className={cx('total')}>
          <TotalStatistics onChartClick={this.onTotalStatisticsClick} values={this.getTotals()} />
        </div>

        {!isPreview && (
          <div className={cx('defects')}>
            <OverallDefects
              onChartClick={this.onOverallDefectsClick}
              valuesArray={this.getOrderedValues()}
            />
          </div>
        )}
      </div>
    );
  }
}
