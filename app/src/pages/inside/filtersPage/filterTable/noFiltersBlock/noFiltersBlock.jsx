import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { activeProjectSelector } from 'controllers/user';
import { GhostButton } from 'components/buttons/ghostButton';
import AddFilterIcon from './img/ic-add-filter-inline.svg';
import styles from './noFiltersBlock.scss';

const cx = classNames.bind(styles);

@withRouter
@connect((state) => ({
  activeProject: activeProjectSelector(state),
}))
export class NoFiltersBlock extends PureComponent {
  static propTypes = {
    activeProject: PropTypes.string.isRequired,
  };
  onClickAddFilter = () => {};
  render() {
    return (
      <div className={cx('no-filters-block')}>
        <div className={cx('flex-wrapper')}>
          <div className={cx('icon')} />
          <div className={cx('title')}>
            <FormattedMessage id={'NoFiltersBlock.title'} defaultMessage={'There are no filters'} />
          </div>
          <div className={cx('message')}>
            <FormattedMessage
              id={'NoFiltersBlock.message'}
              defaultMessage={'You can create your first filter on the '}
            />
            <Link className={cx('link')} to={`/${this.props.activeProject}/launches`}>
              <FormattedMessage id={'NoFiltersBlock.link'} defaultMessage={'Launch Page'} />
            </Link>
          </div>
          <div className={cx('or')}>
            <FormattedMessage id={'NoFiltersBlock.or'} defaultMessage={'or'} />
          </div>
          <div className={cx('button')}>
            <GhostButton icon={AddFilterIcon} onClick={this.onClickAddFilter}>
              <FormattedMessage id={'NoFiltersBlock.Button'} defaultMessage={'Add filter'} />
            </GhostButton>
          </div>
        </div>
      </div>
    );
  }
}
