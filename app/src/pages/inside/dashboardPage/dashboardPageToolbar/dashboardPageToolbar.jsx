import React, { Component } from 'react';
import track from 'react-tracking';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import PropTypes from 'prop-types';
import { GhostButton } from 'components/buttons/ghostButton';
import GridViewDashboardIcon from 'common/img/grid-inline.svg';
import TableViewDashboardIcon from 'common/img/table-inline.svg';
import { reduxForm } from 'redux-form';
import { InputSearch } from 'components/inputs/inputSearch';
import { FieldProvider } from 'components/fields/fieldProvider';
import { DASHBOARD_PAGE_EVENTS } from 'components/main/analytics/events';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import styles from './dashboardPageToolbar.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  searchPlaceholder: {
    id: 'DashboardPageToolbar.searchPlaceholder',
    defaultMessage: 'Search by name',
  },
});

@reduxForm({
  form: 'searchDashboardForm',
  validate: ({ dashboardName }) => ({
    dashboardName: dashboardName && dashboardName.length < 3 && 'dashboardNameSearchHint',
  }),
  onChange: (values, dispatch, props, previousValues) => {
    if (typeof previousValues.dashboardName === 'undefined') {
      return;
    }
    if (!values.dashboardName || values.dashboardName.length >= 3) {
      props.onFilterChange(values.dashboardName);
    }
  },
})
@injectIntl
@track()
export class DashboardPageToolbar extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    dashboardItems: PropTypes.array,
    change: PropTypes.func,
    filter: PropTypes.string,
    onGridViewToggle: PropTypes.func,
    onTableViewToggle: PropTypes.func,
    gridType: PropTypes.string,
    invalid: PropTypes.bool,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };
  static defaultProps = {
    dashboardItems: [],
    change: () => {},
    filter: '',
    onGridViewToggle: () => {},
    onTableViewToggle: () => {},
    gridType: '',
    invalid: false,
  };

  componentDidMount() {
    this.props.change('dashboardName', this.props.filter);
  }

  componentWillReceiveProps({ filter, invalid }) {
    if (filter !== this.props.filter && !invalid) {
      this.props.change('dashboardName', filter);
    }
  }

  render() {
    const {
      onGridViewToggle,
      onTableViewToggle,
      gridType,
      intl,
      dashboardItems,
      filter,
    } = this.props;

    return (
      <div className={cx('tool-bar')}>
        <div className={cx('input')}>
          <FieldProvider
            name="dashboardName"
            onChange={(val) => {
              val.length >= 3 &&
                this.props.tracking.trackEvent(DASHBOARD_PAGE_EVENTS.ENTER_PARAM_FOR_SEARCH);
            }}
          >
            <FieldErrorHint>
              <InputSearch
                disabled={!dashboardItems.length && !filter}
                maxLength="128"
                placeholder={intl.formatMessage(messages.searchPlaceholder)}
              />
            </FieldErrorHint>
          </FieldProvider>
        </div>
        <div className={cx('buttons', `active-${gridType}`)}>
          <GhostButton onClick={onGridViewToggle} icon={GridViewDashboardIcon} />
          <GhostButton onClick={onTableViewToggle} icon={TableViewDashboardIcon} />
        </div>
      </div>
    );
  }
}
