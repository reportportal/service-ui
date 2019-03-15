import { connect } from 'react-redux';
import { URLS } from 'common/urls';
import { activeProjectSelector } from 'controllers/user';
import { EntityUserSearch } from './entityUserSearch';

export const EntityProjectUsers = connect((state) => ({
  usersSearchUrl: URLS.projectUsernamesSearch(activeProjectSelector(state)),
}))(EntityUserSearch);
