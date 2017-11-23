import { configure } from '@storybook/react';
import 'reset-css';
import 'common/css/fonts/fonts.scss';
import 'common/css/common.scss';

const req = require.context('../src', true, /\.stories\.jsx?$/);

function loadStories() {
  req.keys().forEach((filename) => req(filename))
}

configure(loadStories, module);
