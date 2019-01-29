import classNames from 'classnames/bind';
import { LOG_MESSAGE_HIGHLIGHT_TIMEOUT } from '../constants';
import styles from './utils.scss';

const cx = classNames.bind(styles);

export function highLightGridRow(itemId) {
  const targetItem = document.querySelector(`div[data-id='${itemId}']`);
  if (!targetItem) {
    return false;
  }

  const highlightBlock = targetItem.querySelector(`div[datatype='highlight-block']`);
  highlightBlock.scrollIntoView({ behavior: 'smooth', block: 'end' });
  highlightBlock.classList.add(cx('highlight'));
  highlightBlock.classList.add(cx('hide-highlight'));
  setTimeout(() => {
    highlightBlock.classList.remove(cx('highlight'));
    highlightBlock.classList.remove(cx('hide-highlight'));
  }, LOG_MESSAGE_HIGHLIGHT_TIMEOUT);
  return true;
}
