import React, { Component } from 'react';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import PropTypes from 'prop-types';
import { GhostButton } from 'components/buttons/ghostButton';
import { reduxForm } from 'redux-form';
import { InputSearch } from 'components/inputs/inputSearch';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import styles from './dashboardPageToolbar.scss';
import GridViewDashboardIcon from './img/grid-inline.svg';
import TableViewDashboardIcon from './img/table-inline.svg';

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
    dashboardItems: PropTypes.array,
    change: PropTypes.func,
    filter: PropTypes.string,
    onGridViewToggle: PropTypes.func,
    onTableViewToggle: PropTypes.func,
    gridType: PropTypes.string,
    invalid: PropTypes.bool,
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
          <FieldProvider name="dashboardName">
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
