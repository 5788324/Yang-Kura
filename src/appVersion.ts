declare const __YANG_KURA_APP_VERSION__: string;

export const YANG_KURA_APP_VERSION =
  typeof __YANG_KURA_APP_VERSION__ === 'string' && __YANG_KURA_APP_VERSION__.trim()
    ? __YANG_KURA_APP_VERSION__.trim()
    : '0.0.0-dev';
