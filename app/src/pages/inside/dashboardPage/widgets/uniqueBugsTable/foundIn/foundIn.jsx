import { PureComponent, Fragment } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import Link from 'redux-first-router-link';
import PropTypes from 'prop-types';
import { activeProjectSelector } from 'controllers/user';
import TagIcon from 'common/img/tag-inline.svg';
import Parser from 'html-react-parser';
import styles from './foundIn.scss';

export const cx = classNames.bind(styles);

@connect((state) => ({
  projectId: activeProjectSelector(state),
}))
export class FoundIn extends PureComponent {
  static propTypes = {
    value: PropTypes.object.isRequired,
    className: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
  };

  render() {
    const { value, className, projectId } = this.props;
    return (
      <div className={cx('found-in-col', className)}>
        {value.foundIn &&
          value.foundIn.map((item) => {
            const path = [item.launchId].concat(Object.keys(item.pathNames)).join('/');
            return (
              <Fragment key={item.id}>
                <div className={cx('item')} title={item.name}>
                  <Link
                    to={`#${projectId}/launches/all/${path}?log.item=${item.id}`}
                    className={cx('found-link')}
                  >
                    {item.name}
                  </Link>
                </div>
                {item.tags && (
                  <span>
                    <i className={cx('icon')}>{Parser(TagIcon)}</i>
                    {item.tags.join(', ')}
                  </span>
                )}
              </Fragment>
            );
          })}
      </div>
    );
  }
}
