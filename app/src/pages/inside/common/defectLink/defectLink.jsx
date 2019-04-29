import { connect } from 'react-redux';
import track from 'react-tracking';
import Link from 'redux-first-router-link';
import { defectLinkSelector, setPageLoadingAction } from 'controllers/testItem';

export const DefectLink = track()(
  connect(
    (state, ownProps) => ({
      link: defectLinkSelector(state, ownProps),
    }),
    {
      refreshTestItemPage: () => setPageLoadingAction(true),
    },
  )(
    ({
      itemId,
      link,
      children,
      defects,
      eventInfo,
      tracking,
      ownLinkParams,
      refreshTestItemPage,
      ...rest
    }) => (
      <Link
        to={link}
        {...rest}
        onClick={() => {
          eventInfo && tracking.trackEvent(eventInfo);
          refreshTestItemPage();
        }}
      >
        {children}
      </Link>
    ),
  ),
);
