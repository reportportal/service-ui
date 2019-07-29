import { connect } from 'react-redux';
import track from 'react-tracking';
import Link from 'redux-first-router-link';
import { defectLinkSelector, setPageLoadingAction } from 'controllers/testItem';

export const DefectLink = track()(
  connect(
    (state) => ({
      getDefectLink: defectLinkSelector(state),
    }),
    {
      refreshTestItemPage: () => setPageLoadingAction(true),
    },
  )((props) => {
    const {
      itemId,
      getDefectLink,
      children,
      defects,
      eventInfo,
      tracking,
      ownLinkParams,
      refreshTestItemPage,
      ...rest
    } = props;
    return (
      <Link
        to={getDefectLink(props)}
        {...rest}
        onClick={() => {
          eventInfo && tracking.trackEvent(eventInfo);
          refreshTestItemPage();
        }}
      >
        {children}
      </Link>
    );
  }),
);
