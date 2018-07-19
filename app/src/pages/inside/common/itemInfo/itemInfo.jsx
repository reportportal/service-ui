import { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
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
import { LEVEL_STEP } from 'common/constants/launchLevels';
import { levelSelector } from 'controllers/testItem';
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
    intl: PropTypes.object.isRequired,
    isStepLevel: PropTypes.bool,
  };

  static defaultProps = {
    value: {},
    analyzing: false,
    customProps: {
      onEditLaunch: () => {},
      onShowTestParams: () => {},
    },
    isStepLevel: false,
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
      intl,
      isStepLevel,
    } = this.props;
    return (
      <div ref={refFunction} className={cx('item-info')}>
        <div className={cx('main-info')}>
          <NameLink itemId={value.id} className={cx('name-link')}>
            <span className={cx('name')}>{value.name}</span>
            {value.number && <span className={cx('number')}>#{value.number}</span>}
          </NameLink>
          {analyzing && <div className={cx('analysis-badge')}>Analysis</div>}
          {isStepLevel && (
            <div
              className={cx('test-params-icon')}
              onClick={() => customProps.onShowTestParams(value)}
            >
              {Parser(TestParamsIcon)}
            </div>
          )}
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
