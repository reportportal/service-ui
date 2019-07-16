import { storiesOf } from '@storybook/react';
import { host } from 'storybook-host';
// eslint-disable-next-line import/extensions, import/no-unresolved
import { withReadme } from 'storybook-readme';
import { MostPopularPatterns } from './mostPopularPatterns';
import { level1, level2 } from './data';
import README from './README.md';

const fetchWidget = (params) => (params && params.patternTemplateName ? level2 : level1);

storiesOf('Components/Widgets/Tables/MostPopularPatterns', module)
  .addDecorator(
    host({
      title: 'Most Popular Patterns',
      align: 'center middle',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#fff',
      height: 600,
      width: 400,
    }),
  )
  .addDecorator(withReadme(README))
  .add('with required props: launch, tests, nameClickHandler', () => (
    <MostPopularPatterns widget={level1} fetchWidget={fetchWidget} />
  ));
