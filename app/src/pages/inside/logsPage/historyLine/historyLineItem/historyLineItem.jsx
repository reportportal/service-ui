import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import { filterIdSelector, projectIdSelector } from 'controllers/pages';
import { MANY, NOT_FOUND } from 'common/constants/launchStatuses';
import { HistoryLineItemContent } from './historyLineItemContent';
import styles from './historyLineItem.scss';

const cx = classNames.bind(styles);

@connect((state) => ({
  projectId: projectIdSelector(state),
  filterId: filterIdSelector(state),
}))
@injectIntl
export class HistoryLineItem extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    projectId: PropTypes.string.isRequired,
    filterId: PropTypes.string.isRequired,
    launchNumber: PropTypes.string.isRequired,
    pathNames: PropTypes.object,
    launchId: PropTypes.string,
    id: PropTypes.string,
    status: PropTypes.string,
    active: PropTypes.bool,
    isFirstItem: PropTypes.bool,
    isLastItem: PropTypes.bool,
  };

  static defaultProps = {
    pathNames: {},
    launchId: '',
    id: '',
    status: '',
    active: false,
    isFirstItem: false,
    isLastItem: false,
  };

  checkIfTheLinkIsActive = () => {
    const { status, isLastItem } = this.props;

    return !(status === NOT_FOUND.toUpperCase() || status === MANY.toUpperCase() || isLastItem);
  };

  createHistoryLineItemLink = () => {
    const { projectId, filterId, launchId, pathNames, id } = this.props;
    const parentIds = Object.keys(pathNames);

    return `#${projectId}/launches/${filterId}/${launchId}/${parentIds.join('/')}/${id}`;
  };

  render() {
    const { launchNumber, active, ...rest } = this.props;

    return (
      <div className={cx('history-line-item', { active })}>
        <a
          className={cx('history-line-item-title', {
            'active-link': this.checkIfTheLinkIsActive(),
          })}
          href={this.checkIfTheLinkIsActive() ? this.createHistoryLineItemLink() : ''}
        >
          <span className={cx('launch-title')}>{'launch '}</span>
          <span>#{launchNumber}</span>
        </a>
        <HistoryLineItemContent
          active={active}
          launchNumber={launchNumber}
          hasChilds={rest.has_childs}
          {...rest}
        />
      </div>
    );
  }
}
