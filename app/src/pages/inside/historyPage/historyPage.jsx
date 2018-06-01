import React, { Component } from 'react';
import { PageLayout, PageSection } from 'layouts/pageLayout';
import PropTypes from 'prop-types';
import { resetFetchHistory } from 'controllers/itemsHistory';
import { parentItemSelector } from 'controllers/testItem';
import { connect } from 'react-redux';
import { HistoryToolbar } from './historyToolbar';
import { HistoryView } from './historyView';

@connect(
  (state) => ({
    parentItem: parentItemSelector(state),
  }),
  {
    resetFetchHistory,
  },
)
export class HistoryPage extends Component {
  static propTypes = {
    resetFetchHistory: PropTypes.func.isRequired,
    parentItem: PropTypes.object,
  };

  static defaultProps = {
    parentItem: null,
  };

  render() {
    return (
      <PageLayout>
        <PageSection>
          <HistoryToolbar
            onRefresh={this.props.resetFetchHistory}
            parentItem={this.props.parentItem}
          />
          <HistoryView />
        </PageSection>
      </PageLayout>
    );
  }
}
