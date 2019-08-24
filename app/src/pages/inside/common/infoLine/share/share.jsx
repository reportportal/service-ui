import React, { Component } from 'react';
import classNames from 'classnames/bind';
import { injectIntl, intlShape } from 'react-intl';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import { withTooltip } from 'components/main/tooltips/tooltip';
import ShareIcon from 'common/img/share-icon-inline.svg';
import GlobeIcon from 'common/img/globe-icon-inline.svg';
import styles from './share.scss';
import { ShareTooltip } from './shareTooltip';

const cx = classNames.bind(styles);

@injectIntl
@withTooltip({
  TooltipComponent: ShareTooltip,
  data: { width: 'auto', align: 'left', noArrow: true },
})
export class Share extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    share: PropTypes.bool,
    currentUser: PropTypes.string,
    owner: PropTypes.string,
  };

  static defaultProps = {
    share: false,
    currentUser: '',
    owner: '',
  };

  render() {
    const { currentUser, owner } = this.props;
    return (
      <div className={cx('share-block')}>
        <div className={cx('share-icon')}>
          {Parser(currentUser === owner ? ShareIcon : GlobeIcon)}
        </div>
      </div>
    );
  }
}
