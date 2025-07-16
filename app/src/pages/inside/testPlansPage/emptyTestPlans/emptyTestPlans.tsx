import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { useIntl } from 'react-intl';
import { referenceDictionary } from 'common/utils';
import { EmptyStatePage } from 'pages/inside/common/emptyStatePage';
import { NumerableBlock } from 'pages/common/numerableBlock';
import { messages } from './messages';
import styles from './emptyTestPlans.scss';

const cx = classNames.bind(styles);

const benefitMessages = [
  messages.progressTracking,
  messages.goalAlignment,
  messages.resourceManagement,
];

export const EmptyTestPlans = () => {
  const { formatMessage } = useIntl();
  const benefits = benefitMessages.map((translation) =>
    Parser(formatMessage(translation, {}, { ignoreTag: true })),
  );

  const handleCreate = (): void => {
    // open modal
  };

  return (
    <div className={cx('empty-test-plans')}>
      <EmptyStatePage
        title={formatMessage(messages.pageHeader)}
        description={Parser(formatMessage(messages.pageDescription))}
        imageType="flag"
        documentationLink={referenceDictionary.rpDoc}
        buttons={[
          {
            name: formatMessage(messages.createTestPlansLabel),
            dataAutomationId: 'createTestPlansButton',
            isCompact: true,
            handleButton: handleCreate,
          },
        ]}
      />
      <NumerableBlock
        items={benefits}
        title={formatMessage(messages.numerableBlockTitle)}
        className={cx('empty-test-plans__numerableBlock')}
        fullWidth
      />
    </div>
  );
};
