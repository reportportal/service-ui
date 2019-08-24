import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { InfoLine, InfoLineListView } from 'pages/inside/common/infoLine';
import {
  listViewLinkSelector,
  logViewLinkSelector,
  LOG_VIEW,
  LIST_VIEW,
  TEST_ITEMS_TYPE_LIST,
} from 'controllers/testItem';
import { userIdSelector } from 'controllers/user';
import { LogViewSwitcher } from './logViewSwitcher';
import styles from './infoPanel.scss';

const cx = classNames.bind(styles);

@connect(
  (state) => ({
    currentUser: userIdSelector(state),
    listViewLink: listViewLinkSelector(state),
    logViewLink: logViewLinkSelector(state),
  }),
  {
    navigate: (linkAction) => linkAction,
  },
)
export class InfoPanel extends Component {
  static propTypes = {
    viewMode: PropTypes.string,
    data: PropTypes.object,
    events: PropTypes.object,
    logViewLink: PropTypes.object,
    listViewLink: PropTypes.object,
    currentFilter: PropTypes.object,
    navigate: PropTypes.func.isRequired,
    testItemParameters: PropTypes.object,
    currentUser: PropTypes.string,
  };

  static defaultProps = {
    events: {},
    viewMode: LIST_VIEW,
    data: {},
    logViewLink: {},
    listViewLink: {},
    currentFilter: null,
    testItemParameters: {},
    currentUser: '',
  };

  onToggleView = (viewMode) => {
    const link = viewMode === LOG_VIEW ? this.props.logViewLink : this.props.listViewLink;
    this.props.navigate(link);
  };

  render() {
    const { viewMode, data, events, testItemParameters, currentFilter, currentUser } = this.props;
    return (
      <div className={cx('info-panel')}>
        {testItemParameters.testItemIds === TEST_ITEMS_TYPE_LIST ? (
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
