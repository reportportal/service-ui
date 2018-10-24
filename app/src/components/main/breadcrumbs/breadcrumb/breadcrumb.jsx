import Parser from 'html-react-parser';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import ListViewIcon from 'common/img/list-view-inline.svg';
import { LinkItem } from './linkItem';
import { ErrorItem } from './errorItem';
import { breadcrumbDescriptorShape } from '../propTypes';

import styles from './breadcrumb.scss';

const cx = classNames.bind(styles);

export const Breadcrumb = ({ descriptor: { error, active, link, title, listView }, onClick }) => (
  <div className={cx('breadcrumb')}>
    {listView && (
      <div className={cx('list-view-icon')} title={'List view'}>
        {Parser(ListViewIcon)}
      </div>
    )}
    {error ? (
      <ErrorItem />
    ) : (
      <LinkItem active={active} link={link} title={title} onClick={onClick} />
    )}
  </div>
);
Breadcrumb.propTypes = {
  descriptor: breadcrumbDescriptorShape.isRequired,
  onClick: PropTypes.func,
};
Breadcrumb.defaultProps = {
  onClick: () => {},
};
