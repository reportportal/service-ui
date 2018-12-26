import * as React from 'react';
import PropTypes from 'prop-types';
import { TestsTableWidget } from '../components/testsTableWidget';
import * as cfg from './mostFailedTestsCfg';

class MostFailedTests extends React.Component {
  static propTypes = {
    widget: PropTypes.object.isRequired,
    nameClickHandler: PropTypes.func,
  };

  static defaultProps = {
    nameClickHandler: () => {},
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
      nameClickHandler,
    } = this.props;

    const issueType = contentFields[0];

    return (
      <TestsTableWidget
        tests={content.mostFailed}
        launchName={content.latestLaunch.name}
        nameClickHandler={nameClickHandler}
        issueType={this.getIssueTypeMessage(issueType)}
        columns={cfg.columns}
      />
    );
  }
}

export { MostFailedTests };
