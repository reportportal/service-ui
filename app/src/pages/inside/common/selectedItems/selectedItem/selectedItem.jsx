import PropTypes from 'prop-types';
import { injectIntl, defineMessages } from 'react-intl';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import CrossIcon from 'common/img/icon-cross-inline.svg';
import { withTooltip } from 'components/main/tooltips/tooltip/index';
import styles from './selectedItem.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  selectMoreItems: {
    id: 'LaunchesPage.selectMoreItems',
    defaultMessage: 'You must select more than one item',
  },
  notYourOwnLaunch: {
    id: 'LaunchesPage.notYourOwnLaunch',
    defaultMessage: 'You are not a launch owner',
  },
  launchNotInProgress: {
    id: 'LaunchesPage.launchNotInProgress',
    defaultMessage: 'Launch should not be in the status In progress!',
  },
  launchIsProcessing: {
    id: 'LaunchesPage.launchIsProcessing',
    defaultMessage: 'Launch should not be processing by Auto analysis!',
  },
});

const TooltipComponent = injectIntl(({ intl, error }) => (
  <div>{intl.formatMessage(messages[error])}</div>
));
TooltipComponent.propTypes = {
  error: PropTypes.string,
};
TooltipComponent.defaultProps = {
  error: '',
};

const formatItem = (name, number) => (number ? `${name} #${number}` : name);

const SelectedItemBody = ({ name, number, error, onUnselect }) => (
  <div className={cx('selected-item', { error: !!error })}>
    <span className={cx('name')}>{formatItem(name, number)}</span>
    <div className={cx('cross-icon')} onClick={onUnselect}>
      {Parser(CrossIcon)}
    </div>
  </div>
);
SelectedItemBody.propTypes = {
  className: PropTypes.string,
  name: PropTypes.string.isRequired,
  onUnselect: PropTypes.func,
  error: PropTypes.string,
  number: PropTypes.number,
};
SelectedItemBody.defaultProps = {
  className: '',
  onUnselect: () => {},
  error: null,
  number: null,
};

const SelectedItemWithTooltip = withTooltip({
  TooltipComponent,
  data: {
    width: 200,
    leftOffset: 10,
    noArrow: true,
  },
})(SelectedItemBody);

export const SelectedItem = ({ error, ...rest }) =>
  error ? <SelectedItemWithTooltip error={error} {...rest} /> : <SelectedItemBody {...rest} />;

SelectedItem.propTypes = {
  className: PropTypes.string,
  name: PropTypes.string.isRequired,
  onUnselect: PropTypes.func,
  error: PropTypes.string,
  number: PropTypes.number,
};
SelectedItem.defaultProps = {
  className: '',
  onUnselect: () => {},
  error: null,
  number: null,
};
