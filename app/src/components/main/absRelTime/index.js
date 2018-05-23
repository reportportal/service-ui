import { connect } from 'react-redux';
import { setStartTimeFormatAction, startTimeFormatSelector } from 'controllers/user';
import { AbsRelTime } from './absRelTime';

const mapStateToProps = (state) => ({
  startTimeFormat: startTimeFormatSelector(state),
});
const actions = {
  setStartTimeFormatAction,
};

const withConnect = connect(mapStateToProps, actions);

const ConnectedAbsRelTime = withConnect(AbsRelTime);

export { ConnectedAbsRelTime as AbsRelTime };
