import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import styles from './testParameters.scss';

const cx = classNames.bind(styles);

export const TestParameters = ({ parameters }) =>
  parameters.length ? (
    <table className={cx('test-parameters')}>
      <thead className={cx('header')}>
        <tr className={cx('row')}>
          <td className={cx('header-cell')}>
            <FormattedMessage
              id="TestItemDetailsModal.parameterKey"
              defaultMessage="Parameter key"
            />
          </td>
          <td className={cx('header-cell')}>
            <FormattedMessage
              id="TestItemDetailsModal.parameterValue"
              defaultMessage="Parameter value"
            />
          </td>
        </tr>
      </thead>
      <tbody>
        {parameters.map((param) => (
          <tr key={param.key} className={cx('row')}>
            <td className={cx('cell')}>{param.key}</td>
            <td className={cx('cell')}>{param.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ) : (
    <div className={cx('no-parameters')}>
      <FormattedMessage id="TestItemDetailsModal.noParameters" defaultMessage="No parameters" />
    </div>
  );
TestParameters.propTypes = {
  parameters: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      value: PropTypes.string,
    }),
  ),
};
TestParameters.defaultProps = {
  parameters: [],
};
