function b(p,t,o){return o={path:t,exports:{},require:function(d,s){return K(d,s??o.path)}},p(o,o.exports),o.exports}function K(){throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs")}/*
object-assign
(c) Sindre Sorhus
@license MIT
*/var B=Object.getOwnPropertySymbols,Q=Object.prototype.hasOwnProperty,W=Object.prototype.propertyIsEnumerable;function Y(p){if(p==null)throw new TypeError("Object.assign cannot be called with null or undefined");return Object(p)}function X(){try{if(!Object.assign)return!1;var p=new String("abc");if(p[5]="de",Object.getOwnPropertyNames(p)[0]==="5")return!1;for(var t={},o=0;o<10;o++)t["_"+String.fromCharCode(o)]=o;var d=Object.getOwnPropertyNames(t).map(function(y){return t[y]});if(d.join("")!=="0123456789")return!1;var s={};return"abcdefghijklmnopqrst".split("").forEach(function(y){s[y]=y}),Object.keys(Object.assign({},s)).join("")==="abcdefghijklmnopqrst"}catch(y){return!1}}var k=X()?Object.assign:function(p,t){for(var o,d=Y(p),s,y=1;y<arguments.length;y++){o=Object(arguments[y]);for(var g in o)Q.call(o,g)&&(d[g]=o[g]);if(B){s=B(o);for(var _=0;_<s.length;_++)W.call(o,s[_])&&(d[s[_]]=o[s[_]])}}return d},Z=b(function(p,t){var o=60103,d=60106;t.Fragment=60107,t.StrictMode=60108,t.Profiler=60114;var s=60109,y=60110,g=60112;t.Suspense=60113;var _=60115,q=60116;if(typeof Symbol=="function"&&Symbol.for){var v=Symbol.for;o=v("react.element"),d=v("react.portal"),t.Fragment=v("react.fragment"),t.StrictMode=v("react.strict_mode"),t.Profiler=v("react.profiler"),s=v("react.provider"),y=v("react.context"),g=v("react.forward_ref"),t.Suspense=v("react.suspense"),_=v("react.memo"),q=v("react.lazy")}var A=typeof Symbol=="function"&&Symbol.iterator;function V(e){return e===null||typeof e!="object"?null:(e=A&&e[A]||e["@@iterator"],typeof e=="function"?e:null)}function O(e){for(var r="https://reactjs.org/docs/error-decoder.html?invariant="+e,n=1;n<arguments.length;n++)r+="&args[]="+encodeURIComponent(arguments[n]);return"Minified React error #"+e+"; visit "+r+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var I={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},M={};function j(e,r,n){this.props=e,this.context=r,this.refs=M,this.updater=n||I}j.prototype.isReactComponent={},j.prototype.setState=function(e,r){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error(O(85));this.updater.enqueueSetState(this,e,r,"setState")},j.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function U(){}U.prototype=j.prototype;function w(e,r,n){this.props=e,this.context=r,this.refs=M,this.updater=n||I}var C=w.prototype=new U;C.constructor=w,k(C,j.prototype),C.isPureReactComponent=!0;var $={current:null},F=Object.prototype.hasOwnProperty,N={key:!0,ref:!0,__self:!0,__source:!0};function D(e,r,n){var i,u={},f=null,a=null;if(r!=null)for(i in r.ref!==void 0&&(a=r.ref),r.key!==void 0&&(f=""+r.key),r)F.call(r,i)&&!N.hasOwnProperty(i)&&(u[i]=r[i]);var l=arguments.length-2;if(l===1)u.children=n;else if(1<l){for(var c=Array(l),h=0;h<l;h++)c[h]=arguments[h+2];u.children=c}if(e&&e.defaultProps)for(i in l=e.defaultProps,l)u[i]===void 0&&(u[i]=l[i]);return{$$typeof:o,type:e,key:f,ref:a,props:u,_owner:$.current}}function z(e,r){return{$$typeof:o,type:e.type,key:r,ref:e.ref,props:e.props,_owner:e._owner}}function R(e){return typeof e=="object"&&e!==null&&e.$$typeof===o}function H(e){var r={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(n){return r[n]})}var L=/\/+/g;function P(e,r){return typeof e=="object"&&e!==null&&e.key!=null?H(""+e.key):r.toString(36)}function S(e,r,n,i,u){var f=typeof e;(f==="undefined"||f==="boolean")&&(e=null);var a=!1;if(e===null)a=!0;else switch(f){case"string":case"number":a=!0;break;case"object":switch(e.$$typeof){case o:case d:a=!0}}if(a)return a=e,u=u(a),e=i===""?"."+P(a,0):i,Array.isArray(u)?(n="",e!=null&&(n=e.replace(L,"$&/")+"/"),S(u,r,n,"",function(h){return h})):u!=null&&(R(u)&&(u=z(u,n+(!u.key||a&&a.key===u.key?"":(""+u.key).replace(L,"$&/")+"/")+e)),r.push(u)),1;if(a=0,i=i===""?".":i+":",Array.isArray(e))for(var l=0;l<e.length;l++){f=e[l];var c=i+P(f,l);a+=S(f,r,n,c,u)}else if(c=V(e),typeof c=="function")for(e=c.call(e),l=0;!(f=e.next()).done;)f=f.value,c=i+P(f,l++),a+=S(f,r,n,c,u);else if(f==="object")throw r=""+e,Error(O(31,r==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":r));return a}function E(e,r,n){if(e==null)return e;var i=[],u=0;return S(e,i,"","",function(f){return r.call(n,f,u++)}),i}function G(e){if(e._status===-1){var r=e._result;r=r(),e._status=0,e._result=r,r.then(function(n){e._status===0&&(n=n.default,e._status=1,e._result=n)},function(n){e._status===0&&(e._status=2,e._result=n)})}if(e._status===1)return e._result;throw e._result}var T={current:null};function m(){var e=T.current;if(e===null)throw Error(O(321));return e}var J={ReactCurrentDispatcher:T,ReactCurrentBatchConfig:{transition:0},ReactCurrentOwner:$,IsSomeRendererActing:{current:!1},assign:k};t.Children={map:E,forEach:function(e,r,n){E(e,function(){r.apply(this,arguments)},n)},count:function(e){var r=0;return E(e,function(){r++}),r},toArray:function(e){return E(e,function(r){return r})||[]},only:function(e){if(!R(e))throw Error(O(143));return e}},t.Component=j,t.PureComponent=w,t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=J,t.cloneElement=function(e,r,n){if(e==null)throw Error(O(267,e));var i=k({},e.props),u=e.key,f=e.ref,a=e._owner;if(r!=null){if(r.ref!==void 0&&(f=r.ref,a=$.current),r.key!==void 0&&(u=""+r.key),e.type&&e.type.defaultProps)var l=e.type.defaultProps;for(c in r)F.call(r,c)&&!N.hasOwnProperty(c)&&(i[c]=r[c]===void 0&&l!==void 0?l[c]:r[c])}var c=arguments.length-2;if(c===1)i.children=n;else if(1<c){l=Array(c);for(var h=0;h<c;h++)l[h]=arguments[h+2];i.children=l}return{$$typeof:o,type:e.type,key:u,ref:f,props:i,_owner:a}},t.createContext=function(e,r){return r===void 0&&(r=null),e={$$typeof:y,_calculateChangedBits:r,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null},e.Provider={$$typeof:s,_context:e},e.Consumer=e},t.createElement=D,t.createFactory=function(e){var r=D.bind(null,e);return r.type=e,r},t.createRef=function(){return{current:null}},t.forwardRef=function(e){return{$$typeof:g,render:e}},t.isValidElement=R,t.lazy=function(e){return{$$typeof:q,_payload:{_status:-1,_result:e},_init:G}},t.memo=function(e,r){return{$$typeof:_,type:e,compare:r===void 0?null:r}},t.useCallback=function(e,r){return m().useCallback(e,r)},t.useContext=function(e,r){return m().useContext(e,r)},t.useDebugValue=function(){},t.useEffect=function(e,r){return m().useEffect(e,r)},t.useImperativeHandle=function(e,r,n){return m().useImperativeHandle(e,r,n)},t.useLayoutEffect=function(e,r){return m().useLayoutEffect(e,r)},t.useMemo=function(e,r){return m().useMemo(e,r)},t.useReducer=function(e,r,n){return m().useReducer(e,r,n)},t.useRef=function(e){return m().useRef(e)},t.useState=function(e){return m().useState(e)},t.version="17.0.2"}),x=b(function(p){p.exports=Z});export{b as c,k as o,x as r};