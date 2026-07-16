import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import dashboardReducer from './slices/dashboardSlice';
import postsReducer from './slices/postsSlice';
import projectsReducer from './slices/projectsSlice';
import novelsReducer from './slices/novelsSlice';
import chaptersReducer from './slices/chaptersSlice';
import mediaReducer from './slices/mediaSlice';
import settingsReducer from './slices/settingsSlice';
import publicPostsReducer from './slices/publicPostsSlice';
import publicProjectsReducer from './slices/publicProjectsSlice';
import publicNovelsReducer from './slices/publicNovelsSlice';
import publicTagsReducer from './slices/publicTagsSlice';
import publicCategoriesReducer from './slices/publicCategoriesSlice';
import publicSettingsReducer from './slices/publicSettingsSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    posts: postsReducer,
    projects: projectsReducer,
    novels: novelsReducer,
    chapters: chaptersReducer,
    media: mediaReducer,
    settings: settingsReducer,
    publicPosts: publicPostsReducer,
    publicProjects: publicProjectsReducer,
    publicNovels: publicNovelsReducer,
    publicTags: publicTagsReducer,
    publicCategories: publicCategoriesReducer,
    publicSettings: publicSettingsReducer,
  },
});

export default store;
