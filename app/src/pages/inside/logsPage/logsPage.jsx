import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { PageLayout, PageSection } from 'layouts/pageLayout';
import { activeLogSelector, refreshLogPageData } from 'controllers/log';
import { LogToolbar } from './logToolbar';
import { HistoryLine } from './historyLine';
import { LogItemInfo } from './logItemInfo';

@connect(
  (state) => ({
    activeLogItem: activeLogSelector(state),
  }),
  {
    refresh: refreshLogPageData,
  },
)
export class LogsPage extends Component {
  static propTypes = {
    refresh: PropTypes.func.isRequired,
    activeLogItem: PropTypes.object,
  };

  static defaultProps = {
    activeLogItem: null,
  };

  render() {
    const { refresh, activeLogItem } = this.props;

    return (
      <PageLayout>
        <PageSection>
          <LogToolbar onRefresh={refresh} />
          <HistoryLine />
          {activeLogItem && <LogItemInfo logItem={activeLogItem} />}
        </PageSection>
      </PageLayout>
    );
  }
}
