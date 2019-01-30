import * as React from 'react';
import { func, string, number, oneOfType } from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { NavLink } from 'redux-first-router-link';
import { activeProjectSelector } from 'controllers/user';
import { TEST_ITEM_PAGE } from 'controllers/pages';
import { createNamespacedQuery } from 'common/utils/routingUtils';
import { getQueryNamespace } from 'controllers/testItem/utils';
import { ALL } from 'common/constants/reservedFilterIds';
import { AbsRelTime } from 'components/main/absRelTime';
import { PTTest } from '../../pTypes';
import { Count } from '../count';
import styles from './testsTableRow.scss';

const cx = classNames.bind(styles);

@connect((state) => ({
  activeProject: activeProjectSelector(state),
}))
export class TestsTableRow extends React.Component {
  static propTypes = {
    activeProject: string.isRequired,
    data: PTTest.isRequired,
    name: string.isRequired,
    count: number.isRequired,
    time: number.isRequired,
    matrixData: string.isRequired,
    matrixComponent: func.isRequired,
    launchId: oneOfType([number, string]).isRequired,
  };

  getLinkParams = (uniqueId) => {
    const { activeProject, launchId } = this.props;

    return {
      type: TEST_ITEM_PAGE,
      payload: {
        projectId: activeProject,
        filterId: ALL,
        testItemIds: launchId,
      },
      meta: {
        query: {
          ...createNamespacedQuery(
            {
              'filter.eq.uniqueId': uniqueId,
              'filter.eq.hasChildren': false,
            },
            getQueryNamespace(0),
          ),
        },
      },
    };
  };

  render() {
    const { data, count, name, matrixData, time, matrixComponent } = this.props;
    const { total, uniqueId } = data;
    const Matrix = matrixComponent;
    const percentage = (count / total * 100).toFixed(2);

    return (
      <div key={uniqueId} className={cx('row')}>
        <NavLink className={cx('col', 'col-name')} to={this.getLinkParams(uniqueId)}>
          <span>{name}</span>
        </NavLink>
        <div className={cx('col', 'col-count')}>
          <Count count={count} total={total} />
          <Matrix tests={matrixData} id={uniqueId} />
        </div>
        <div className={cx('col', 'col-percents')}>{`${percentage}%`}</div>
        <div className={cx('col', 'col-date')}>
          <AbsRelTime startTime={Array.isArray(time) ? time[time.length - 1] : time} />
        </div>
      </div>
    );
  }
}
