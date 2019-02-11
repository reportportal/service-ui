import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { NavLink } from 'redux-first-router-link';
import PropTypes from 'prop-types';
import { activeProjectSelector } from 'controllers/user';
import { ALL } from 'common/constants/reservedFilterIds';
import { PROJECT_LOG_PAGE } from 'controllers/pages';
import { AttributesBlock } from 'pages/inside/common/itemInfo/attributesBlock';
import styles from './foundIn.scss';

export const cx = classNames.bind(styles);

@connect((state) => ({
  projectId: activeProjectSelector(state),
}))
export class FoundIn extends Component {
  static propTypes = {
    value: PropTypes.object.isRequired,
    className: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
  };

  getItemFragent = (item) => {
    const path = [item.launchId].concat(Object.keys(item.pathNames), item.id).join('/');
    const link = {
      type: PROJECT_LOG_PAGE,
      payload: {
        projectId: this.props.projectId,
        filterId: ALL,
        testItemIds: path,
      },
    };

    return (
      <Fragment key={item.id}>
        <div className={cx('item')} title={item.name}>
          <NavLink to={link} className={cx('found-link')}>
            {item.name}
          </NavLink>
        </div>
        {item.attributes && <AttributesBlock attributes={item.attributes} />}
      </Fragment>
    );
  };

  render() {
    const { value, className } = this.props;
    return (
      <div className={cx('found-in-col', className)}>
        {value.foundIn && value.foundIn.map(this.getItemFragent)}
      </div>
    );
  }
}
