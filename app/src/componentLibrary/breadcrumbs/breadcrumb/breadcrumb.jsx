/*
 * Copyright 2022 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { NavLink } from 'components/main/navLink';
import { withTooltip } from 'componentLibrary/tooltip';
import styles from './breadcrumb.scss';

const cx = classNames.bind(styles);

const BreadcrumbTitleComponent = ({
  descriptor: { link, title, onClick, tooltipDisabled },
  maxBreadcrumbWidth,
  titleTailNumChars,
}) => {
  const ref = useRef();

  useEffect(() => {
    if (ref.current) {
      const { offsetWidth, scrollWidth, dataset } = ref.current;

      if (offsetWidth < scrollWidth) {
        dataset.tail = title.slice(title.length - titleTailNumChars);
      }
    }
  }, [ref, title, titleTailNumChars]);

  return (
    <div className={cx(tooltipDisabled ? 'breadcrumb' : 'breadcrumb-with-tooltip')}>
      <NavLink className={cx('link')} to={link} onClick={onClick}>
        <div ref={ref} className={cx('breadcrumb-text')} style={{ maxWidth: maxBreadcrumbWidth }}>
          {title}
        </div>
      </NavLink>
    </div>
  );
};
BreadcrumbTitleComponent.propTypes = {
  maxBreadcrumbWidth: PropTypes.number.isRequired,
  titleTailNumChars: PropTypes.number,
  descriptor: PropTypes.shape({
    title: PropTypes.string.isRequired,
    link: PropTypes.object.isRequired,
    onClick: PropTypes.func,
    tooltipDisabled: PropTypes.bool,
  }).isRequired,
};

const BreadcrumbTitleTooltip = ({ descriptor: { title } }) => <span>{title}</span>;
BreadcrumbTitleTooltip.propTypes = {
  descriptor: PropTypes.shape({
    title: PropTypes.string.isRequired,
  }).isRequired,
};

const BreadcrumbTitleComponentWithTooltip = withTooltip({
  ContentComponent: BreadcrumbTitleTooltip,
  side: 'bottom',
  dynamicWidth: true,
  tooltipWrapperClassName: cx('breadcrumb'),
})((props) => <BreadcrumbTitleComponent {...props} />);
BreadcrumbTitleComponentWithTooltip.propTypes = {
  maxBreadcrumbWidth: PropTypes.number.isRequired,
  titleTailNumChars: PropTypes.number,
  descriptor: PropTypes.shape({
    title: PropTypes.string.isRequired,
    link: PropTypes.object.isRequired,
    onClick: PropTypes.func,
    tooltipDisabled: PropTypes.bool,
  }).isRequired,
};

export const Breadcrumb = ({
  maxBreadcrumbWidth,
  titleTailNumChars,
  descriptor,
  descriptor: { tooltipDisabled },
}) =>
  tooltipDisabled ? (
    <BreadcrumbTitleComponent
      descriptor={descriptor}
      maxBreadcrumbWidth={maxBreadcrumbWidth}
      titleTailNumChars={titleTailNumChars}
    />
  ) : (
    <BreadcrumbTitleComponentWithTooltip
      descriptor={descriptor}
      maxBreadcrumbWidth={maxBreadcrumbWidth}
      titleTailNumChars={titleTailNumChars}
    />
  );

Breadcrumb.propTypes = {
  maxBreadcrumbWidth: PropTypes.number,
  titleTailNumChars: PropTypes.number,
  descriptor: PropTypes.shape({
    title: PropTypes.string.isRequired,
    link: PropTypes.object.isRequired,
    onClick: PropTypes.func,
    tooltipDisabled: PropTypes.bool,
  }).isRequired,
};

Breadcrumb.defaultProps = {
  maxBreadcrumbWidth: 132,
  titleTailNumChars: 8,
};
