import.meta.env

export const VERSION     = __SNOWPACK_ENV__.VERSION
export const COMMIT_HASH = __SNOWPACK_ENV__.COMMIT_HASH

export const FORMATED_VERSION = `v${VERSION}-${COMMIT_HASH.substring(0, 7)}`
