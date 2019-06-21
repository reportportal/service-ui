import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import AAIcon from 'common/img/aa_activated-inline.svg';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import styles from './autoAnalyzedLabel.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  investigatedByAA: {
    id: 'AALabel.investigatedByAA',
    defaultMessage: 'Investigated by Auto-Analysis',
  },
});

export const AutoAnalyzedLabel = injectIntl(({ intl }) => (
  <div className={cx('aa-label')} title={intl.formatMessage(messages.investigatedByAA)}>
    {Parser(AAIcon)}
  </div>
));

AutoAnalyzedLabel.propTypes = {
  intl: intlShape.isRequired,
};
