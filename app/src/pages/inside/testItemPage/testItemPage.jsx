import { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { PageLayout } from 'layouts/pageLayout';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { Breadcrumbs } from 'components/main/breadcrumbs';
import { LEVEL_SUITE, LEVEL_TEST } from 'common/constants/launchLevels';
import { levelSelector, pageLoadingSelector, breadcrumbsSelector } from 'controllers/testItem';
import { SuitesPage } from 'pages/inside/suitesPage';
import { TestsPage } from 'pages/inside/testsPage';

import styles from './testItemPage.scss';

const cx = classNames.bind(styles);

const testItemPages = {
  [LEVEL_SUITE]: SuitesPage,
  [LEVEL_TEST]: TestsPage,
};

@connect((state) => ({
  level: levelSelector(state),
  loading: pageLoadingSelector(state),
  breadcrumbs: breadcrumbsSelector(state),
}))
export class TestItemPage extends Component {
  static propTypes = {
    level: PropTypes.string,
    loading: PropTypes.bool,
    breadcrumbs: PropTypes.arrayOf(PropTypes.object),
  };

  static defaultProps = {
    level: null,
    loading: false,
    breadcrumbs: [],
  };

  render() {
    const { level, loading, breadcrumbs } = this.props;
    if (!loading && testItemPages[level]) {
      const PageComponent = testItemPages[level];
      return <PageComponent />;
    }
    return (
      <PageLayout>
        <div className={cx('breadcrumbs-container')}>
          {!loading && <Breadcrumbs descriptors={breadcrumbs} />}
        </div>
        {loading && <SpinningPreloader />}
      </PageLayout>
    );
  }
}
