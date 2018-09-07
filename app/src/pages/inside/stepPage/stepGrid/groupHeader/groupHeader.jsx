import { Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import Link from 'redux-first-router-link';
import { TEST_ITEM_PAGE, launchIdSelector } from 'controllers/pages';
import { activeProjectSelector } from 'controllers/user';
import styles from './groupHeader.scss';

const cx = classNames.bind(styles);

const createLink = (projectId, filterId, launchId, testItemIds) => ({
  type: TEST_ITEM_PAGE,
  payload: {
    projectId,
    filterId: 'all',
    testItemIds: [launchId, ...testItemIds].join('/'),
  },
});

export const GroupHeader = connect((state) => ({
  activeProject: activeProjectSelector(state),
  launchId: launchIdSelector(state),
}))(({ data, activeProject, launchId }) => (
  <div className={cx('group-header-row')}>
    <div className={cx('group-header-content')}>
      {Object.keys(data[0].path_names || {}).map((key, i, array) => (
        <Fragment key={key}>
          <Link
            className={cx('link')}
            to={createLink(activeProject, 'all', launchId, array.slice(0, i + 1))}
          >
            {data[0].path_names[key]}
          </Link>
          {i < array.length - 1 && <span className={cx('separator')}> / </span>}
        </Fragment>
      ))}
    </div>
  </div>
));
GroupHeader.propTypes = {
  data: PropTypes.array,
};
GroupHeader.defaultProps = {
  data: [],
};
