export const descriptors = [
  {
    title: 'title1',
    id: 'link1',
    link: {
      type: 'PROJECT_FILTERS_PAGE',
      payload: {
        filterId: 'all',
        projectId: 'amsterget_personal',
      },
    },
    error: false,
    listView: false,
    active: false,
  },
  {
    title: 'title2',
    id: 'link2',
    link: {
      type: 'PROJECT_DASHBOARD_PAGE',
      payload: {
        filterId: 'all',
        projectId: 'amsterget_personal',
      },
    },
    error: false,
    listView: false,
    active: false,
  },
  {
    title: 'title3',
    id: 'link3',
    link: {
      type: 'PROJECT_LAUNCHES_PAGE',
      payload: {
        filterId: 'all',
        projectId: 'amsterget_personal',
      },
    },
    error: false,
    listView: false,
    active: false,
  },
  {
    title: 'title4',
    id: 'link4',
    link: {
      type: 'PROJECT_MEMBERS_PAGE',
      payload: {
        filterId: 'all',
        projectId: 'amsterget_personal',
      },
    },
    error: false,
    listView: false,
    active: false,
  },
];

export const errorDescriptors = descriptors.map((item) => ({ ...item, error: true }));

export const listViewDescriptors = descriptors.map((item) => ({ ...item, listView: true }));

export const descriptorsWithActive = descriptors.map((item) => ({ ...item, active: true }));
