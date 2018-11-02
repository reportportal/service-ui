import React, { Component } from 'react';
import { PageLayout, PageSection } from 'layouts/pageLayout';
import PropTypes from 'prop-types';
import { refreshHistory } from 'controllers/itemsHistory';
import { parentItemSelector } from 'controllers/testItem';
import { connect } from 'react-redux';
import { HistoryToolbar } from './historyToolbar';
import { HistoryView } from './historyView';

@connect(
  (state) => ({
    parentItem: parentItemSelector(state),
  }),
  {
    refreshHistory,
  },
)
export class HistoryPage extends Component {
  static propTypes = {
    refreshHistory: PropTypes.func.isRequired,
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
            onRefresh={this.props.refreshHistory}
            parentItem={this.props.parentItem}
          />
          <HistoryView refreshHistory={this.props.refreshHistory} />
        </PageSection>
      </PageLayout>
    );
  }
}
