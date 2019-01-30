import * as React from 'react';
import PropTypes from 'prop-types';
import { TestsTableWidget } from '../components/testsTableWidget';
import * as cfg from './mostFailedTestsCfg';

export class MostFailedTests extends React.Component {
  static propTypes = {
    widget: PropTypes.object.isRequired,
  };

  getIssueTypeMessage = (issueType) => {
    const type = issueType.split('$')[2];
    return cfg.issueTypes[type];
  };

  render() {
    const {
      widget: {
        content,
        contentParameters: { contentFields },
      },
    } = this.props;

    const issueType = contentFields[0];

    return (
      <TestsTableWidget
        tests={content.result}
        launch={content.latestLaunch}
        issueType={this.getIssueTypeMessage(issueType)}
        columns={cfg.columns}
      />
    );
  }
}
