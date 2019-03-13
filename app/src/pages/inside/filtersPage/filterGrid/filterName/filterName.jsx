import React, { Fragment, Component } from 'react';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';

import ShareIcon from 'common/img/share-icon-inline.svg';
import PencilIcon from 'common/img/pencil-icon-inline.svg';
import GlobeIcon from 'common/img/globe-icon-inline.svg';
import { MarkdownViewer } from 'components/main/markdown';
import styles from './filterName.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  shareFilter: {
    id: 'FiltersPage.shareFilter',
    defaultMessage: 'Filter is shared',
  },
});

@injectIntl
export class FilterName extends Component {
  static propTypes = {
    intl: intlShape,
    userFilters: PropTypes.array,
    filter: PropTypes.object,
    onClickName: PropTypes.func,
    onEdit: PropTypes.func,
    search: PropTypes.string,
    userId: PropTypes.string,
    showDesc: PropTypes.bool,
    editable: PropTypes.bool,
    isBold: PropTypes.bool,
    noShareIcons: PropTypes.bool,
  };

  static defaultProps = {
    intl: {},
    userFilters: [],
    filter: {},
    onClickName: () => {},
    onEdit: () => {},
    search: '',
    userId: '',
    showDesc: true,
    editable: true,
    isBold: false,
    noShareIcons: false,
  };

  getHighlightName = () => {
    const {
      filter: { name },
      search,
    } = this.props;

    if (!search.length) {
      return name;
    }

    return name.replace(
      new RegExp(search, 'i'),
      (match) => `<span class=${cx('name-highlight')}>${match}</span>`,
    );
  };

  getShareIcon = () => (this.props.userId === this.props.filter.owner ? ShareIcon : GlobeIcon);

  render() {
    const {
      intl,
      userFilters,
      filter,
      onClickName,
      onEdit,
      userId,
      showDesc,
      editable,
      isBold,
      noShareIcons,
    } = this.props;

    return (
      <Fragment>
        <span className={cx('name-wrapper')}>
          <span
            className={cx('name', {
              bold: isBold,
              link: userFilters.find((item) => item.id === filter.id),
            })}
            onClick={onClickName}
          >
            {Parser(this.getHighlightName(filter.name))}
          </span>
          {filter.share &&
            !noShareIcons && (
              <span className={cx('share-icon')} title={intl.formatMessage(messages.shareFilter)}>
                {Parser(this.getShareIcon())}
              </span>
            )}
          {userId === filter.owner &&
            editable && (
              <span className={cx('pencil-icon')} onClick={() => onEdit(filter)}>
                {Parser(PencilIcon)}
              </span>
            )}
        </span>
        {showDesc && <MarkdownViewer value={filter.description} />}
      </Fragment>
    );
  }
}
