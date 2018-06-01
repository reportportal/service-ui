import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import Parser from 'html-react-parser';
import { DefectBadge } from './defectBadge/defectBadge';
import { MessageBadge } from './messageBadge/messageBadge';
import styles from './historyItem.scss';
import NoItemIcon from './img/noItem-inline.svg';
import EmptyItemIcon from './img/emptyItem-inline.svg';
import NotEyeIcon from './img/notEyeItem-inline.svg';
import CommentIcon from './img/comment-inline.svg';
import TagIcon from './img/tag-inline.svg';

const cx = classNames.bind(styles);

const messages = defineMessages({
  emptyItemCaption: {
    id: 'HistoryItem.emptyItemCaption',
    defaultMessage: 'Item is empty',
  },
  noItemCaption: {
    id: 'HistoryItem.noItemCaption',
    defaultMessage: 'No item<br/>in launch',
  },
  sameItemsCaption: {
    id: 'HistoryItem.sameItemsCaption',
    defaultMessage: "There're several items with the same UID meaning.",
  },
});

const defectsTitleMap = {
  automation_bug: 'ab',
  no_defect: 'nd',
  product_bug: 'pb',
  system_issue: 'si',
  to_investigate: 'ti',
};

@injectIntl
export class HistoryItem extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    status: PropTypes.string,
    issue: PropTypes.object,
    defects: PropTypes.object,
  };

  static defaultProps = {
    status: '',
    issue: {},
    defects: {},
  };

  mapDefectsToBadges = () => {
    const { defects } = this.props;

    const keys = Object.keys(defects);
    return keys.map((key) => {
      let badge = '';
      if (defects[key].total) {
        badge = (
          <div key={key}>
            <DefectBadge type={key} defectTitle={defectsTitleMap[key]} data={defects[key]} />
          </div>
        );
      }
      return badge;
    });
  };

  render() {
    const { intl, status, issue } = this.props;

    const badges = this.mapDefectsToBadges();

    return (
      <div className={cx('history-item-wrapper', `history-item-status-${status}`)}>
        {status === ('FAILED' || 'SKIPPED') && badges}
        {issue.comment && (
          <div>
            <MessageBadge data={[{ ticketId: issue.comment }]} icon={CommentIcon} />
          </div>
        )}
        {issue.externalSystemIssues && (
          <div>
            <MessageBadge data={issue.externalSystemIssues} icon={TagIcon} />
          </div>
        )}
        <div className={cx('item-text-content')}>
          {status === 'RESETED' && (
            <React.Fragment>
              <i className={cx('icon')}>{Parser(EmptyItemIcon)}</i>
              <span>{intl.formatMessage(messages.emptyItemCaption)}</span>
            </React.Fragment>
          )}
          {status === 'NOT_FOUND' && (
            <React.Fragment>
              <i className={cx('icon', 'no-item-icon')}>{Parser(NoItemIcon)}</i>
              <span>{Parser(intl.formatMessage(messages.noItemCaption))}</span>
            </React.Fragment>
          )}
          {status === 'MANY' && (
            <div>
              <MessageBadge
                data={[{ ticketId: intl.formatMessage(messages.sameItemsCaption) }]}
                icon={NotEyeIcon}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
}
