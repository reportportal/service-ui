import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { LEVEL_SUITE, LEVEL_TEST } from 'common/constants/launchLevels';
import { levelSelector, loadingSelector } from 'controllers/testItem';
import { SuitesPage } from 'pages/inside/suitesPage';
import { TestsPage } from 'pages/inside/testsPage';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';

const testItemPages = {
  [LEVEL_SUITE]: SuitesPage,
  [LEVEL_TEST]: TestsPage,
};

@connect((state) => ({
  level: levelSelector(state),
  loading: loadingSelector(state),
}))
export class TestItemPage extends Component {
  static propTypes = {
    level: PropTypes.string,
    loading: PropTypes.bool,
  };

  static defaultProps = {
    level: null,
    loading: false,
  };

  render() {
    const { level, loading } = this.props;
    if (loading) {
      return <SpinningPreloader />;
    }
    const PageComponent = testItemPages[level] || SpinningPreloader;
    return <PageComponent />;
  }
}
