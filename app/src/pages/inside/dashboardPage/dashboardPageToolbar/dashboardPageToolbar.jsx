import React, { Component } from 'react';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import PropTypes from 'prop-types';
import { GhostButton } from 'components/buttons/ghostButton';
import { reduxForm } from 'redux-form';
import { Icon } from 'components/main/icon';
import { InputSearch } from 'components/inputs/inputSearch';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { DASHBOARDS_TABLE_VIEW, DASHBOARDS_GRID_VIEW } from 'controllers/dashboard';
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
  onChange: (vals, dispatch, props) => {
    if (vals.dashboardName && vals.dashboardName.length < 3) {
      return;
    }
    props.onFilterChange(vals.dashboardName || undefined);
  },
})
@injectIntl
export class DashboardPageToolbar extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    change: PropTypes.func,
    filter: PropTypes.string,
    onGridViewToggle: PropTypes.func,
    onTableViewToggle: PropTypes.func,
    gridType: PropTypes.string,
    invalid: PropTypes.bool,
  };
  static defaultProps = {
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
    const { onGridViewToggle, onTableViewToggle, gridType, intl } = this.props;

    return (
      <div className={cx('tool-bar')}>
        <div className={cx('input')}>
          <FieldProvider name="dashboardName">
            <FieldErrorHint>
              <InputSearch
                maxLength="128"
                placeholder={intl.formatMessage(messages.searchPlaceholder)}
              />
            </FieldErrorHint>
          </FieldProvider>
        </div>
        <div className={cx('buttons', `active-${gridType}`)}>
          <GhostButton onClick={onGridViewToggle}>
            <Icon type={gridType === DASHBOARDS_GRID_VIEW ? 'icon-grid-active' : 'icon-grid'} />
          </GhostButton>
          <GhostButton onClick={onTableViewToggle}>
            <Icon type={gridType === DASHBOARDS_TABLE_VIEW ? 'icon-table-active' : 'icon-table'} />
          </GhostButton>
        </div>
      </div>
    );
  }
}
