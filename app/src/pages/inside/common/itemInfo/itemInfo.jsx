import { Component } from 'react';
import track from 'react-tracking';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import { LAUNCHES_PAGE_EVENTS } from 'components/main/analytics/events';
import { fromNowFormat } from 'common/utils';
import { canEditLaunch } from 'common/utils/permissions';
import { MarkdownViewer } from 'components/main/markdown';
import {
  activeProjectRoleSelector,
  userAccountRoleSelector,
  userIdSelector,
} from 'controllers/user';
import { LEVEL_STEP } from 'common/constants/launchLevels';
import { levelSelector, launchSelector } from 'controllers/testItem';
import { formatMethodType, formatStatus } from 'common/utils/localizationUtils';
import TestParamsIcon from 'common/img/test-params-icon-inline.svg';
import PencilIcon from 'common/img/pencil-icon-inline.svg';
import { NameLink } from './nameLink';
import { TagsBlock } from './tagsBlock';
import { OwnerBlock } from './ownerBlock';
import { DurationBlock } from './durationBlock';
import styles from './itemInfo.scss';

const cx = classNames.bind(styles);

@injectIntl
@connect((state) => ({
  userAccountRole: userAccountRoleSelector(state),
  userProjectRole: activeProjectRoleSelector(state),
  userId: userIdSelector(state),
  isStepLevel: levelSelector(state) === LEVEL_STEP,
  launch: launchSelector(state),
}))
@track()
export class ItemInfo extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    value: PropTypes.object,
    refFunction: PropTypes.func.isRequired,
    analyzing: PropTypes.bool,
    customProps: PropTypes.object,
    userAccountRole: PropTypes.string.isRequired,
    userProjectRole: PropTypes.string,
    userId: PropTypes.string,
    isStepLevel: PropTypes.bool,
    launch: PropTypes.object,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    value: {},
    analyzing: false,
    customProps: {
      onEditItem: () => {},
      onShowTestParams: () => {},
    },
    userId: '',
    userProjectRole: '',
    isStepLevel: false,
    launch: {},
  };

  handleEditItem = () => {
    const { onEditItem } = this.props.customProps;
    if (onEditItem) {
      onEditItem(this.props.value);
      this.props.tracking.trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_EDIT_ICON_AFTER_LAUNCH_NAME);
    }
  };

  handleShowTestParams = () => {
    const { onShowTestParams } = this.props.customProps;
    if (onShowTestParams) {
      onShowTestParams(this.props.value);
    }
  };

  render() {
    const {
      intl,
      value,
      refFunction,
      analyzing,
      userProjectRole,
      userAccountRole,
      userId,
      isStepLevel,
      launch,
      tracking,
    } = this.props;

    return (
      <div ref={refFunction} className={cx('item-info')}>
        <div className={cx('main-info')}>
          <NameLink
            itemId={value.id}
            className={cx('name-link')}
            onClick={() => tracking.trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_ITEM_NAME)}
          >
            <span className={cx('name')}>{value.name}</span>
            {value.number && <span className={cx('number')}>#{value.number}</span>}
          </NameLink>
          {analyzing && <div className={cx('analysis-badge')}>Analysis</div>}
          {isStepLevel && (
            <div className={cx('test-params-icon')} onClick={this.handleShowTestParams}>
              {Parser(TestParamsIcon)}
            </div>
          )}
          {canEditLaunch(
            userAccountRole,
            userProjectRole,
            value.owner ? userId === value.owner : userId === launch.owner,
          ) && (
            <div className={cx('edit-icon')} onClick={this.handleEditItem}>
              {Parser(PencilIcon)}
            </div>
          )}
        </div>

        <div className={cx('additional-info')}>
          <span className={cx('duration-block')}>
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
          </span>
          <div className={cx('mobile-start-time')}>{fromNowFormat(value.start_time)}</div>
          {value.owner && <OwnerBlock owner={value.owner} />}
          {value.tags && !!value.tags.length && <TagsBlock tags={value.tags} />}
          {isStepLevel && (
            <div className={cx('mobile-info')}>
              @{formatMethodType(intl.formatMessage, value.type)}
              <span className={cx('mobile-status')}>
                {formatStatus(intl.formatMessage, value.status)}
              </span>
            </div>
          )}
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
