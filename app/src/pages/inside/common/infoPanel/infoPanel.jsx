import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import track from 'react-tracking';
import { InfoLine, InfoLineListView } from 'pages/inside/common/infoLine';
import {
  listViewLinkSelector,
  logViewLinkSelector,
  isTestItemsListSelector,
  LOG_VIEW,
  LIST_VIEW,
} from 'controllers/testItem';
import { activeFilterSelector } from 'controllers/filter';
import { userIdSelector } from 'controllers/user';
import { LogViewSwitcher } from './logViewSwitcher';
import styles from './infoPanel.scss';

const cx = classNames.bind(styles);

@connect(
  (state) => ({
    currentUser: userIdSelector(state),
    listViewLink: listViewLinkSelector(state),
    logViewLink: logViewLinkSelector(state),
    currentFilter: activeFilterSelector(state),
    isTestItemsList: isTestItemsListSelector(state),
  }),
  {
    navigate: (linkAction) => linkAction,
  },
)
@track()
export class InfoPanel extends Component {
  static propTypes = {
    viewMode: PropTypes.string,
    data: PropTypes.object,
    events: PropTypes.object,
    logViewLink: PropTypes.object,
    listViewLink: PropTypes.object,
    currentFilter: PropTypes.object,
    navigate: PropTypes.func.isRequired,
    currentUser: PropTypes.string,
    isTestItemsList: PropTypes.bool.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    events: {},
    viewMode: LIST_VIEW,
    data: {},
    logViewLink: {},
    listViewLink: {},
    currentFilter: null,
    currentUser: '',
  };

  onToggleView = (viewMode) => {
    let link;
    if (viewMode === LOG_VIEW) {
      const { logViewLink, tracking, events } = this.props;
      tracking.trackEvent(events.LOG_VIEW_SWITCHER);
      link = logViewLink;
    } else {
      link = this.props.listViewLink;
    }
    this.props.navigate(link);
  };

  render() {
    const { viewMode, data, events, currentFilter, currentUser, isTestItemsList } = this.props;

    return (
      <div className={cx('info-panel')}>
        {isTestItemsList ? (
          <InfoLineListView data={currentFilter} currentUser={currentUser} />
        ) : (
          <Fragment>
            <LogViewSwitcher viewMode={viewMode} onToggleView={this.onToggleView} />
            <InfoLine data={data} events={events} />
          </Fragment>
        )}
      </div>
    );
  }
}
