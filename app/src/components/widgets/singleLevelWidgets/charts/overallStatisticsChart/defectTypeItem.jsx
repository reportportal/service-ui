import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defectTypesSelector } from 'controllers/project';
import { injectIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { getItemColor, getItemName } from '../../../common/utils';
import styles from './defectTypeItem.scss';

const cx = classNames.bind(styles);

@connect((state) => ({
  defectTypes: defectTypesSelector(state),
}))
@injectIntl
export class DefectTypeItem extends React.Component {
  static propTypes = {
    defectTypes: PropTypes.object.isRequired,
    itemName: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    intl: PropTypes.object.isRequired,
  };
  render() {
    const {
      intl: { formatMessage },
      itemName,
      defectTypes,
      value,
    } = this.props;
    const defectName = getItemName({ itemName, defectTypes, formatMessage });
    const bgColor = getItemColor(itemName, defectTypes);

    return (
      <div className={cx('defect')}>
        <div className={cx('amount')}>{value}</div>

        <div className={cx('label')}>
          <div style={{ backgroundColor: bgColor }} className={cx('marker')} />
          {defectName}
        </div>
      </div>
    );
  }
}
