import { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { breadcrumbsSelector, restorePathAction } from 'controllers/testItem';
import { Breadcrumbs, breadcrumbDescriptorShape } from 'components/main/breadcrumbs';
import { GhostButton } from 'components/buttons/ghostButton';
import RefreshIcon from 'common/img/refresh-inline.svg';
import styles from './actionPanel.scss';

const cx = classNames.bind(styles);

@connect(
  (state) => ({
    breadcrumbs: breadcrumbsSelector(state),
  }),
  {
    restorePath: restorePathAction,
  },
)
export class ActionPanel extends Component {
  static propTypes = {
    onRefresh: PropTypes.func,
    breadcrumbs: PropTypes.arrayOf(breadcrumbDescriptorShape),
    restorePath: PropTypes.func,
  };

  static defaultProps = {
    onRefresh: () => {},
    breadcrumbs: [],
    restorePath: () => {},
  };

  render() {
    const { breadcrumbs, onRefresh, restorePath } = this.props;
    return (
      <div className={cx('action-panel')}>
        <Breadcrumbs descriptors={breadcrumbs} onRestorePath={restorePath} />
        <div className={cx('action-button')}>
          <GhostButton icon={RefreshIcon} onClick={onRefresh}>
            <FormattedMessage id="Common.refresh" defaultMessage="Refresh" />
          </GhostButton>
        </div>
      </div>
    );
  }
}
