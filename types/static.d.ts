/* Use this file to declare any custom file extensions for importing */
/* Use this folder to also add/extend a package d.ts file, if needed. */

/* CSS MODULES */
declare module '*.module.css' {
  const classes: { [key: string]: string }
  export default classes
}
declare module '*.module.scss' {
  const classes: { [key: string]: string }
  export default classes
}
declare module '*.module.sass' {
  const classes: { [key: string]: string }
  export default classes
}
declare module '*.module.less' {
  const classes: { [key: string]: string }
  export default classes
}
declare module '*.module.styl' {
  const classes: { [key: string]: string }
  export default classes
}

/* CSS */
declare module '*.css';
declare module '*.scss';
declare module '*.sass';
declare module '*.less';
declare module '*.styl';

/* IMAGES */
declare module '*.svg' {
  const ref: string
  export default ref
}
declare module '*.bmp' {
  const ref: string
  export default ref
}
declare module '*.gif' {
  const ref: string
  export default ref
}
declare module '*.jpg' {
  const ref: string
  export default ref
}
declare module '*.jpeg' {
  const ref: string
  export default ref
}
declare module '*.png' {
  const ref: string
  export default ref
}

// snowpack environment variables type definition
declare const __SNOWPACK_ENV__ : {
  APP_NAME: string
  VERSION: string
  AUTHOR: string
  DESCRIPTION: string
  HOMEPAGE: string
  REPOSITORY_URL: string
  COMMIT_HASH: string
  SPONSOR_URL: string
  BUILD_DATE: string

  PUBLIC_URL: string
  MODE: string,
  SSR: boolean
}
