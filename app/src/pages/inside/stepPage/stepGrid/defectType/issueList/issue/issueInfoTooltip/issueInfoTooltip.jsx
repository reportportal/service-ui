import { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { URLS } from 'common/urls';
import { fetch, ERROR_CANCELED } from 'common/utils/fetch';
import InProgressGif from 'common/img/item-in-progress.gif';
import { activeProjectSelector } from 'controllers/user';
import styles from './issueInfoTooltip.scss';

const cx = classNames.bind(styles);

const STATUS_RESOLVED = 'RESOLVED';

const isResolved = (status) => status.toUpperCase() === STATUS_RESOLVED;

@connect((state) => ({
  activeProject: activeProjectSelector(state),
}))
export class IssueInfoTooltip extends Component {
  static propTypes = {
    activeProject: PropTypes.string.isRequired,
    ticketId: PropTypes.string.isRequired,
    btsProject: PropTypes.string.isRequired,
    btsUrl: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.cancelRequest = () => {};
  }

  state = {
    issue: null,
    loading: false,
    error: false,
  };

  componentDidMount() {
    this.fetchData();
  }

  componentWillUnmount() {
    this.cancelRequest();
  }

  fetchData = () => {
    const { activeProject, ticketId, btsProject, btsUrl } = this.props;
    const cancelRequestFunc = (cancel) => {
      this.cancelRequest = cancel;
    };
    this.setState({ loading: true });
    fetch(URLS.externalSystemIssue(activeProject, ticketId, btsProject, btsUrl), {
      abort: cancelRequestFunc,
    })
      .then((issue) => this.setState({ loading: false, issue }))
      .catch((err) => {
        if (err.message === ERROR_CANCELED) {
          return;
        }
        this.setState({ loading: false, error: true });
      });
  };

  render() {
    const { loading, issue } = this.state;
    return (
      <div className={cx('issue-tooltip')}>
        {loading && (
          <div className={cx('progressbar')}>
            <img src={InProgressGif} alt="Loading" />
          </div>
        )}
        {!loading &&
          issue && (
            <Fragment>
              <div className={cx('header')}>Summary:</div>
              <div className={cx('content')}>{issue.summary}</div>
              <div className={cx('header')}>Status:</div>
              <div
                className={cx('content', {
                  resolved: isResolved(issue.status),
                })}
              >
                {issue.status}
              </div>
            </Fragment>
          )}
      </div>
    );
  }
}
