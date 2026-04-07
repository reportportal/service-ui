import { createElement, type PropsWithChildren } from 'react';
import { mount } from 'enzyme';
import { ProjectLayout } from './index';

type MockLayoutProps = PropsWithChildren<Record<string, unknown>>;
type MountNode = Parameters<typeof mount>[0];

const mockUseFullSelector = jest.fn((selector: unknown) => selector);
const mockLayout = jest.fn(({ children }: MockLayoutProps) =>
  createElement('div', null, children),
);

const createProjectLayoutElement = (content: string): MountNode =>
  createElement(ProjectLayout, null, createElement('div', null, content)) as MountNode;

jest.mock('hooks/useTypedSelector', () => ({
  useFullSelector: (selector: unknown) => mockUseFullSelector(selector),
}));

jest.mock('layouts/common/layout', () => ({
  Layout: (props: MockLayoutProps) => mockLayout(props),
}));

jest.mock('./projectSidebar', () => ({
  ProjectSidebar: () => null,
}));

jest.mock('../headerLayout', () => ({
  HeaderLayout: () => null,
}));

jest.mock('./appBanner', () => ({
  AppBanner: () => null,
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

    mount(createProjectLayoutElement('Dashboard content'));

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

    mount(createProjectLayoutElement('Dashboard content'));

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

    mount(createProjectLayoutElement('Non dashboard content'));

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

    mount(createProjectLayoutElement('Dashboard content'));

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
