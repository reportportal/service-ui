import { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import { fromNowFormat } from 'common/utils';
import { canEditLaunch } from 'common/utils/permissions';
import { MarkdownViewer } from 'components/main/markdown';
import {
  activeProjectRoleSelector,
  userAccountRoleSelector,
  userIdSelector,
} from 'controllers/user';
import { TagsBlock } from './tagsBlock';
import { OwnerBlock } from './ownerBlock';
import { DurationBlock } from './durationBlock';
import PencilIcon from './img/pencil-icon-inline.svg';
import styles from './itemInfo.scss';

const cx = classNames.bind(styles);

@connect((state) => ({
  userAccountRole: userAccountRoleSelector(state),
  userProjectRole: activeProjectRoleSelector(state),
  userId: userIdSelector(state),
}))
export class ItemInfo extends Component {
  static propTypes = {
    value: PropTypes.object,
    refFunction: PropTypes.func.isRequired,
    analyzing: PropTypes.bool,
    customProps: PropTypes.object,
    userAccountRole: PropTypes.string.isRequired,
    userProjectRole: PropTypes.string.isRequired,
    userId: PropTypes.string.isRequired,
  };

  static defaultProps = {
    value: {},
    analyzing: false,
    customProps: {},
  };

  render() {
    const {
      value,
      refFunction,
      analyzing,
      customProps,
      userProjectRole,
      userAccountRole,
      userId,
    } = this.props;
    return (
      <div ref={refFunction} className={cx('item-info')}>
        <div className={cx('main-info')}>
          <a href="/" className={cx('name-link')}>
            <span className={cx('name')}>{value.name}</span>
            <span className={cx('number')}>#{value.number}</span>
          </a>
          {analyzing && <div className={cx('analysis-badge')}>Analysis</div>}
          {canEditLaunch(userAccountRole, userProjectRole, userId === value.owner) && (
            <div className={cx('edit-icon')} onClick={() => customProps.onEditLaunch(value)}>
              {Parser(PencilIcon)}
            </div>
          )}
        </div>

        <div className={cx('additional-info')}>
          <DurationBlock
            type={value.type}
            status={value.status}
            itemNumber={value.number}
            timing={{
              start: value.start_time,
              end: value.end_time,
              approxTime: value.approximateDuration,
            }}
          />
          <div className={cx('mobile-start-time')}>{fromNowFormat(value.start_time)}</div>
          {value.owner &&<OwnerBlock owner={value.owner} />}
          {value.tags && !!value.tags.length && <TagsBlock tags={value.tags} />}
          {value.description && (
            <div className={cx('item-description')}>
              <MarkdownViewer value={value.description} />
            </div>
          )}
        </div>
      </div>
    );
  }
}
