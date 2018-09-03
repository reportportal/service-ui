import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { PageLayout, PageSection } from 'layouts/pageLayout';
import { refreshLogPageData } from 'controllers/log';
import { LogToolbar } from './logToolbar';
import { HistoryLine } from './historyLine';

@connect(null, {
  refresh: refreshLogPageData,
})
export class LogsPage extends Component {
  static propTypes = {
    refresh: PropTypes.func.isRequired,
  };

  render() {
    const { refresh } = this.props;
    return (
      <PageLayout>
        <PageSection>
          <LogToolbar onRefresh={refresh} />
          <HistoryLine />
        </PageSection>
      </PageLayout>
    );
  }
}
