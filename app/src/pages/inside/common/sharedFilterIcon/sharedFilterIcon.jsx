import React, { Component } from 'react';
import classNames from 'classnames/bind';
import { injectIntl, intlShape } from 'react-intl';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import { withTooltip } from 'components/main/tooltips/tooltip';
import ShareIcon from 'common/img/share-icon-inline.svg';
import GlobeIcon from 'common/img/globe-icon-inline.svg';
import styles from './sharedFilterIcon.scss';
import { SharedFilterIconTooltip } from './sharedFilterIconTooltip';

const cx = classNames.bind(styles);

@injectIntl
@withTooltip({
  TooltipComponent: SharedFilterIconTooltip,
  data: { width: 'auto', align: 'left', noArrow: true },
})
export class SharedFilterIcon extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    share: PropTypes.bool,
    currentUser: PropTypes.string,
    owner: PropTypes.string,
  };

  static defaultProps = {
    share: false,
    currentUser: '',
    owner: undefined,
  };

  render() {
    const { currentUser, owner } = this.props;
    return (
      <div className={cx('share-block')}>
        <div className={cx('share-icon')}>
          {Parser(currentUser === owner || owner === undefined ? ShareIcon : GlobeIcon)}
        </div>
      </div>
    );
  }
}
