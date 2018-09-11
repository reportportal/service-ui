import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { PageLayout, PageSection } from 'layouts/pageLayout';
import { activeLogIdSelector, historyItemsSelector, refreshLogPageData } from 'controllers/log';
import { LogToolbar } from './logToolbar';
import { HistoryLine } from './historyLine';
import { LogItemInfo } from './logItemInfo';

@connect(
  (state) => ({
    activeItemId: activeLogIdSelector(state),
    historyItems: historyItemsSelector(state),
  }),
  {
    refresh: refreshLogPageData,
  },
)
export class LogsPage extends Component {
  static propTypes = {
    refresh: PropTypes.func.isRequired,
    activeItemId: PropTypes.string,
    historyItems: PropTypes.array,
  };

  static defaultProps = {
    activeItemId: '',
    historyItems: [],
  };

  render() {
    const { refresh, activeItemId, historyItems } = this.props;
    const activeLogItem = historyItems.find((historyItem) => historyItem.id === activeItemId);

    return (
      <PageLayout>
        <PageSection>
          <LogToolbar onRefresh={refresh} />
          <HistoryLine />
          <LogItemInfo logItem={activeLogItem} />
        </PageSection>
      </PageLayout>
    );
  }
}
