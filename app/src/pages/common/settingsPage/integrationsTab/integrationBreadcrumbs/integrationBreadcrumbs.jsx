import { Fragment } from 'react';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import RightArrowIcon from 'common/img/arrow-right-inline.svg';
import { IntegrationBreadcrumb } from './integrationBreadcrumb';
import styles from './integrationBreadcrumbs.scss';

const cx = classNames.bind(styles);

export const IntegrationBreadcrumbs = ({ descriptors, onClickItem }) => {
  const descriptorsLastIndex = descriptors.length - 1;

  return (
    <div className={cx('integration-breadcrumbs')}>
      {descriptors.map((descriptor, i) => (
        <Fragment key={descriptor.type}>
          {i > 0 && <div className={cx('separator')}>{Parser(RightArrowIcon)}</div>}
          <IntegrationBreadcrumb
            descriptor={descriptor}
            active={i !== descriptorsLastIndex}
            onClick={() => onClickItem(descriptor)}
          />
        </Fragment>
      ))}
    </div>
  );
};

IntegrationBreadcrumbs.propTypes = {
  descriptors: PropTypes.array,
  onClickItem: PropTypes.func,
};

IntegrationBreadcrumbs.defaultProps = {
  descriptors: [],
  onClickItem: () => {},
};
