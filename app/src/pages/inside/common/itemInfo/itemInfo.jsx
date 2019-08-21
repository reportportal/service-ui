import { Component } from 'react';
import track from 'react-tracking';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages } from 'react-intl';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import { fromNowFormat } from 'common/utils';
import { canEditLaunch } from 'common/utils/permissions';
import { LEVEL_STEP } from 'common/constants/launchLevels';
import { SAUCE_LABS } from 'common/constants/integrationNames';
import {
  activeProjectRoleSelector,
  userAccountRoleSelector,
  userIdSelector,
} from 'controllers/user';
import { levelSelector, launchSelector, formatItemName } from 'controllers/testItem';
import { availableIntegrationsByPluginNameSelector } from 'controllers/plugins';
import { MarkdownViewer } from 'components/main/markdown';
import { LAUNCHES_PAGE_EVENTS } from 'components/main/analytics/events';
import { INTEGRATION_NAMES_TITLES } from 'components/integrations';
import { getSauceLabsConfig } from 'components/integrations/integrationProviders/sauceLabsIntegration/utils';
import { formatMethodType, formatStatus } from 'common/utils/localizationUtils';
import PencilIcon from 'common/img/pencil-icon-inline.svg';
import RetryIcon from 'common/img/retry-inline.svg';
import SauceLabsIcon from 'common/img/plugins/sauce-labs-gray.png';
import { NameLink } from 'pages/inside/common/nameLink';
import { DurationBlock } from 'pages/inside/common/durationBlock';
import { AttributesBlock } from './attributesBlock';
import { OwnerBlock } from './ownerBlock';
import { RetriesCounter } from './retriesCounter';
import styles from './itemInfo.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  retryTooltip: {
    id: 'ItemInfo.RetryTooltip',
    defaultMessage: 'Launch has retries of the test cases',
  },
});

@injectIntl
@connect((state) => ({
  sauceLabsIntegrations: availableIntegrationsByPluginNameSelector(state, SAUCE_LABS),
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
    sauceLabsIntegrations: PropTypes.array.isRequired,
    userAccountRole: PropTypes.string.isRequired,
    userProjectRole: PropTypes.string,
    userId: PropTypes.string,
    value: PropTypes.object,
    refFunction: PropTypes.func,
    customProps: PropTypes.object,
    isStepLevel: PropTypes.bool,
    launch: PropTypes.object,
    editDisabled: PropTypes.bool,
    widgetView: PropTypes.bool,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    onClickRetries: PropTypes.func,
  };

  static defaultProps = {
    value: {},
    customProps: {
      ownLinkParams: {},
      onEditItem: () => {},
      onClickAttribute: () => {},
      onOwnerClick: () => {},
    },
    userId: '',
    userProjectRole: '',
    isStepLevel: false,
    editDisabled: false,
    widgetView: false,
    launch: {},
    onClickRetries: () => {},
    refFunction: null,
  };

  handleEditItem = () => {
    const { onEditItem, events } = this.props.customProps;
    if (onEditItem) {
      onEditItem(this.props.value);
      this.props.tracking.trackEvent(events.EDIT_ICON_CLICK);
    }
  };

  renderSauceLabsLabel = () => {
    const isSauceLabsIntegrationAvailable = !!getSauceLabsConfig(this.props.value.attributes);
    if (isSauceLabsIntegrationAvailable && this.props.sauceLabsIntegrations.length) {
      return (
        <img
          className={cx('sauce-labs-label')}
          src={SauceLabsIcon}
          alt={INTEGRATION_NAMES_TITLES[SAUCE_LABS]}
          title={INTEGRATION_NAMES_TITLES[SAUCE_LABS]}
        />
      );
    }
    return null;
  };

  render() {
    const {
      intl,
      value,
      editDisabled,
      refFunction,
      userProjectRole,
      userAccountRole,
      userId,
      isStepLevel,
      launch: launchFromProps,
      tracking,
      onClickRetries,
      customProps,
    } = this.props;
    const launch = launchFromProps || {}; // launch can be null which is not handled by default props
    const isEditVisible =
      isStepLevel ||
      (canEditLaunch(
        userAccountRole,
        userProjectRole,
        value.owner ? userId === value.owner : userId === launch.owner,
      ) &&
        !editDisabled);

    return (
      <div ref={refFunction} className={cx('item-info')}>
        <div className={cx('main-info')}>
          <NameLink
            itemId={value.id}
            ownLinkParams={customProps.ownLinkParams}
            className={cx('name-link')}
            onClick={() => tracking.trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_ITEM_NAME)}
          >
            <span title={value.name}>{`${formatItemName(value.name)} `}</span>
          </NameLink>
          <span className={cx('edit-number-box')}>
            <NameLink
              itemId={value.id}
              ownLinkParams={customProps.ownLinkParams}
              className={cx('name-link')}
              onClick={() => tracking.trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_ITEM_NAME)}
            >
              {value.number && <span className={cx('number')}>#{value.number}</span>}
            </NameLink>
            {value.autoAnalyzing && (
              <div className={cx('item-badge', 'auto-analysis')}>Auto-analysis</div>
            )}
            {value.patternAnalyzing && (
              <div className={cx('item-badge', 'pattern-analysis')}>Pattern-analysis</div>
            )}
            {value.rerun && <div className={cx('item-badge', 'rerun')}>Rerun</div>}
            {isEditVisible && (
              <span className={cx('edit-icon')} onClick={this.handleEditItem}>
                {Parser(PencilIcon)}
              </span>
            )}
          </span>
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
          {value.hasRetries && (
            <div className={cx('retry-icon')} title={intl.formatMessage(messages.retryTooltip)}>
              {Parser(RetryIcon)}
            </div>
          )}
          {value.owner && <OwnerBlock owner={value.owner} onClick={customProps.onOwnerClick} />}
          {isStepLevel && this.renderSauceLabsLabel()}
          {value.attributes &&
            !!value.attributes.length && (
              <AttributesBlock
                attributes={value.attributes}
                onClickAttribute={customProps.onClickAttribute}
                isAttributeClickable
              />
            )}
          {isStepLevel && (
            <div className={cx('mobile-info')}>
              @{formatMethodType(intl.formatMessage, value.type)}
              <span className={cx('mobile-status')}>
                {formatStatus(intl.formatMessage, value.status)}
              </span>
            </div>
          )}
          {isStepLevel &&
            value.retries &&
            value.retries.length > 0 && (
              <div className={cx('retries-counter')}>
                <RetriesCounter testItem={value} onLabelClick={onClickRetries} />
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
