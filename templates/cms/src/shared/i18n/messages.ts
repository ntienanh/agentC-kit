
import common from '../../../messages/en/common.json';
import editor from '../../../messages/en/editor.json';
import enums from '../../../messages/en/enums.json';
import error from '../../../messages/en/error.json';
import featuresAuthChangePassword from '../../../messages/en/features/auth/changePassword.json';
import featuresAuthForgotPassword from '../../../messages/en/features/auth/forgotPassword.json';
import featuresAuthProfile from '../../../messages/en/features/auth/profile.json';
import featuresAuthResetPassword from '../../../messages/en/features/auth/resetPassword.json';
import featuresAuthSignIn from '../../../messages/en/features/auth/signIn.json';
import featuresMediaLibrary from '../../../messages/en/features/mediaLibrary.json';
import featuresRoles from '../../../messages/en/features/roles.json';
import featuresSample from '../../../messages/en/features/sample.json';
import featuresUserManagement from '../../../messages/en/features/userManagement.json';
import pagesAbout from '../../../messages/en/pages/about.json';
import pagesForbidden from '../../../messages/en/pages/forbidden.json';
import status from '../../../messages/en/status.json';
import validate from '../../../messages/en/validate.json';

export const I18nDefinition = {
  common: common,
  editor: editor,
  enums: enums,
  error: error,
  features: {
    auth: {
      changePassword: featuresAuthChangePassword,
      forgotPassword: featuresAuthForgotPassword,
      profile: featuresAuthProfile,
      resetPassword: featuresAuthResetPassword,
      signIn: featuresAuthSignIn,
    },
    mediaLibrary: featuresMediaLibrary,
    roles: featuresRoles,
    sample: featuresSample,
    userManagement: featuresUserManagement,
  },
  pages: {
    about: pagesAbout,
    forbidden: pagesForbidden,
  },
  status: status,
  validate: validate,
} as const;

export type MessageSchema = typeof I18nDefinition;
export const I18N_NAMESPACES = [
  'common',
  'editor',
  'enums',
  'error',
  'features.auth.changePassword',
  'features.auth.forgotPassword',
  'features.auth.profile',
  'features.auth.resetPassword',
  'features.auth.signIn',
  'features.mediaLibrary',
  'features.roles',
  'features.sample',
  'features.userManagement',
  'pages.about',
  'pages.forbidden',
  'status',
  'validate',
] as const;
export type MessageNamespace = (typeof I18N_NAMESPACES)[number];
