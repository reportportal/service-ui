import React, { Fragment, Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { GhostButton } from 'components/buttons/ghostButton';
import AddDashboardIcon from 'common/img/add-widget-inline.svg';
import styles from './emptyWidgetGrid.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  addNewWidget: {
    id: 'DashboardItemPage.addNewWidget',
    defaultMessage: 'Add new widget',
  },
  dashboardEmptyText: {
    id: 'DashboardItemPage.dashboardEmptyText',
    defaultMessage: 'Add your first widget to analyse statistics',
  },
  notMyDashboardEmptyHeader: {
    id: 'DashboardItemPage.notMyDashboardEmptyHeader',
    defaultMessage: 'You have no widgets on this dashboard',
  },
});

@injectIntl
export class EmptyWidgetGrid extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    action: PropTypes.func,
    isDisable: PropTypes.bool,
  };

  static defaultProps = {
    action: () => {},
    isDisable: false,
  };

  render() {
    const { action, intl, isDisable } = this.props;

    return (
      <div className={cx('empty-widget')}>
        <div className={cx('empty-widget-img')} />
        <p className={cx('empty-widget-headline')}>
          {intl.formatMessage(messages.notMyDashboardEmptyHeader)}
        </p>
        {!isDisable && (
          <Fragment>
            <p className={cx('empty-widget-text')}>
              {intl.formatMessage(messages.dashboardEmptyText)}
            </p>
            <div className={cx('empty-widget-content')}>
              <GhostButton icon={AddDashboardIcon} onClick={action}>
                {intl.formatMessage(messages.addNewWidget)}
              </GhostButton>
            </div>
          </Fragment>
        )}
      </div>
    );
  }
}
