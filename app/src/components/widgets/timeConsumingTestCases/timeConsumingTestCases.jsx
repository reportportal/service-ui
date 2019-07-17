import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { activeProjectSelector } from 'controllers/user';
import { TEST_ITEM_PAGE } from 'controllers/pages/constants';
import { CHART_MODES, MODES_VALUES } from 'common/constants/chartModes';
import { ALL } from 'common/constants/reservedFilterIds';
import { TimeConsumingTestCasesChart } from './timeConsumingTestCasesChart';
import { TimeConsumingTestCasesTable } from './timeConsumingTestCasesTable';
import styles from './timeConsumingTestCases.scss';

const cx = classNames.bind(styles);

const launchNameBlockHeight = 40;

const localMessages = defineMessages({
  launchNameText: {
    id: 'TimeConsuming.launchNameText',
    defaultMessage: 'LAUNCH NAME:',
  },
});

@injectIntl
@connect(
  (state) => ({
    project: activeProjectSelector(state),
  }),
  {
    navigate: (linkAction) => linkAction,
  },
)
export class TimeConsumingTestCases extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    widget: PropTypes.object.isRequired,
    container: PropTypes.instanceOf(Element).isRequired,
    project: PropTypes.string.isRequired,
    navigate: PropTypes.func.isRequired,
    isPreview: PropTypes.bool,
    height: PropTypes.number,
    observer: PropTypes.object,
  };

  static defaultProps = {
    isPreview: false,
    height: 0,
    observer: {},
  };

  launchNameClickHandler = () => {
    const {
      project,
      widget: { content: { latestLaunch = {} } = {} },
      navigate,
    } = this.props;

    const navigationParams = {
      payload: {
        projectId: project,
        filterId: ALL,
        testItemIds: latestLaunch.id,
      },
      type: TEST_ITEM_PAGE,
    };

    navigate(navigationParams);
  };

  render() {
    const {
      widget: { name: launchName, contentParameters: { widgetOptions: { viewMode } = {} } = {} },
      widget = {},
      intl: { formatMessage },
      height,
      isPreview,
      navigate,
      project,
      observer,
      container,
    } = this.props;

    const availableHeight = container.offsetHeight - launchNameBlockHeight;

    return (
      <div className={cx('time-consuming')}>
        <div
          className={cx('launch-name-block')}
          style={{ height: launchNameBlockHeight }}
          onClick={this.launchNameClickHandler}
        >
          <span className={cx('launch-name-text')}>
            {`${formatMessage(localMessages.launchNameText)} `}
          </span>
          <span className={cx('launch-name')}>{`${launchName}`}</span>
        </div>
        {viewMode === MODES_VALUES[CHART_MODES.BAR_VIEW] ? (
          <TimeConsumingTestCasesChart
            widget={widget}
            height={height}
            isPreview={isPreview}
            project={project}
            navigate={navigate}
            observer={observer}
            container={container}
            availableHeight={availableHeight}
          />
        ) : (
          <TimeConsumingTestCasesTable widget={widget} availableHeight={availableHeight} />
        )}
      </div>
    );
  }
}
