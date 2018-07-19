import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { PageLayout } from 'layouts/pageLayout';
import { SuiteTestToolbar } from 'pages/inside/common/suiteTestToolbar';
import { parentItemSelector } from 'controllers/testItem';
import { stepsSelector } from 'controllers/step';
import { StepGrid } from './stepGrid';

@connect((state) => ({
  parentItem: parentItemSelector(state),
  data: stepsSelector(state),
}))
export class StepPage extends Component {
  static propTypes = {
    data: PropTypes.arrayOf(PropTypes.object),
    parentItem: PropTypes.object,
  };

  static defaultProps = {
    data: [],
    parentItem: {},
  };

  render() {
    const { parentItem, data } = this.props;
    return (
      <PageLayout>
        <SuiteTestToolbar parentItem={parentItem} />
        <StepGrid data={data} />
      </PageLayout>
    );
  }
}
