import { connect } from 'react-redux';
import track from 'react-tracking';
import Link from 'redux-first-router-link';
import { defectLinkSelector } from 'controllers/testItem';

export const DefectLink = track()(
  connect((state, ownProps) => ({
    link: defectLinkSelector(state, ownProps),
  }))(({ itemId, link, children, defects, eventInfo, tracking, ownLinkParams, ...rest }) => (
    <Link to={link} {...rest} onClick={() => eventInfo && tracking.trackEvent(eventInfo)}>
      {children}
    </Link>
  )),
);
