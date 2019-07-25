import { connect } from 'react-redux';
import { retryLinkSelector } from 'controllers/log';
import { StackTrace } from './stackTrace';

export const ConnectedStackTrace = connect((state, props) => ({
  link: retryLinkSelector(state, props),
}))(StackTrace);
