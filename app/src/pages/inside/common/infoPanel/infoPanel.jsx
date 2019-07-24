import { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { InfoLine } from 'pages/inside/common/infoLine';
import {
  listViewLinkSelector,
  logViewLinkSelector,
  LOG_VIEW,
  LIST_VIEW,
} from 'controllers/testItem';
import { LogViewSwitcher } from './logViewSwitcher';
import styles from './infoPanel.scss';

const cx = classNames.bind(styles);

@connect(
  (state) => ({
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
    navigate: PropTypes.func.isRequired,
  };

  static defaultProps = {
    events: {},
    viewMode: LIST_VIEW,
    data: {},
    logViewLink: {},
    listViewLink: {},
  };

  onToggleView = (viewMode) => {
    const link = viewMode === LOG_VIEW ? this.props.logViewLink : this.props.listViewLink;
    this.props.navigate(link);
  };

  render() {
    const { viewMode, data, events } = this.props;
    return (
      <div className={cx('info-panel')}>
        <LogViewSwitcher viewMode={viewMode} onToggleView={this.onToggleView} />
        <InfoLine data={data} events={events} />
      </div>
    );
  }
}
