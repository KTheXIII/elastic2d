export function vec2AB(n,x){return{x:x.x-n.x,y:x.y-n.y}}export function mag2(n){return Math.sqrt(n.x*n.x+n.y*n.y)}export function norm2(n){const x=mag2(n);return{x:n.x/x,y:n.y/x}}export function dot2(n,x){return n.x*x.x+n.y*x.y}export function scale2(n,x){return{x:n.x*x,y:n.x*x}}
