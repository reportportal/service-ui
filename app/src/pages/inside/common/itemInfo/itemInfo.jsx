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
import { NameLink } from 'pages/inside/common/nameLink';
import { AttributesBlock } from './attributesBlock';
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
    editDisabled: PropTypes.bool,
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
    editDisabled: false,
    launch: {},
  };

  handleEditItem = () => {
    const { onEditItem, events } = this.props.customProps;
    if (onEditItem) {
      onEditItem(this.props.value);
      this.props.tracking.trackEvent(events.EDIT_ICON_CLICK);
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
      editDisabled,
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
          ) &&
            !editDisabled && (
              <div className={cx('edit-icon')} onClick={this.handleEditItem}>
                {Parser(PencilIcon)}
              </div>
            )}
        </div>

        <div className={cx('additional-info')}>
          {value.startTime && (
            <span className={cx('duration-block')}>
              <DurationBlock
                type={value.type}
                status={value.status}
                itemNumber={value.number}
                timing={{
                  start: value.startTime,
                  end: value.endTime,
                  approxTime: value.approximateDuration,
                }}
              />
            </span>
          )}
          {value.startTime && (
            <div className={cx('mobile-start-time')}>{fromNowFormat(value.startTime)}</div>
          )}
          <div className={cx({ 'owner-tags-block': editDisabled })}>
            {value.owner && <OwnerBlock owner={value.owner} />}
            {value.attributes &&
              !!Object.keys(value.attributes).length && (
                <AttributesBlock attributes={value.attributes} />
              )}
          </div>
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
