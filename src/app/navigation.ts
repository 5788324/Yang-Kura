import type { PageType } from '../types';

export type NavigationSection = 'library' | 'maintenance';

export interface AppRouteDefinition {
  id: PageType;
  label: string;
  shortLabel: string;
  section: NavigationSection;
  daily: boolean;
  searchable: boolean;
  visibleInSidebar: boolean;
}

export const APP_ROUTE_REGISTRY = {
  dashboard: {
    id: 'dashboard',
    label: '首页',
    shortLabel: '首页',
    section: 'library',
    daily: true,
    searchable: true,
    visibleInSidebar: true,
  },
  'asmr-lib': {
    id: 'asmr-lib',
    label: '音声库',
    shortLabel: '音声',
    section: 'library',
    daily: true,
    searchable: true,
    visibleInSidebar: true,
  },
  'music-lib': {
    id: 'music-lib',
    label: '音乐库',
    shortLabel: '音乐',
    section: 'library',
    daily: true,
    searchable: true,
    visibleInSidebar: true,
  },
  playlists: {
    id: 'playlists',
    label: '歌单',
    shortLabel: '歌单',
    section: 'library',
    daily: true,
    searchable: true,
    visibleInSidebar: true,
  },
  importer: {
    id: 'importer',
    label: '导入',
    shortLabel: '导入',
    section: 'library',
    daily: true,
    searchable: false,
    visibleInSidebar: true,
  },
  settings: {
    id: 'settings',
    label: '设置',
    shortLabel: '设置',
    section: 'library',
    daily: true,
    searchable: false,
    visibleInSidebar: true,
  },
  downloader: {
    id: 'downloader',
    label: '下载规划',
    shortLabel: '下载',
    section: 'maintenance',
    daily: false,
    searchable: false,
    visibleInSidebar: false,
  },
  diagnostics: {
    id: 'diagnostics',
    label: 'AI 维护',
    shortLabel: '维护',
    section: 'maintenance',
    daily: false,
    searchable: false,
    visibleInSidebar: false,
  },
} satisfies Record<PageType, AppRouteDefinition>;

export const DAILY_NAVIGATION_ROUTES = Object.values(APP_ROUTE_REGISTRY).filter(
  (route) => route.daily && route.visibleInSidebar,
);

export const MAINTENANCE_ROUTES = Object.values(APP_ROUTE_REGISTRY).filter(
  (route) => route.section === 'maintenance',
);

export const getRouteDefinition = (page: PageType): AppRouteDefinition =>
  APP_ROUTE_REGISTRY[page];

export const isSearchableRoute = (page: PageType): boolean =>
  APP_ROUTE_REGISTRY[page].searchable;
