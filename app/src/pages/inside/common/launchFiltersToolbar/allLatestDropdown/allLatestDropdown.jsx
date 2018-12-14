import { Component, createRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import Parser from 'html-react-parser';
import ArrowDownIcon from 'common/img/arrow-down-inline.svg';
import { ALL, LATEST } from 'common/constants/reservedFilterIds';
import styles from './allLatestDropdown.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  all: {
    id: 'AllLatestDropdown.allLaunches',
    defaultMessage: 'All launches',
  },
  latest: {
    id: 'AllLatestDropdown.latestLaunches',
    defaultMessage: 'Latest launches',
  },
  allShort: {
    id: 'AllLatestDropdown.allLaunchesShort',
    defaultMessage: 'All',
  },
  latestShort: {
    id: 'AllLatestDropdown.latestLaunchesShort',
    defaultMessage: 'Latest',
  },
});

@injectIntl
export class AllLatestDropdown extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    value: PropTypes.string,
    onChange: PropTypes.func,
    onClick: PropTypes.func,
    activeFilterId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  };

  static defaultProps = {
    value: ALL,
    onChange: () => {},
    onClick: () => {},
    activeFilterId: null,
  };

  constructor(props) {
    super(props);
    this.nodeRef = createRef();
  }

  state = {
    expanded: false,
  };

  componentDidMount() {
    document.addEventListener('click', this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  }

  getOptions = () => {
    const {
      intl: { formatMessage },
    } = this.props;
    return [
      {
        label: formatMessage(messages.all),
        shortLabel: formatMessage(messages.allShort),
        value: ALL,
      },
      {
        label: formatMessage(messages.latest),
        shortLabel: formatMessage(messages.latestShort),
        value: LATEST,
      },
    ];
  };

  handleClickOutside = (e) => {
    if (!this.nodeRef.current.contains(e.target)) {
      this.setState({ expanded: false });
    }
  };

  handleOptionClick = (value) => {
    this.props.onChange(value);
    this.setState({ expanded: false });
  };

  handleCurrentOptionClick = () => {
    this.props.onClick(this.props.value);
  };

  toggleExpand = () => this.setState({ expanded: !this.state.expanded });

  render() {
    const { value } = this.props;
    const options = this.getOptions();
    const currentOption = options.find((option) => option.value === value);
    const label = currentOption && currentOption.label;
    const shortLabel = currentOption && currentOption.shortLabel;
    return (
      <div
        ref={this.nodeRef}
        className={cx('all-latest-dropdown', {
          active: this.props.activeFilterId === 'all' || this.props.activeFilterId === 'latest',
        })}
      >
        <div className={cx('selected-value')}>
          <div className={cx('value')} onClick={this.handleCurrentOptionClick}>
            {label}
          </div>
          <div className={cx('value-short')} onClick={this.toggleExpand}>
            {shortLabel}
          </div>
          <div className={cx('arrow')} onClick={this.toggleExpand}>
            <div className={cx('separator')} />
            <div className={cx('icon')}>{Parser(ArrowDownIcon)}</div>
          </div>
        </div>
        {this.state.expanded && (
          <div className={cx('option-list')}>
            {options.map((option) => (
              <div
                key={option.value}
                className={cx('option', { selected: option.value === currentOption.value })}
                onClick={() => this.handleOptionClick(option.value)}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}
