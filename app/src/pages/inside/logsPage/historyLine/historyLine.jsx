import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { activeProjectSelector } from 'controllers/user';
import classNames from 'classnames/bind';
import { historyItemsSelector, activeLogIdSelector, NAMESPACE } from 'controllers/log';
import { MANY, NOT_FOUND } from 'common/constants/launchStatuses';
import { connectRouter } from 'common/utils';
import { HistoryLineItem } from './historyLineItem';
import styles from './historyLine.scss';

const cx = classNames.bind(styles);

@connectRouter(
  undefined,
  {
    changeActiveItem: (itemId) => ({ history: itemId }),
  },
  { namespace: NAMESPACE },
)
@connect((state) => ({
  projectId: activeProjectSelector(state),
  historyItems: historyItemsSelector(state),
  activeItemId: activeLogIdSelector(state),
}))
export class HistoryLine extends Component {
  static propTypes = {
    projectId: PropTypes.string,
    historyItems: PropTypes.array,
    activeItemId: PropTypes.string,
    changeActiveItem: PropTypes.func,
  };

  static defaultProps = {
    projectId: '',
    historyItems: [],
    activeItemId: '',
    changeActiveItem: () => {},
  };

  checkIfTheItemLinkIsActive = (item) =>
    item.id !== this.props.activeItemId &&
    (item.status.toLowerCase() !== MANY && item.status.toLowerCase() !== NOT_FOUND);

  render() {
    return (
      <div className={cx('history-line')}>
        {this.props.historyItems &&
          this.props.historyItems.map((item, index) => (
            <HistoryLineItem
              key={item.launchNumber}
              active={item.id === this.props.activeItemId}
              isFirstItem={index === 0}
              isLastItem={index === this.props.historyItems.length - 1}
              onClick={() =>
                this.checkIfTheItemLinkIsActive(item) ? this.props.changeActiveItem(item.id) : {}
              }
              pathNames={item.path_names}
              projectId={this.props.projectId}
              {...item}
            />
          ))}
      </div>
    );
  }
}
