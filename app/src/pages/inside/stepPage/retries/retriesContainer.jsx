import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils/fetch';
import { ERROR } from 'common/constants/logLevels';
import { activeProjectSelector } from 'controllers/user';
import { Retries } from './retries';

@connect((state) => ({
  activeProject: activeProjectSelector(state),
}))
export class RetriesContainer extends Component {
  static propTypes = {
    testItemId: PropTypes.number.isRequired,
    activeProject: PropTypes.string,
    retries: PropTypes.arrayOf(PropTypes.object).isRequired,
  };

  static defaultProps = {
    activeProject: '',
    retries: [],
  };

  state = {
    logItem: null,
    selectedIndex: 0,
    loading: false,
  };

  componentDidMount() {
    const { retries } = this.props;
    this.fetchLog(retries[this.state.selectedIndex].id);
  }

  fetchLog = (itemId) => {
    this.setState({ loading: true });
    fetch(URLS.logItem(this.props.activeProject, itemId, ERROR))
      .then((result) =>
        this.setState({
          logItem: result.content[0],
          loading: false,
        }),
      )
      .catch(() => this.setState({ loading: false }));
  };

  handleRetrySelect = (retry) => {
    this.setState({
      selectedIndex: this.props.retries.findIndex((item) => item.id === retry.id),
    });
    this.fetchLog(retry.id);
  };

  render() {
    const { logItem, selectedIndex, loading } = this.state;
    const { testItemId, retries } = this.props;
    if (!retries.length) {
      return null;
    }
    const selectedRetryId = retries[selectedIndex].id;
    return (
      <Retries
        retries={retries}
        testItemId={testItemId}
        selectedId={selectedRetryId}
        logItem={logItem}
        selectedIndex={selectedIndex}
        loading={loading}
        onRetrySelect={this.handleRetrySelect}
      />
    );
  }
}
