import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import styles from './tagsBlock.scss';

const cx = classNames.bind(styles);

export const TagsBlock = ({ tags }) => (
  <div className={cx('tags-block')}>
    <div className={cx('tags-icon')} />
    {
      tags.map(tag => (
        <a key={tag} href="/" className={cx('tag')}>{tag}</a>
      ))
    }
  </div>
  );

TagsBlock.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
};
