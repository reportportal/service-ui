import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { MarkdownViewer } from 'components/main/markdown';
import styles from './descriptionTooltip.scss';

const cx = classNames.bind(styles);

export const DescriptionTooltip = ({ description }) => (
  <div className={cx('description-tooltip')}>
    <ScrollWrapper>
      <MarkdownViewer value={description} />
    </ScrollWrapper>
  </div>
);
DescriptionTooltip.propTypes = {
  description: PropTypes.string,
};

DescriptionTooltip.defaultProps = {
  description: '',
};
