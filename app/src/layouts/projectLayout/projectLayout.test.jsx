import React from 'react';
import { mount } from 'enzyme/build';
import { ProjectLayout } from './projectLayout';

const mockUseFullSelector = jest.fn();
const mockLayout = jest.fn(({ children }) => <div>{children}</div>);

jest.mock('hooks/useTypedSelector', () => ({
  useFullSelector: (...args) => mockUseFullSelector(...args),
}));

jest.mock('layouts/common/layout', () => ({
  Layout: (props) => mockLayout(props),
}));

jest.mock('./projectSidebar', () => ({
  ProjectSidebar: () => <div>Project Sidebar</div>,
}));

jest.mock('../headerLayout', () => ({
  HeaderLayout: () => <div>Header Layout</div>,
}));

jest.mock('./appBanner', () => ({
  AppBanner: () => <div>App Banner</div>,
}));

jest.mock('controllers/dashboard', () => ({
  dashboardFullScreenModeSelector: jest.fn(),
  dashboardFullWidthModeSelector: jest.fn(),
}));

jest.mock('controllers/pages', () => ({
  PROJECT_DASHBOARD_ITEM_PAGE: 'projectDashboardItemPage',
  pageSelector: jest.fn(),
}));

describe('ProjectLayout', () => {
  beforeEach(() => {
    mockUseFullSelector.mockReset();
    mockLayout.mockClear();
  });

  test('should hide shell chrome for dashboard fullscreen mode', () => {
    mockUseFullSelector
      .mockReturnValueOnce('projectDashboardItemPage')
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);

    mount(
      <ProjectLayout>
        <div>Dashboard content</div>
      </ProjectLayout>,
    );

    expect(mockLayout).toHaveBeenCalledWith(
      expect.objectContaining({
        hideBanner: true,
        hideHeader: true,
        hideSidebar: true,
        fullWidthContainer: false,
      }),
    );
  });

  test('should keep shell chrome outside dashboard fullscreen mode', () => {
    mockUseFullSelector
      .mockReturnValueOnce('projectDashboardItemPage')
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);

    mount(
      <ProjectLayout>
        <div>Dashboard content</div>
      </ProjectLayout>,
    );

    expect(mockLayout).toHaveBeenCalledWith(
      expect.objectContaining({
        hideBanner: false,
        hideHeader: false,
        hideSidebar: false,
        fullWidthContainer: true,
      }),
    );
  });

  test('should keep shell chrome on non-dashboard page even when fullscreen is enabled', () => {
    mockUseFullSelector
      .mockReturnValueOnce('projectLaunchesPage')
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true);

    mount(
      <ProjectLayout>
        <div>Non dashboard content</div>
      </ProjectLayout>,
    );

    expect(mockLayout).toHaveBeenCalledWith(
      expect.objectContaining({
        hideBanner: false,
        hideHeader: false,
        hideSidebar: false,
        fullWidthContainer: false,
      }),
    );
  });

  test('should prioritize dashboard fullscreen shell hiding when fullWidth and fullScreen are both enabled', () => {
    mockUseFullSelector
      .mockReturnValueOnce('projectDashboardItemPage')
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true);

    mount(
      <ProjectLayout>
        <div>Dashboard content</div>
      </ProjectLayout>,
    );

    expect(mockLayout).toHaveBeenCalledWith(
      expect.objectContaining({
        hideBanner: true,
        hideHeader: true,
        hideSidebar: true,
        fullWidthContainer: false,
      }),
    );
  });
});
