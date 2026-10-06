var ee=Object.defineProperty;var se=(r,t,e)=>t in r?ee(r,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):r[t]=e;var h=(r,t,e)=>(se(r,typeof t!="symbol"?t+"":t,e),e);var st=globalThis,it=st.ShadowRoot&&(st.ShadyCSS===void 0||st.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,ct=Symbol(),Et=new WeakMap,D=class{constructor(t,e,s){if(this._$cssResult$=!0,s!==ct)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o,e=this.t;if(it&&t===void 0){let s=e!==void 0&&e.length===1;s&&(t=Et.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),s&&Et.set(e,t))}return t}toString(){return this.cssText}},It=r=>new D(typeof r=="string"?r:r+"",void 0,ct),u=(r,...t)=>{let e=r.length===1?r[0]:t.reduce((s,i,n)=>s+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+r[n+1],r[0]);return new D(e,r,ct)},Ct=(r,t)=>{if(it)r.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let e of t){let s=document.createElement("style"),i=st.litNonce;i!==void 0&&s.setAttribute("nonce",i),s.textContent=e.cssText,r.appendChild(s)}},ut=it?r=>r:r=>r instanceof CSSStyleSheet?(t=>{let e="";for(let s of t.cssRules)e+=s.cssText;return It(e)})(r):r;var{is:ie,defineProperty:ne,getOwnPropertyDescriptor:ae,getOwnPropertyNames:re,getOwnPropertySymbols:oe,getPrototypeOf:le}=Object,nt=globalThis,Mt=nt.trustedTypes,pe=Mt?Mt.emptyScript:"",he=nt.reactiveElementPolyfillSupport,O=(r,t)=>r,mt={toAttribute(r,t){switch(t){case Boolean:r=r?pe:null;break;case Object:case Array:r=r==null?r:JSON.stringify(r)}return r},fromAttribute(r,t){let e=r;switch(t){case Boolean:e=r!==null;break;case Number:e=r===null?null:Number(r);break;case Object:case Array:try{e=JSON.parse(r)}catch{e=null}}return e}},Pt=(r,t)=>!ie(r,t),zt={attribute:!0,type:String,converter:mt,reflect:!1,useDefault:!1,hasChanged:Pt};Symbol.metadata??=Symbol("metadata"),nt.litPropertyMetadata??=new WeakMap;var w=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=zt){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){let s=Symbol(),i=this.getPropertyDescriptor(t,s,e);i!==void 0&&ne(this.prototype,t,i)}}static getPropertyDescriptor(t,e,s){let{get:i,set:n}=ae(this.prototype,t)??{get(){return this[e]},set(o){this[e]=o}};return{get:i,set(o){let l=i?.call(this);n?.call(this,o),this.requestUpdate(t,l,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??zt}static _$Ei(){if(this.hasOwnProperty(O("elementProperties")))return;let t=le(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(O("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(O("properties"))){let e=this.properties,s=[...re(e),...oe(e)];for(let i of s)this.createProperty(i,e[i])}let t=this[Symbol.metadata];if(t!==null){let e=litPropertyMetadata.get(t);if(e!==void 0)for(let[s,i]of e)this.elementProperties.set(s,i)}this._$Eh=new Map;for(let[e,s]of this.elementProperties){let i=this._$Eu(e,s);i!==void 0&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let e=[];if(Array.isArray(t)){let s=new Set(t.flat(1/0).reverse());for(let i of s)e.unshift(ut(i))}else t!==void 0&&e.push(ut(t));return e}static _$Eu(t,e){let s=e.attribute;return s===!1?void 0:typeof s=="string"?s:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,e=this.constructor.elementProperties;for(let s of e.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Ct(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$ET(t,e){let s=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,s);if(i!==void 0&&s.reflect===!0){let n=(s.converter?.toAttribute!==void 0?s.converter:mt).toAttribute(e,s.type);this._$Em=t,n==null?this.removeAttribute(i):this.setAttribute(i,n),this._$Em=null}}_$AK(t,e){let s=this.constructor,i=s._$Eh.get(t);if(i!==void 0&&this._$Em!==i){let n=s.getPropertyOptions(i),o=typeof n.converter=="function"?{fromAttribute:n.converter}:n.converter?.fromAttribute!==void 0?n.converter:mt;this._$Em=i;let l=o.fromAttribute(e,n.type);this[i]=l??this._$Ej?.get(i)??l,this._$Em=null}}requestUpdate(t,e,s,i=!1,n){if(t!==void 0){let o=this.constructor;if(i===!1&&(n=this[t]),s??=o.getPropertyOptions(t),!((s.hasChanged??Pt)(n,e)||s.useDefault&&s.reflect&&n===this._$Ej?.get(t)&&!this.hasAttribute(o._$Eu(t,s))))return;this.C(t,e,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:s,reflect:i,wrapped:n},o){s&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,o??e??this[t]),n!==!0||o!==void 0)||(this._$AL.has(t)||(this.hasUpdated||s||(e=void 0),this._$AL.set(t,e)),i===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[i,n]of this._$Ep)this[i]=n;this._$Ep=void 0}let s=this.constructor.elementProperties;if(s.size>0)for(let[i,n]of s){let{wrapped:o}=n,l=this[i];o!==!0||this._$AL.has(i)||l===void 0||this.C(i,void 0,n,l)}}let t=!1,e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(e)):this._$EM()}catch(s){throw t=!1,this._$EM(),s}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(t){}firstUpdated(t){}};w.elementStyles=[],w.shadowRootOptions={mode:"open"},w[O("elementProperties")]=new Map,w[O("finalized")]=new Map,he?.({ReactiveElement:w}),(nt.reactiveElementVersions??=[]).push("2.1.2");var vt=globalThis,Ut=r=>r,at=vt.trustedTypes,Nt=at?at.createPolicy("lit-html",{createHTML:r=>r}):void 0,Bt="$lit$",E=`lit$${Math.random().toFixed(9).slice(2)}$`,Ft="?"+E,de=`<${Ft}>`,M=document,B=()=>M.createComment(""),F=r=>r===null||typeof r!="object"&&typeof r!="function",yt=Array.isArray,ce=r=>yt(r)||typeof r?.[Symbol.iterator]=="function",gt=`[ 	
\f\r]`,j=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Lt=/-->/g,Tt=/>/g,I=RegExp(`>|${gt}(?:([^\\s"'>=/]+)(${gt}*=${gt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Dt=/'/g,Ot=/"/g,Rt=/^(?:script|style|textarea|title)$/i,wt=r=>(t,...e)=>({_$litType$:r,strings:t,values:e}),a=wt(1),Ee=wt(2),Ie=wt(3),z=Symbol.for("lit-noChange"),f=Symbol.for("lit-nothing"),jt=new WeakMap,C=M.createTreeWalker(M,129);function Ht(r,t){if(!yt(r)||!r.hasOwnProperty("raw"))throw Error("invalid template strings array");return Nt!==void 0?Nt.createHTML(t):t}var ue=(r,t)=>{let e=r.length-1,s=[],i,n=t===2?"<svg>":t===3?"<math>":"",o=j;for(let l=0;l<e;l++){let p=r[l],d,g,m=-1,y=0;for(;y<p.length&&(o.lastIndex=y,g=o.exec(p),g!==null);)y=o.lastIndex,o===j?g[1]==="!--"?o=Lt:g[1]!==void 0?o=Tt:g[2]!==void 0?(Rt.test(g[2])&&(i=RegExp("</"+g[2],"g")),o=I):g[3]!==void 0&&(o=I):o===I?g[0]===">"?(o=i??j,m=-1):g[1]===void 0?m=-2:(m=o.lastIndex-g[2].length,d=g[1],o=g[3]===void 0?I:g[3]==='"'?Ot:Dt):o===Ot||o===Dt?o=I:o===Lt||o===Tt?o=j:(o=I,i=void 0);let S=o===I&&r[l+1].startsWith("/>")?" ":"";n+=o===j?p+de:m>=0?(s.push(d),p.slice(0,m)+Bt+p.slice(m)+E+S):p+E+(m===-2?l:S)}return[Ht(r,n+(r[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),s]},R=class r{constructor({strings:t,_$litType$:e},s){let i;this.parts=[];let n=0,o=0,l=t.length-1,p=this.parts,[d,g]=ue(t,e);if(this.el=r.createElement(d,s),C.currentNode=this.el.content,e===2||e===3){let m=this.el.content.firstChild;m.replaceWith(...m.childNodes)}for(;(i=C.nextNode())!==null&&p.length<l;){if(i.nodeType===1){if(i.hasAttributes())for(let m of i.getAttributeNames())if(m.endsWith(Bt)){let y=g[o++],S=i.getAttribute(m).split(E),et=/([.?@])?(.*)/.exec(y);p.push({type:1,index:n,name:et[2],strings:S,ctor:et[1]==="."?_t:et[1]==="?"?bt:et[1]==="@"?$t:N}),i.removeAttribute(m)}else m.startsWith(E)&&(p.push({type:6,index:n}),i.removeAttribute(m));if(Rt.test(i.tagName)){let m=i.textContent.split(E),y=m.length-1;if(y>0){i.textContent=at?at.emptyScript:"";for(let S=0;S<y;S++)i.append(m[S],B()),C.nextNode(),p.push({type:2,index:++n});i.append(m[y],B())}}}else if(i.nodeType===8)if(i.data===Ft)p.push({type:2,index:n});else{let m=-1;for(;(m=i.data.indexOf(E,m+1))!==-1;)p.push({type:7,index:n}),m+=E.length-1}n++}}static createElement(t,e){let s=M.createElement("template");return s.innerHTML=t,s}};function U(r,t,e=r,s){if(t===z)return t;let i=s!==void 0?e._$Co?.[s]:e._$Cl,n=F(t)?void 0:t._$litDirective$;return i?.constructor!==n&&(i?._$AO?.(!1),n===void 0?i=void 0:(i=new n(r),i._$AT(r,e,s)),s!==void 0?(e._$Co??=[])[s]=i:e._$Cl=i),i!==void 0&&(t=U(r,i._$AS(r,t.values),i,s)),t}var ft=class{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:e},parts:s}=this._$AD,i=(t?.creationScope??M).importNode(e,!0);C.currentNode=i;let n=C.nextNode(),o=0,l=0,p=s[0];for(;p!==void 0;){if(o===p.index){let d;p.type===2?d=new H(n,n.nextSibling,this,t):p.type===1?d=new p.ctor(n,p.name,p.strings,this,t):p.type===6&&(d=new xt(n,this,t)),this._$AV.push(d),p=s[++l]}o!==p?.index&&(n=C.nextNode(),o++)}return C.currentNode=M,i}p(t){let e=0;for(let s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}},H=class r{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,s,i){this.type=2,this._$AH=f,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=U(this,t,e),F(t)?t===f||t==null||t===""?(this._$AH!==f&&this._$AR(),this._$AH=f):t!==this._$AH&&t!==z&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):ce(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==f&&F(this._$AH)?this._$AA.nextSibling.data=t:this.T(M.createTextNode(t)),this._$AH=t}$(t){let{values:e,_$litType$:s}=t,i=typeof s=="number"?this._$AC(t):(s.el===void 0&&(s.el=R.createElement(Ht(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===i)this._$AH.p(e);else{let n=new ft(i,this),o=n.u(this.options);n.p(e),this.T(o),this._$AH=n}}_$AC(t){let e=jt.get(t.strings);return e===void 0&&jt.set(t.strings,e=new R(t)),e}k(t){yt(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,s,i=0;for(let n of t)i===e.length?e.push(s=new r(this.O(B()),this.O(B()),this,this.options)):s=e[i],s._$AI(n),i++;i<e.length&&(this._$AR(s&&s._$AB.nextSibling,i),e.length=i)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){let s=Ut(t).nextSibling;Ut(t).remove(),t=s}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},N=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,s,i,n){this.type=1,this._$AH=f,this._$AN=void 0,this.element=t,this.name=e,this._$AM=i,this.options=n,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=f}_$AI(t,e=this,s,i){let n=this.strings,o=!1;if(n===void 0)t=U(this,t,e,0),o=!F(t)||t!==this._$AH&&t!==z,o&&(this._$AH=t);else{let l=t,p,d;for(t=n[0],p=0;p<n.length-1;p++)d=U(this,l[s+p],e,p),d===z&&(d=this._$AH[p]),o||=!F(d)||d!==this._$AH[p],d===f?t=f:t!==f&&(t+=(d??"")+n[p+1]),this._$AH[p]=d}o&&!i&&this.j(t)}j(t){t===f?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},_t=class extends N{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===f?void 0:t}},bt=class extends N{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==f)}},$t=class extends N{constructor(t,e,s,i,n){super(t,e,s,i,n),this.type=5}_$AI(t,e=this){if((t=U(this,t,e,0)??f)===z)return;let s=this._$AH,i=t===f&&s!==f||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,n=t!==f&&(s===f||i);i&&this.element.removeEventListener(this.name,this,s),n&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},xt=class{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){U(this,t)}};var me=vt.litHtmlPolyfillSupport;me?.(R,H),(vt.litHtmlVersions??=[]).push("3.3.3");var Wt=(r,t,e)=>{let s=e?.renderBefore??t,i=s._$litPart$;if(i===void 0){let n=e?.renderBefore??null;s._$litPart$=i=new H(t.insertBefore(B(),n),n,void 0,e??{})}return i._$AI(r),i};var kt=globalThis,$=class extends w{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Wt(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return z}};$._$litElement$=!0,$.finalized=!0,kt.litElementHydrateSupport?.({LitElement:$});var ge=kt.litElementPolyfillSupport;ge?.({LitElement:$});(kt.litElementVersions??=[]).push("4.2.2");var x=["breakfast","lunch","dinner","snack"],rt=class{constructor(t){this.hass=t}call(t,e={}){return this.hass.callWS({type:`essensplaner/${t}`,...e})}data(){return this.call("data")}compat(){return this.call("compat/all")}dishCheck(t){return this.call("dish/check",{dish_id:t})}saveDish(t){return this.call("dish/save",{dish:t})}deleteDish(t){return this.call("dish/delete",{dish_id:t})}saveProfile(t){return this.call("profile/save",{profile:t})}deleteProfile(t){return this.call("profile/delete",{profile_id:t})}profileIngredients(t){return this.call("profile/ingredients",{profile_id:t})}profileGroups(t){return this.call("profile/groups",{profile_id:t})}setGroups(t,e){return this.call("profile/set_groups",{profile_id:t,excluded_groups:e})}setIngredient(t){return this.call("profile/set_ingredient",t)}parseIngredients(t){return this.call("parse_ingredients",{text:t})}plan(t,e){return this.call("plan/get",{start_date:t,days:e})}setMeal(t,e,s){return this.call("plan/set_meal",{date:t,meal_type:e,assignments:s})}choose(t,e,s,i){return this.call("plan/choose",{date:t,meal_type:e,index:s,dish_id:i})}generate(t){return this.call("plan/generate",t)}shoppingPreview(t,e){return this.call("shopping/preview",{start_date:t,days:e})}shoppingPush(t){return this.call("shopping/push",t)}imageFromUrl(t){return this.call("image/from_url",{url:t})}async uploadImage(t){let e=new FormData;e.append("file",t);let s=await this.hass.fetchWithAuth("/api/essensplaner/upload",{method:"POST",body:e}),i=await s.json();if(!s.ok)throw new Error(i.message||s.statusText);return{id:i.id,source:i.source}}subscribe(t){return this.hass.connection.subscribeMessage(t,{type:"essensplaner/subscribe"})}};function L(r){return r&&r.id?`/api/essensplaner/images/${r.id}`:null}function v(r){let t=r.getFullYear(),e=String(r.getMonth()+1).padStart(2,"0"),s=String(r.getDate()).padStart(2,"0");return`${t}-${e}-${s}`}function T(r){let[t,e,s]=r.split("-").map(Number);return new Date(t,e-1,s)}function P(r,t){let e=new Date(r);return e.setDate(e.getDate()+t),e}function Zt(r){let t=new Date(r.getFullYear(),r.getMonth(),r.getDate()),e=(t.getDay()+6)%7;return P(t,-e)}function Gt(r){let t=new Date(Date.UTC(r.getFullYear(),r.getMonth(),r.getDate())),e=t.getUTCDay()||7;t.setUTCDate(t.getUTCDate()+4-e);let s=new Date(Date.UTC(t.getUTCFullYear(),0,1));return Math.ceil(((t-s)/864e5+1)/7)}var qt={protein:"#protein",side:"#beilage",veg:"#gemuese"};function k(r){if(r==null)return"";let t=Math.round(r*100)/100;return String(t).replace(".",",")}function Kt(r){let t=[];return r.amount!==null&&r.amount!==void 0&&(t.push(k(r.amount)),r.unit&&t.push(r.unit)),t.push(r.name),qt[r.role]&&t.push(qt[r.role]),t.join(" ")}function Vt(r,t){if(r.amount===null||r.amount===void 0)return"";let e=r.amount*t;return["g","ml"].includes(r.unit)&&e>=20?e=Math.round(e/5)*5:(!r.unit||["Stk","Zehe","Dose","Pkg","Bund","Becher","Glas"].includes(r.unit))&&(e=Math.round(e*2)/2),r.unit==="g"&&e>=1e3?`${k(e/1e3)} kg`:r.unit==="ml"&&e>=1e3?`${k(e/1e3)} l`:r.unit?`${k(e)} ${r.unit}`:k(e)}var fe={title:"Essensplaner","tab.plan":"Wochenplan","tab.dishes":"Gerichte","tab.profiles":"Personen","tab.shopping":"Einkauf","meal.breakfast":"Fr\xFChst\xFCck","meal.lunch":"Mittag","meal.dinner":"Abend","meal.snack":"Snack","plan.week":"KW {week}","plan.today":"Heute","plan.generate":"Woche planen","plan.empty":"Nichts geplant","plan.add_meal":"Mahlzeit","plan.shared":"Gemeinsam: {items}","plan.servings":"{n} Port.","plan.choose":"Bitte ausw\xE4hlen","plan.or":"oder","plan.pick":"Dieses Gericht nehmen","gen.alternatives":"Alternativen pro Gericht zur Auswahl","gen.alternatives_none":"keine","gen.choose_hint":"{n} Mahlzeiten haben Alternativen \u2013 im Wochenplan mit \u2713 ausw\xE4hlen.","shop.open_choices":"{n} Mahlzeiten sind noch nicht entschieden \u2013 eingekauft wird jeweils der erste Vorschlag. Im Wochenplan mit \u2713 ausw\xE4hlen.","gen.title":"Woche planen","gen.days":"Tage und Mahlzeiten","gen.profiles":"F\xFCr wen?","gen.overwrite":"Bereits geplante Mahlzeiten neu planen (manuell gesetzte bleiben)","gen.run":"Planen","gen.done":"Plan erstellt: {n} Gerichte eingeplant.","gen.no_dish":"{day} {meal}: kein passendes Gericht f\xFCr {profiles}","slot.title":"{day} \xB7 {meal}","slot.for":"F\xFCr","slot.add":"Gericht w\xE4hlen","slot.remove":"Entfernen","slot.search":"Gericht suchen \u2026","slot.show_all_meals":"Alle Mahlzeitentypen","slot.show_unsuitable":"Auch unpassende zeigen","slot.no_profiles":"W\xE4hle zuerst mindestens eine Person.","slot.nothing":"Noch kein Gericht f\xFCr diese Mahlzeit.","dishes.search":"Suchen \u2026","dishes.new":"Neues Gericht","dishes.all_meals":"Alle","dishes.fits":"Passt f\xFCr","dishes.anyone":"Egal","dishes.count":"{n} Gerichte","dishes.none":"Keine Gerichte gefunden.","dish.minutes":"{n} Min.","dish.servings":"Portionen","dish.ingredients":"Zutaten","dish.steps":"Zubereitung","dish.source":"Quelle","dish.compat":"Vertr\xE4glichkeit","dish.edit":"Bearbeiten","edit.new_title":"Neues Gericht","edit.title":"Gericht bearbeiten","edit.name":"Name","edit.meal_types":"Mahlzeiten","edit.suitable_for":"Nur f\xFCr (keine Auswahl = alle)","edit.base_servings":"Portionen im Rezept","edit.duration":"Dauer (Minuten)","edit.tags":"Tags (durch Komma getrennt)","edit.ingredients":"Zutaten (eine pro Zeile)","edit.ingredients_help":"z. B. \u201E250 g H\xFChnerbrust #protein\u201C, \u201E150 g Reis #beilage\u201C, \u201E2 Karotten\u201C, \u201ESalz\u201C","edit.steps":"Zubereitung (ein Schritt pro Zeile)","edit.source_url":"Quelle (URL)","edit.image":"Bild","edit.upload":"Foto hochladen","edit.image_url":"Bild-URL","edit.image_from_url":"\xDCbernehmen","edit.image_remove":"Bild entfernen","edit.uploading":"Wird hochgeladen \u2026","profile.new":"Neue Person","profile.title":"Person bearbeiten","profile.name":"Name","profile.servings":"Portionen","profile.unknown":"Zutaten, die in keiner Liste stehen","profile.unknown.allow":"Erlauben","profile.unknown.warn":"Erlauben, aber warnen","profile.unknown.exclude":"Ausschlie\xDFen (nur Vertr\xE4gliches)","profile.max_duration":"Maximale Zubereitungszeit (Minuten, leer = egal)","profile.tolerated":"Vertr\xE4glich","profile.not_tolerated":"Nicht vertr\xE4glich","profile.small_amounts":"Nur in kleinen Mengen","profile.small_help":"Eine Zutat pro Zeile, optional mit H\xF6chstmenge pro Portion, z. B. \u201E10 g Butter\u201C","profile.likes":"Vorlieben","profile.dislikes":"Abneigungen","profile.list_help":"Ein Eintrag pro Zeile","profile.summary":"{tol} vertr\xE4glich \xB7 {not} nicht vertr\xE4glich \xB7 {small} kleine Mengen","profile.fitting":"{n} passende Gerichte","shop.start":"Ab","shop.days":"Tage","shop.target":"To-do-Liste","shop.skip_existing":"Was schon offen auf der Liste steht, \xFCberspringen","shop.push":"In Liste \xFCbertragen","shop.empty":"Im gew\xE4hlten Zeitraum ist nichts geplant.","shop.result":"{added} hinzugef\xFCgt, {skipped} \xFCbersprungen.","shop.no_target":"Bitte eine To-do-Liste w\xE4hlen.","shop.select_all":"Alle","shop.select_none":"Keine","common.save":"Speichern","common.cancel":"Abbrechen","common.close":"Schlie\xDFen","common.delete":"L\xF6schen","common.confirm_delete":"Wirklich l\xF6schen?","common.add":"Hinzuf\xFCgen","common.loading":"L\xE4dt \u2026","common.error":"Fehler: {msg}","status.ok":"passt","status.warn":"mit Hinweis","status.excluded":"passt nicht","reason.not_suitable":"nicht f\xFCr diese Person vorgesehen","reason.too_long":"dauert zu lange ({duration} Min.)","reason.dislike":"Abneigung: {term}","reason.not_tolerated":"{ingredient} nicht vertr\xE4glich","reason.small_amount":"{ingredient} nur in kleinen Mengen","reason.small_amount_unchecked":"{ingredient}: Menge nicht pr\xFCfbar","reason.small_amount_exceeded":"{ingredient}: {amount} {unit} pro Portion (max. {max})","reason.unknown_ingredient":"{ingredient} steht in keiner Liste","reason.no_ingredients":"keine Zutaten hinterlegt","ingr.open":"Zutaten anklicken","ingr.title":"Vertr\xE4glichkeit \xB7 {name}","ingr.search":"Zutat suchen oder neu eingeben \u2026","ingr.filter.all":"Alle","ingr.filter.unknown":"Offen","ingr.filter.tolerated":"Vertr\xE4glich","ingr.filter.small":"Nur wenig","ingr.filter.not_tolerated":"Nicht vertr\xE4glich","ingr.state.tolerated":"vertr\xE4glich","ingr.state.small":"nur in kleinen Mengen","ingr.state.not_tolerated":"nicht vertr\xE4glich","ingr.by.tolerated":"vertr\xE4glich durch \u201E{term}\u201C","ingr.by.small":"nur wenig durch \u201E{term}\u201C","ingr.by.not_tolerated":"nicht vertr\xE4glich durch \u201E{term}\u201C","ingr.count":"in {n} Gerichten","ingr.no_dish":"in keinem Gericht","ingr.limit":"H\xF6chstens pro Portion:","ingr.add":"hinzuf\xFCgen:","ingr.none":"Keine Zutaten in dieser Auswahl.","ingr.done":"Fertig","ingr.hint_exclude":"Offene Zutaten gelten f\xFCr diese Person als nicht vertr\xE4glich. Gerichte werden erst vorgeschlagen, wenn alle ihre Zutaten als vertr\xE4glich markiert sind.","groups.button":"Allergene","groups.title":"Allergene & Fleisch \xB7 {name}","groups.intro":"Schalter an = vertr\xE4gt bzw. isst die Person nicht. Alle typischen Zutaten der Gruppe gelten dann als nicht vertr\xE4glich \u2013 auch in Gerichten, die sp\xE4ter dazukommen. Einzelne Zutaten lassen sich in der Zutatenliste trotzdem mit \u2713 freigeben.","groups.allergens_title":"Allergien & Unvertr\xE4glichkeiten","groups.meat_title":"Fleisch & Fisch \u2013 isst die Person nicht","groups.affects":"betrifft {n} Zutaten deiner Gerichte","groups.affects_one":"betrifft 1 Zutat deiner Gerichte","groups.affects_none":"kommt in deinen Gerichten derzeit nicht vor","groups.show_all":"alle {n} zeigen","groups.active":"{n} ausgeschlossen","groups.back":"Zur\xFCck zur Zutatenliste","groups.bar_title":"Ausgeschlossen (Allergene & Fleisch):","groups.none":"nichts ausgeschlossen","groups.editor_title":"Allergene & Fleisch (rot = ausgeschlossen)","groups.disclaimer":"Die Gruppen sind eine Auswahlhilfe und ersetzen keine Allergenkennzeichnung verarbeiteter Produkte.","groups.meat":"Isst nicht:","groups.allergens":"Allergien & Unvertr\xE4glichkeiten:","groups.without":"ohne {group}","ingr.by_group":"nicht vertr\xE4glich durch \u201E{group}\u201C","reason.group_excluded":"{ingredient}: {group}","profile.as_text":"Vertr\xE4glichkeit als Text bearbeiten","profile.as_text_help":"Dieselben Listen wie bei \u201EZutaten anklicken\u201C, hier als Text.","card.title":"Was gibt's heute?","card.title_label":"Titel","card.tomorrow":"Was gibt's morgen?","card.nothing":"Heute ist nichts geplant.","card.not_loaded":"Essensplaner ist nicht eingerichtet."},At={title:"Meal planner","tab.plan":"Week","tab.dishes":"Dishes","tab.profiles":"People","tab.shopping":"Shopping","meal.breakfast":"Breakfast","meal.lunch":"Lunch","meal.dinner":"Dinner","meal.snack":"Snack","plan.week":"Week {week}","plan.today":"Today","plan.generate":"Plan week","plan.empty":"Nothing planned","plan.add_meal":"Meal","plan.shared":"Shared: {items}","plan.servings":"{n} serv.","plan.choose":"Please choose","plan.or":"or","plan.pick":"Take this dish","gen.alternatives":"Alternatives per dish to choose from","gen.alternatives_none":"none","gen.choose_hint":"{n} meals have alternatives \u2013 choose with \u2713 in the week plan.","shop.open_choices":"{n} meals are not decided yet \u2013 the first suggestion is used for shopping. Choose with \u2713 in the week plan.","gen.title":"Plan week","gen.days":"Days and meals","gen.profiles":"For whom?","gen.overwrite":"Re-plan meals that are already planned (manual ones are kept)","gen.run":"Plan","gen.done":"Plan created: {n} dishes planned.","gen.no_dish":"{day} {meal}: no suitable dish for {profiles}","slot.title":"{day} \xB7 {meal}","slot.for":"For","slot.add":"Choose dish","slot.remove":"Remove","slot.search":"Search dish \u2026","slot.show_all_meals":"All meal types","slot.show_unsuitable":"Show unsuitable too","slot.no_profiles":"Select at least one person first.","slot.nothing":"No dish for this meal yet.","dishes.search":"Search \u2026","dishes.new":"New dish","dishes.all_meals":"All","dishes.fits":"Suits","dishes.anyone":"Anyone","dishes.count":"{n} dishes","dishes.none":"No dishes found.","dish.minutes":"{n} min","dish.servings":"Servings","dish.ingredients":"Ingredients","dish.steps":"Preparation","dish.source":"Source","dish.compat":"Suitability","dish.edit":"Edit","edit.new_title":"New dish","edit.title":"Edit dish","edit.name":"Name","edit.meal_types":"Meals","edit.suitable_for":"Only for (none selected = everyone)","edit.base_servings":"Servings in recipe","edit.duration":"Duration (minutes)","edit.tags":"Tags (comma separated)","edit.ingredients":"Ingredients (one per line)","edit.ingredients_help":'e.g. "250 g chicken breast #protein", "150 g rice #side", "2 carrots", "salt"',"edit.steps":"Preparation (one step per line)","edit.source_url":"Source (URL)","edit.image":"Image","edit.upload":"Upload photo","edit.image_url":"Image URL","edit.image_from_url":"Use","edit.image_remove":"Remove image","edit.uploading":"Uploading \u2026","profile.new":"New person","profile.title":"Edit person","profile.name":"Name","profile.servings":"Servings","profile.unknown":"Ingredients not in any list","profile.unknown.allow":"Allow","profile.unknown.warn":"Allow with warning","profile.unknown.exclude":"Exclude (tolerated only)","profile.max_duration":"Maximum preparation time (minutes, empty = any)","profile.tolerated":"Tolerated","profile.not_tolerated":"Not tolerated","profile.small_amounts":"Only in small amounts","profile.small_help":'One ingredient per line, optionally with a maximum per serving, e.g. "10 g butter"',"profile.likes":"Likes","profile.dislikes":"Dislikes","profile.list_help":"One entry per line","profile.summary":"{tol} tolerated \xB7 {not} not tolerated \xB7 {small} small amounts","profile.fitting":"{n} suitable dishes","shop.start":"From","shop.days":"Days","shop.target":"To-do list","shop.skip_existing":"Skip items already open on the list","shop.push":"Send to list","shop.empty":"Nothing planned in this period.","shop.result":"{added} added, {skipped} skipped.","shop.no_target":"Please choose a to-do list.","shop.select_all":"All","shop.select_none":"None","common.save":"Save","common.cancel":"Cancel","common.close":"Close","common.delete":"Delete","common.confirm_delete":"Really delete?","common.add":"Add","common.loading":"Loading \u2026","common.error":"Error: {msg}","status.ok":"suitable","status.warn":"with note","status.excluded":"not suitable","reason.not_suitable":"not intended for this person","reason.too_long":"takes too long ({duration} min)","reason.dislike":"dislike: {term}","reason.not_tolerated":"{ingredient} not tolerated","reason.small_amount":"{ingredient} only in small amounts","reason.small_amount_unchecked":"{ingredient}: amount cannot be checked","reason.small_amount_exceeded":"{ingredient}: {amount} {unit} per serving (max {max})","reason.unknown_ingredient":"{ingredient} is not in any list","reason.no_ingredients":"no ingredients","ingr.open":"Tick ingredients","ingr.title":"Tolerances \xB7 {name}","ingr.search":"Search or enter new ingredient \u2026","ingr.filter.all":"All","ingr.filter.unknown":"Open","ingr.filter.tolerated":"Tolerated","ingr.filter.small":"Small amounts","ingr.filter.not_tolerated":"Not tolerated","ingr.state.tolerated":"tolerated","ingr.state.small":"only in small amounts","ingr.state.not_tolerated":"not tolerated","ingr.by.tolerated":'tolerated via "{term}"',"ingr.by.small":'small amounts via "{term}"',"ingr.by.not_tolerated":'not tolerated via "{term}"',"ingr.count":"in {n} dishes","ingr.no_dish":"in no dish","ingr.limit":"Maximum per serving:","ingr.add":"add:","ingr.none":"No ingredients in this selection.","ingr.done":"Done","ingr.hint_exclude":"Open ingredients count as not tolerated for this person. Dishes are only suggested once all their ingredients are marked as tolerated.","groups.button":"Allergens","groups.title":"Allergens & meat \xB7 {name}","groups.intro":"Switch on = this person does not tolerate or eat it. All typical ingredients of the group then count as not tolerated \u2013 also in dishes added later. Single ingredients can still be allowed in the ingredient list with \u2713.","groups.allergens_title":"Allergies & intolerances","groups.meat_title":"Meat & fish \u2013 does not eat","groups.affects":"affects {n} ingredients of your dishes","groups.affects_one":"affects 1 ingredient of your dishes","groups.affects_none":"currently not in any of your dishes","groups.show_all":"show all {n}","groups.active":"{n} excluded","groups.back":"Back to ingredient list","groups.bar_title":"Excluded (allergens & meat):","groups.none":"nothing excluded","groups.editor_title":"Allergens & meat (red = excluded)","groups.disclaimer":"The groups are a selection aid and do not replace allergen labelling of processed products.","groups.meat":"Does not eat:","groups.allergens":"Allergies & intolerances:","groups.without":"no {group}","ingr.by_group":'not tolerated via "{group}"',"reason.group_excluded":"{ingredient}: {group}","profile.as_text":"Edit tolerances as text","profile.as_text_help":'The same lists as in "Tick ingredients", as text.',"card.title":"What's for today?","card.title_label":"Title","card.tomorrow":"What's for tomorrow?","card.nothing":"Nothing planned for today.","card.not_loaded":"Meal planner is not set up."},_e={de:fe,en:At};function ot(r,t,e={}){let s=r&&r.language&&r.language.split("-")[0]||"en",n=(_e[s]||At)[t]??At[t]??t;for(let[o,l]of Object.entries(e))n=n.replaceAll(`{${o}}`,String(l));return n}function A(r,t){let e=r&&r.language||"de";return t.toLocaleDateString(e,{weekday:"short",day:"numeric",month:"numeric"})}var b=u`
  :host {
    --ep-radius: var(--ha-card-border-radius, 12px);
    --ep-gap: 12px;
    --ep-ok: var(--success-color, #43a047);
    --ep-warn: var(--warning-color, #ffa600);
    --ep-bad: var(--error-color, #db4437);
    color: var(--primary-text-color);
    font-family: var(--paper-font-body1_-_font-family, inherit);
  }
  * {
    box-sizing: border-box;
  }
  .card {
    background: var(--card-background-color, #fff);
    border-radius: var(--ep-radius);
    box-shadow: var(--ha-card-box-shadow, 0 1px 3px rgba(0, 0, 0, 0.12));
    border: var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--divider-color, #e0e0e0));
  }
  button {
    font: inherit;
    cursor: pointer;
  }
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 40px;
    padding: 0 16px;
    border-radius: 20px;
    border: none;
    background: var(--primary-color);
    color: var(--text-primary-color, #fff);
    font-weight: 500;
  }
  .btn[disabled] {
    opacity: 0.5;
    cursor: default;
  }
  .btn.flat {
    background: transparent;
    color: var(--primary-color);
  }
  .btn.outline {
    background: transparent;
    color: var(--primary-color);
    border: 1px solid var(--primary-color);
  }
  .btn.danger {
    background: var(--ep-bad);
    color: #fff;
  }
  .icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: none;
    background: transparent;
    color: var(--secondary-text-color);
    flex: none;
  }
  .icon-btn:hover {
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.05));
  }
  input[type="text"],
  input[type="search"],
  input[type="number"],
  input[type="url"],
  input[type="date"],
  select,
  textarea {
    width: 100%;
    font: inherit;
    font-size: 16px; /* verhindert Zoom auf iOS */
    color: var(--primary-text-color);
    background: var(--input-fill-color, var(--secondary-background-color, #f5f5f5));
    border: 1px solid var(--divider-color, #ccc);
    border-radius: 8px;
    padding: 10px 12px;
  }
  textarea {
    min-height: 96px;
    resize: vertical;
    line-height: 1.4;
  }
  input:focus,
  select:focus,
  textarea:focus {
    outline: 2px solid var(--primary-color);
    outline-offset: -1px;
  }
  label.field {
    display: block;
    margin-bottom: 14px;
  }
  label.field > span {
    display: block;
    font-size: 13px;
    color: var(--secondary-text-color);
    margin-bottom: 4px;
  }
  .help {
    font-size: 12px;
    color: var(--secondary-text-color);
    margin-top: 4px;
  }
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 12px;
    min-height: 32px;
    border-radius: 16px;
    border: 1px solid var(--divider-color, #ccc);
    background: transparent;
    color: var(--primary-text-color);
    font-size: 14px;
  }
  .chip.on {
    background: var(--primary-color);
    border-color: var(--primary-color);
    color: var(--text-primary-color, #fff);
  }
  .chip.on.bad {
    background: var(--ep-bad);
    border-color: var(--ep-bad);
  }
  .chip.off-strike {
    text-decoration: line-through;
    color: var(--secondary-text-color);
  }
  .group-block {
    margin-bottom: 10px;
  }
  .group-title {
    font-size: 13px;
    color: var(--secondary-text-color);
    margin-bottom: 6px;
  }
  .chip.small {
    min-height: 22px;
    padding: 1px 8px;
    font-size: 12px;
  }
  .row {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .spacer {
    flex: 1;
  }
  .muted {
    color: var(--secondary-text-color);
  }
  .error {
    color: var(--ep-bad);
  }
  .status-ok {
    color: var(--ep-ok);
  }
  .status-warn {
    color: var(--ep-warn);
  }
  .status-excluded {
    color: var(--ep-bad);
  }
  .dot {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    font-size: 11px;
    font-weight: 600;
    color: #fff;
  }
  .dot.ok {
    background: var(--ep-ok);
  }
  .dot.warn {
    background: var(--ep-warn);
  }
  .dot.excluded {
    background: var(--ep-bad);
    opacity: 0.6;
  }
  .thumb {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    object-fit: cover;
    flex: none;
    background: var(--secondary-background-color, #eee);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--secondary-text-color);
  }
  ha-icon {
    --mdc-icon-size: 22px;
  }
`,Yt=u`
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .dialog {
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color);
    width: min(640px, 100%);
    max-height: min(90vh, 100%);
    border-radius: var(--ep-radius, 12px);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .dialog header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 8px 8px 20px;
    border-bottom: 1px solid var(--divider-color, #e0e0e0);
  }
  .dialog header h2 {
    flex: 1;
    margin: 0;
    font-size: 18px;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .dialog .body {
    flex: 1;
    min-height: 0;
    padding: 16px 20px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
  .dialog footer {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    flex-wrap: wrap;
    padding: 12px 20px calc(12px + env(safe-area-inset-bottom));
    border-top: 1px solid var(--divider-color, #e0e0e0);
  }
  @media (max-width: 600px) {
    .backdrop {
      align-items: stretch;
    }
    .dialog {
      max-height: 100%;
      height: 100%;
      border-radius: 0;
    }
  }
`;var _=class extends ${t(t,e){return ot(this.hass,t,e)}get profiles(){return this.data&&this.data.profiles||[]}get dishes(){return this.data&&this.data.dishes||[]}dish(t){return this.dishes.find(e=>e.id===t)}profileName(t){let e=this.profiles.find(s=>s.id===t);return e?e.name:"?"}get groups(){return this.data&&this.data.groups||[]}groupLabel(t){let e=this.groups.find(i=>i.id===t);return e?(this.hass&&this.hass.language||"de").startsWith("de")?e.label_de:e.label_en:t}groupChips(t,e,s=!1){let i=this.groups.filter(o=>o.kind==="meat"),n=this.groups.filter(o=>o.kind==="allergen");return a`
      <div class="group-block">
        <div class="group-title">${this.t("groups.allergens")}</div>
        <div class="chips">
          ${n.map(o=>{let l=t.includes(o.id);return a`<button class="chip ${l?"on bad":""}" ?disabled=${s}
              aria-pressed=${l} @click=${()=>e(o.id)}>${l?"\u2715 ":""}${this.groupLabel(o.id)}</button>`})}
        </div>
      </div>
      <div class="group-block">
        <div class="group-title">${this.t("groups.meat")}</div>
        <div class="chips">
          ${i.map(o=>{let l=t.includes(o.id);return a`<button class="chip ${l?"on bad":""}" ?disabled=${s}
              aria-pressed=${l} @click=${()=>e(o.id)}>${l?"\u2715 ":""}${this.groupLabel(o.id)}</button>`})}
        </div>
      </div>
    `}thumb(t,e=48){let s=t&&L(t.image),i=`width:${e}px;height:${e}px`;return s?a`<img class="thumb" style=${i} src=${s} alt="" loading="lazy" />`:a`<span class="thumb" style=${i}><ha-icon icon="mdi:silverware-fork-knife"></ha-icon></span>`}compatDots(t){let e=this.compat&&this.compat[t]||{};return a`${this.profiles.map(s=>a`<span
        class="dot ${e[s.id]||"excluded"}"
        title="${s.name}: ${this.t(`status.${e[s.id]||"excluded"}`)}"
        >${s.name.slice(0,1).toUpperCase()}</span
      >`)}`}emit(t,e={}){this.dispatchEvent(new CustomEvent(t,{detail:e,bubbles:!0,composed:!0}))}};h(_,"properties",{hass:{attribute:!1},api:{attribute:!1},data:{attribute:!1},compat:{attribute:!1}});var W=class extends _{constructor(){super(),this._offset=0,this._days=null,this._extraMeals={},this._loadedKey=null}get _start(){return P(Zt(new Date),this._offset*7)}updated(t){let e=`${this.revision}|${this._offset}`;this.api&&e!==this._loadedKey&&(this._loadedKey=e,this._load())}async _load(){let t=v(this._start);try{let e=await this.api.plan(t,7);t===v(this._start)&&(this._days=e)}catch{this._days={}}}_shift(t){this._offset+=t,this._days=null}_mealsFor(t,e){let s=this.data&&this.data.default_meal_types||["lunch","dinner"],i=this._extraMeals[t]||[];return x.filter(n=>s.includes(n)||e[n]||i.includes(n))}_addMeal(t,e){this._extraMeals={...this._extraMeals,[t]:[...this._extraMeals[t]||[],e]},this._editSlot(t,e,[])}_editSlot(t,e,s){this.emit("ep-open",{type:"slot",date:t,mealType:e,assignments:s})}render(){let t=this._start,e=P(t,6),s=v(new Date);return a`
      <div class="weekbar">
        <button class="icon-btn" @click=${()=>this._shift(-1)} aria-label="prev">
          <ha-icon icon="mdi:chevron-left"></ha-icon>
        </button>
        <div class="week">
          <div class="kw">${this.t("plan.week",{week:Gt(t)})}</div>
          <div class="muted range">${A(this.hass,t)} – ${A(this.hass,e)}</div>
        </div>
        <button class="icon-btn" @click=${()=>this._shift(1)} aria-label="next">
          <ha-icon icon="mdi:chevron-right"></ha-icon>
        </button>
        <span class="spacer"></span>
        <button class="btn" @click=${()=>this.emit("ep-open",{type:"generate",start:v(t)})}>
          <ha-icon icon="mdi:auto-fix"></ha-icon>${this.t("plan.generate")}
        </button>
      </div>
      ${this._days?a`<div class="days">
            ${[0,1,2,3,4,5,6].map(i=>{let n=P(t,i),o=v(n);return this._renderDay(o,n,this._days[o]||{},o===s)})}
          </div>`:a`<p class="muted center">${this.t("common.loading")}</p>`}
    `}_renderDay(t,e,s,i){let n=this._mealsFor(t,s),o=x.filter(l=>!n.includes(l));return a`
      <section class="card day ${i?"today":""}">
        <h3>
          ${A(this.hass,e)}
          ${i?a`<span class="chip small on">${this.t("plan.today")}</span>`:""}
        </h3>
        ${n.map(l=>this._renderMeal(t,l,s[l]))}
        ${o.length?a`<div class="chips add">
              ${o.map(l=>a`<button class="chip small" @click=${()=>this._addMeal(t,l)}>
                  + ${this.t(`meal.${l}`)}
                </button>`)}
            </div>`:""}
      </section>
    `}_renderMeal(t,e,s){let i=s&&s.assignments||[];return a`
      <div class="meal">
        <div class="meal-head">
          <span class="meal-name">${this.t(`meal.${e}`)}</span>
          ${s&&s.shared_base&&s.shared_base.length&&i.length>1?a`<span class="shared">${this.t("plan.shared",{items:s.shared_base.join(", ")})}</span>`:""}
          <span class="spacer"></span>
          <button class="icon-btn small" @click=${()=>this._editSlot(t,e,i)} aria-label="edit">
            <ha-icon icon=${i.length?"mdi:pencil":"mdi:plus"}></ha-icon>
          </button>
        </div>
        ${i.length?i.map((n,o)=>!n.chosen&&n.alternative_dishes&&n.alternative_dishes.length?this._renderChoice(t,e,o,n):this._renderAssignment(n)):a`<button class="empty" @click=${()=>this._editSlot(t,e,[])}>
              ${this.t("plan.empty")}
            </button>`}
      </div>
    `}async _choose(t,e,s,i){this._choosing=`${t}|${e}|${s}`,this.requestUpdate();try{await this.api.choose(t,e,s,i)}finally{this._choosing=null,this.requestUpdate()}}_renderChoice(t,e,s,i){let n=this._choosing===`${t}|${e}|${s}`,o=[{dish_id:i.dish_id,dish_name:i.dish_name},...i.alternative_dishes];return a`
      <div class="choice">
        <div class="choice-head">
          <span class="choice-title">${this.t("plan.choose")}</span>
          <span class="who">
            ${i.profiles.map(l=>a`<span class="chip small">${this.profileName(l)}</span>`)}
          </span>
        </div>
        ${o.map((l,p)=>a`
            ${p?a`<div class="or">${this.t("plan.or")}</div>`:""}
            <div class="option">
              <button class="assignment"
                @click=${()=>this.emit("ep-open",{type:"recipe",dishId:l.dish_id,servings:i.servings})}>
                ${this.thumb(this.dish(l.dish_id),40)}
                <span class="text"><span class="dish-name">${l.dish_name}</span></span>
              </button>
              <button class="pick" ?disabled=${n} @click=${()=>this._choose(t,e,s,l.dish_id)}
                aria-label="${this.t("plan.pick")}: ${l.dish_name}" title=${this.t("plan.pick")}>
                ✓
              </button>
            </div>
          `)}
      </div>
    `}_renderAssignment(t){let e=this.dish(t.dish_id);return a`
      <button
        class="assignment"
        @click=${()=>this.emit("ep-open",{type:"recipe",dishId:t.dish_id,servings:t.servings})}
      >
        ${this.thumb(e,44)}
        <span class="text">
          <span class="dish-name">${t.dish_name||"?"}</span>
          <span class="who">
            ${t.profiles.map(s=>a`<span class="chip small">${this.profileName(s)}</span>`)}
            <span class="muted">${this.t("plan.servings",{n:t.servings})}</span>
          </span>
        </span>
      </button>
    `}};h(W,"properties",{..._.properties,revision:{type:Number},_offset:{state:!0},_days:{state:!0},_extraMeals:{state:!0}}),h(W,"styles",[b,u`
      .weekbar {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-bottom: 12px;
        flex-wrap: wrap;
      }
      .week {
        text-align: center;
        min-width: 120px;
      }
      .kw {
        font-weight: 600;
      }
      .range {
        font-size: 13px;
      }
      .center {
        text-align: center;
      }
      .days {
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      }
      .day {
        padding: 12px;
      }
      .day.today {
        border-color: var(--primary-color);
        border-width: 2px;
      }
      h3 {
        margin: 0 0 8px;
        font-size: 16px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .meal {
        border-top: 1px solid var(--divider-color, #eee);
        padding: 6px 0;
      }
      .meal-head {
        display: flex;
        align-items: center;
        gap: 8px;
        min-height: 36px;
      }
      .meal-name {
        font-size: 13px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--secondary-text-color);
      }
      .shared {
        font-size: 12px;
        color: var(--ep-ok);
      }
      .icon-btn.small {
        width: 36px;
        height: 36px;
      }
      .assignment,
      .empty {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        padding: 6px 4px;
        border: none;
        background: transparent;
        color: inherit;
        text-align: left;
        border-radius: 8px;
      }
      .assignment:hover,
      .empty:hover {
        background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
      }
      .empty {
        color: var(--secondary-text-color);
        font-style: italic;
        min-height: 40px;
      }
      .text {
        display: flex;
        flex-direction: column;
        gap: 3px;
        min-width: 0;
      }
      .dish-name {
        font-weight: 500;
      }
      .who {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        align-items: center;
        font-size: 12px;
      }
      .add {
        margin-top: 6px;
      }
      .choice {
        border: 1px dashed var(--primary-color);
        border-radius: 10px;
        padding: 6px 8px;
        margin: 4px 0;
      }
      .choice-head {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
        margin-bottom: 2px;
      }
      .choice-title {
        font-size: 12px;
        font-weight: 600;
        color: var(--primary-color);
      }
      .option {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .option .assignment {
        flex: 1;
        min-width: 0;
      }
      .or {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--secondary-text-color);
        margin: 0 0 0 54px;
      }
      .pick {
        flex: none;
        width: 44px;
        height: 40px;
        border-radius: 10px;
        border: 1px solid var(--ep-ok);
        background: transparent;
        color: var(--ep-ok);
        font-size: 18px;
        font-weight: 700;
      }
      .pick:hover {
        background: var(--ep-ok);
        color: #fff;
      }
      .pick[disabled] {
        opacity: 0.5;
      }
      @media (max-width: 600px) {
        .btn {
          flex: 1 0 100%;
        }
      }
    `]);customElements.define("ep-plan-view",W);var lt=60,q=class extends _{constructor(){super(),this._query="",this._meal="",this._fits="",this._limit=lt}get _filtered(){let t=this._query.toLowerCase().split(/\s+/).filter(Boolean);return this.dishes.filter(e=>!this._meal||e.meal_types.includes(this._meal)).filter(e=>{if(!this._fits)return!0;let s=(this.compat[e.id]||{})[this._fits];return s==="ok"||s==="warn"}).filter(e=>{if(!t.length)return!0;let s=[e.name,...e.tags,...e.ingredients.map(i=>i.name)].join(" ").toLowerCase();return t.every(i=>s.includes(i))}).sort((e,s)=>e.name.localeCompare(s.name,"de"))}_setQuery(t){this._query=t.target.value,this._limit=lt}render(){let t=this._filtered;return a`
      <div class="filters">
        <input type="search" .value=${this._query} @input=${this._setQuery} placeholder=${this.t("dishes.search")} />
        <div class="row wrap">
          <div class="chips">
            <button class="chip ${this._meal?"":"on"}" @click=${()=>this._meal=""}>
              ${this.t("dishes.all_meals")}
            </button>
            ${x.map(e=>a`<button class="chip ${this._meal===e?"on":""}" @click=${()=>this._meal=e}>
                ${this.t(`meal.${e}`)}
              </button>`)}
          </div>
          <span class="spacer"></span>
          <label class="fits">
            <span class="muted">${this.t("dishes.fits")}</span>
            <select @change=${e=>this._fits=e.target.value}>
              <option value="">${this.t("dishes.anyone")}</option>
              ${this.profiles.map(e=>a`<option value=${e.id} ?selected=${this._fits===e.id}>${e.name}</option>`)}
            </select>
          </label>
        </div>
        <div class="row">
          <span class="muted">${this.t("dishes.count",{n:t.length})}</span>
          <span class="spacer"></span>
          <button class="btn" @click=${()=>this.emit("ep-open",{type:"dish",dishId:null})}>
            <ha-icon icon="mdi:plus"></ha-icon>${this.t("dishes.new")}
          </button>
        </div>
      </div>
      ${t.length?a`<div class="grid">
            ${t.slice(0,this._limit).map(e=>this._renderDish(e))}
          </div>`:a`<p class="muted">${this.t("dishes.none")}</p>`}
      ${t.length>this._limit?a`<div class="more">
            <button class="btn outline" @click=${()=>this._limit+=lt}>
              + ${Math.min(lt,t.length-this._limit)}
            </button>
          </div>`:""}
    `}_renderDish(t){return a`
      <button class="card dish" @click=${()=>this.emit("ep-open",{type:"recipe",dishId:t.id})}>
        ${this.thumb(t,64)}
        <span class="info">
          <span class="name">${t.name}</span>
          <span class="meta muted">
            ${t.duration_min?this.t("dish.minutes",{n:t.duration_min}):""}
            ${t.meal_types.map(e=>this.t(`meal.${e}`)).join(" \xB7 ")}
          </span>
          <span class="dots">${this.compatDots(t.id)}</span>
        </span>
      </button>
    `}};h(q,"properties",{..._.properties,_query:{state:!0},_meal:{state:!0},_fits:{state:!0},_limit:{state:!0}}),h(q,"styles",[b,u`
      .filters {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 12px;
      }
      .wrap {
        flex-wrap: wrap;
      }
      .fits {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .fits select {
        width: auto;
        min-width: 140px;
      }
      .grid {
        display: grid;
        gap: 10px;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      }
      .dish {
        display: flex;
        gap: 12px;
        align-items: center;
        padding: 10px;
        text-align: left;
        color: inherit;
        width: 100%;
      }
      .info {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
      }
      .name {
        font-weight: 500;
      }
      .meta {
        font-size: 12px;
      }
      .dots {
        display: flex;
        gap: 4px;
      }
      .more {
        text-align: center;
        margin-top: 12px;
      }
    `]);customElements.define("ep-dishes-view",q);var pt=class extends _{_fitting(t){return Object.values(this.compat||{}).filter(e=>e[t]==="ok"||e[t]==="warn").length}render(){return a`
      <div class="row top">
        <span class="spacer"></span>
        <button class="btn" @click=${()=>this.emit("ep-open",{type:"profile",profileId:null})}>
          <ha-icon icon="mdi:account-plus"></ha-icon>${this.t("profile.new")}
        </button>
      </div>
      <div class="grid">
        ${this.profiles.map(t=>a`
            <div class="card profile">
              <span class="avatar">${t.name.slice(0,1).toUpperCase()}</span>
              <span class="info">
                <span class="name">${t.name}</span>
                <span class="muted small">
                  ${this.t("profile.summary",{tol:t.tolerated.length,not:t.not_tolerated.length,small:t.small_amounts.length})}
                </span>
                ${(t.excluded_groups||[]).length?a`<span class="chips">${t.excluded_groups.map(e=>a`<span class="chip small">${this.t("groups.without",{group:this.groupLabel(e)})}</span>`)}</span>`:""}
                <span class="small">
                  ${this.t(`profile.unknown.${t.unknown_ingredients}`)} ·
                  <strong>${this.t("profile.fitting",{n:this._fitting(t.id)})}</strong>
                </span>
                <span class="actions">
                  <button class="btn" @click=${()=>this.emit("ep-open",{type:"ingredients",profileId:t.id})}>
                    <ha-icon icon="mdi:format-list-checks"></ha-icon>${this.t("ingr.open")}
                  </button>
                  <button class="btn outline" @click=${()=>this.emit("ep-open",{type:"groups",profileId:t.id})}>
                    <ha-icon icon="mdi:alert-circle-outline"></ha-icon>${this.t("groups.button")}
                  </button>
                  <button class="btn flat" @click=${()=>this.emit("ep-open",{type:"profile",profileId:t.id})}>
                    <ha-icon icon="mdi:pencil"></ha-icon>${this.t("dish.edit")}
                  </button>
                </span>
              </span>
            </div>
          `)}
      </div>
    `}};h(pt,"styles",[b,u`
      .top {
        margin-bottom: 12px;
      }
      .grid {
        display: grid;
        gap: 10px;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      }
      .profile {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 14px;
        text-align: left;
        color: inherit;
        width: 100%;
      }
      .avatar {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 18px;
        flex: none;
      }
      .info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 3px;
        min-width: 0;
      }
      .name {
        font-weight: 500;
        font-size: 16px;
      }
      .small {
        font-size: 13px;
      }
      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 8px;
      }
    `]);customElements.define("ep-profiles-view",pt);var Z=class extends _{constructor(){super(),this._start=v(new Date),this._days=7,this._items=null,this._excluded=new Set,this._target=null,this._skip=!0,this._busy=!1,this._message=null,this._open=0,this._loadedKey=null}get _todoLists(){return Object.keys(this.hass&&this.hass.states||{}).filter(t=>t.startsWith("todo.")).sort()}updated(){let t=`${this.revision}|${this._start}|${this._days}`;this.api&&t!==this._loadedKey&&(this._loadedKey=t,this._load()),this._target===null&&this.data&&(this._target=this.data.shopping_list||this._todoLists[0]||"")}async _load(){try{let[t,e]=await Promise.all([this.api.shoppingPreview(this._start,this._days),this.api.plan(this._start,this._days)]);this._items=t,this._open=Object.values(e).flatMap(s=>Object.values(s)).flatMap(s=>s.assignments).filter(s=>!s.chosen).length}catch(t){this._items=[],this._message={error:!0,text:this.t("common.error",{msg:t.message})}}}_toggle(t){let e=new Set(this._excluded);e.has(t)?e.delete(t):e.add(t),this._excluded=e}_selectAll(t){this._excluded=t?new Set:new Set((this._items||[]).map(e=>e.key))}async _push(){if(!this._target){this._message={error:!0,text:this.t("shop.no_target")};return}this._busy=!0,this._message=null;try{let t=await this.api.shoppingPush({start_date:this._start,days:this._days,entity_id:this._target,skip_existing:this._skip,keys:this._items.filter(e=>!this._excluded.has(e.key)).map(e=>e.key)});this._message={text:this.t("shop.result",{added:t.added.length,skipped:t.skipped.length})}}catch(t){this._message={error:!0,text:this.t("common.error",{msg:t.message})}}this._busy=!1}_name(t){let e=this.hass.states[t];return e&&e.attributes.friendly_name||t}render(){let t=this._items,e=t?t.filter(s=>!this._excluded.has(s.key)).length:0;return a`
      <div class="card settings">
        <div class="row wrap">
          <label class="field grow">
            <span>${this.t("shop.start")}</span>
            <input type="date" .value=${this._start} @change=${s=>this._start=s.target.value||this._start} />
          </label>
          <label class="field days">
            <span>${this.t("shop.days")}</span>
            <select @change=${s=>this._days=Number(s.target.value)}>
              ${[1,2,3,4,5,6,7,10,14].map(s=>a`<option value=${s} ?selected=${s===this._days}>${s}</option>`)}
            </select>
          </label>
        </div>
        <label class="field">
          <span>${this.t("shop.target")}</span>
          <select @change=${s=>this._target=s.target.value}>
            ${this._todoLists.map(s=>a`<option value=${s} ?selected=${s===this._target}>${this._name(s)}</option>`)}
          </select>
        </label>
        <label class="row check">
          <input type="checkbox" .checked=${this._skip} @change=${s=>this._skip=s.target.checked} />
          <span>${this.t("shop.skip_existing")}</span>
        </label>
        <div class="row">
          ${this._message?a`<span class=${this._message.error?"error":"status-ok"}>${this._message.text}</span>`:""}
          <span class="spacer"></span>
          <button class="btn" ?disabled=${this._busy||!e} @click=${this._push}>
            <ha-icon icon="mdi:cart-arrow-down"></ha-icon>${this.t("shop.push")} (${e})
          </button>
        </div>
      </div>
      ${this._open?a`<p class="open-hint">${this.t("shop.open_choices",{n:this._open})}</p>`:""}
      ${t?t.length?a`
            <div class="row select">
              <button class="chip small" @click=${()=>this._selectAll(!0)}>${this.t("shop.select_all")}</button>
              <button class="chip small" @click=${()=>this._selectAll(!1)}>${this.t("shop.select_none")}</button>
            </div>
            <ul class="card list">
              ${t.map(s=>a`<li>
                  <label class="row item">
                    <input type="checkbox" .checked=${!this._excluded.has(s.key)} @change=${()=>this._toggle(s.key)} />
                    <span class="text">
                      <span class="name">${s.name}</span>
                      <span class="muted small">${s.dishes.join(", ")}</span>
                    </span>
                    <span class="amount">${s.amount_text}</span>
                  </label>
                </li>`)}
            </ul>
          `:a`<p class="muted">${this.t("shop.empty")}</p>`:a`<p class="muted">${this.t("common.loading")}</p>`}
    `}};h(Z,"properties",{..._.properties,revision:{type:Number},_start:{state:!0},_days:{state:!0},_items:{state:!0},_excluded:{state:!0},_target:{state:!0},_skip:{state:!0},_busy:{state:!0},_message:{state:!0},_open:{state:!0}}),h(Z,"styles",[b,u`
      .settings {
        padding: 14px;
        margin-bottom: 12px;
      }
      .wrap {
        flex-wrap: wrap;
        align-items: flex-end;
      }
      .grow {
        flex: 1 1 180px;
      }
      .days {
        flex: 0 0 110px;
      }
      .check {
        margin-bottom: 12px;
      }
      input[type="checkbox"] {
        width: 22px;
        height: 22px;
        flex: none;
        accent-color: var(--primary-color);
      }
      .select {
        margin-bottom: 8px;
      }
      .open-hint {
        background: var(--secondary-background-color, #f3f3f3);
        border-left: 4px solid var(--ep-warn);
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 13px;
      }
      .list {
        list-style: none;
        margin: 0;
        padding: 0;
      }
      .list li + li {
        border-top: 1px solid var(--divider-color, #eee);
      }
      .item {
        padding: 10px 14px;
        min-height: 52px;
      }
      .text {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .small {
        font-size: 12px;
      }
      .amount {
        font-weight: 500;
        white-space: nowrap;
      }
    `]);customElements.define("ep-shopping-view",Z);var c=class extends _{constructor(){super(),this._onKey=t=>{t.key==="Escape"&&this.close()}}connectedCallback(){super.connectedCallback(),window.addEventListener("keydown",this._onKey)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("keydown",this._onKey)}close(){this.emit("ep-close")}shell(t,e,s=""){return a`
      <div class="backdrop" @click=${i=>i.target===i.currentTarget&&this.close()}>
        <div class="dialog" role="dialog" aria-modal="true" aria-label=${t}>
          <header>
            <h2>${t}</h2>
            <button class="icon-btn" @click=${()=>this.close()} aria-label=${this.t("common.close")}>
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </header>
          <div class="body">${e}</div>
          ${s?a`<footer>${s}</footer>`:""}
        </div>
      </div>
    `}};h(c,"styles",[b,Yt]);var G=class extends c{constructor(){super(),this._servings=null,this._check=null,this._checkedId=null}updated(t){this.dishId&&this.dishId!==this._checkedId&&this.api&&(this._checkedId=this.dishId,this._servings=null,this.api.dishCheck(this.dishId).then(e=>this._check=e).catch(()=>this._check={}))}_reason(t){return this.t(`reason.${t.code}`,t.group?{...t,group:this.groupLabel(t.group)}:t)}render(){let t=this.dish(this.dishId);if(!t)return"";let e=this._servings??this.servings??t.base_servings,s=e/(t.base_servings||1),i=L(t.image),n=a`
      ${i?a`<img class="hero" src=${i} alt="" />`:""}
      <div class="meta row">
        ${t.duration_min?a`<span class="row"><ha-icon icon="mdi:timer-outline"></ha-icon>${this.t("dish.minutes",{n:t.duration_min})}</span>`:""}
        <span class="spacer"></span>
        <span class="muted">${this.t("dish.servings")}</span>
        <button class="icon-btn" @click=${()=>this._servings=Math.max(.5,e-(e>1?1:.5))}>
          <ha-icon icon="mdi:minus"></ha-icon>
        </button>
        <strong>${String(e).replace(".",",")}</strong>
        <button class="icon-btn" @click=${()=>this._servings=e+1}>
          <ha-icon icon="mdi:plus"></ha-icon>
        </button>
      </div>
      ${t.tags.length?a`<div class="chips">${t.tags.map(l=>a`<span class="chip small">${l}</span>`)}</div>`:""}

      <h3>${this.t("dish.ingredients")}</h3>
      <ul class="ingredients">
        ${t.ingredients.map(l=>a`<li><span class="amount">${Vt(l,s)}</span><span>${l.name}</span></li>`)}
      </ul>

      ${t.steps.length?a`<h3>${this.t("dish.steps")}</h3>
            <ol class="steps">
              ${t.steps.map(l=>a`<li>${l}</li>`)}
            </ol>`:""}
      ${t.source_url?a`<p><a href=${t.source_url} target="_blank" rel="noopener">${this.t("dish.source")}</a></p>`:""}

      <h3>${this.t("dish.compat")}</h3>
      ${this._check?this.profiles.map(l=>{let p=this._check[l.id]||{status:"excluded",reasons:[]},d=p.reasons.filter(g=>g.status!=="ok");return a`<div class="compat">
              <div class="row">
                <span class="dot ${p.status}">${l.name.slice(0,1).toUpperCase()}</span>
                <strong>${l.name}</strong>
                <span class="status-${p.status}">${this.t(`status.${p.status}`)}</span>
              </div>
              ${d.length?a`<ul class="reasons">
                    ${d.map(g=>a`<li class="status-${g.status}">${this._reason(g)}</li>`)}
                  </ul>`:""}
            </div>`}):a`<p class="muted">${this.t("common.loading")}</p>`}
    `,o=a`
      <button class="btn flat" @click=${()=>this.close()}>${this.t("common.close")}</button>
      <button class="btn" @click=${()=>this.emit("ep-open",{type:"dish",dishId:t.id})}>
        <ha-icon icon="mdi:pencil"></ha-icon>${this.t("dish.edit")}
      </button>
    `;return this.shell(t.name,n,o)}};h(G,"properties",{...c.properties,dishId:{attribute:!1},servings:{attribute:!1},_servings:{state:!0},_check:{state:!0}}),h(G,"styles",[...c.styles,u`
      .hero {
        width: 100%;
        max-height: 260px;
        object-fit: cover;
        border-radius: 10px;
        margin-bottom: 8px;
      }
      .meta {
        margin-bottom: 8px;
      }
      h3 {
        font-size: 15px;
        margin: 18px 0 8px;
      }
      .ingredients {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      .ingredients li {
        display: flex;
        gap: 12px;
        padding: 6px 0;
        border-bottom: 1px solid var(--divider-color, #eee);
      }
      .amount {
        flex: 0 0 80px;
        text-align: right;
        font-weight: 500;
      }
      .steps {
        padding-left: 22px;
        margin: 0;
      }
      .steps li {
        padding: 4px 0;
        line-height: 1.45;
      }
      .compat {
        margin-bottom: 10px;
      }
      .reasons {
        margin: 4px 0 0 30px;
        padding: 0;
        font-size: 13px;
      }
    `]);customElements.define("ep-recipe-dialog",G);var K=class extends c{constructor(){super(),this._form=null,this._busy=!1,this._imageBusy=!1,this._error=null,this._confirmDelete=!1,this._imageUrlInput="",this._initFor=void 0}willUpdate(){if(this.data&&this._initFor!==this.dishId){this._initFor=this.dishId;let t=this.dishId?this.dish(this.dishId):null;this._form={name:t?t.name:"",meal_types:t?[...t.meal_types]:["lunch","dinner"],suitable_for:t?[...t.suitable_for]:[],base_servings:t?t.base_servings:2,duration_min:t&&t.duration_min?t.duration_min:"",tags:t?t.tags.join(", "):"",ingredients:t?t.ingredients.map(Kt).join(`
`):"",steps:t?t.steps.join(`
`):"",source_url:t&&t.source_url||"",image:t?t.image:null}}}_set(t,e){this._form={...this._form,[t]:e}}_toggle(t,e){let s=this._form[t];this._set(t,s.includes(e)?s.filter(i=>i!==e):[...s,e])}async _upload(t){let e=t.target.files&&t.target.files[0];e&&(await this._withImageBusy(()=>this.api.uploadImage(e)),t.target.value="")}async _fromUrl(){let t=this._imageUrlInput.trim();t&&(await this._withImageBusy(async()=>{let e=await this.api.imageFromUrl(t);return{id:e.id,source:e.source,origin:e.origin}}),this._imageUrlInput="")}async _withImageBusy(t){this._imageBusy=!0,this._error=null;try{this._set("image",await t())}catch(e){this._error=e.message||String(e)}this._imageBusy=!1}async _save(){let t=this._form;if(!t.name.trim()){this._error=`${this.t("edit.name")}?`;return}this._busy=!0,this._error=null;try{let e=await this.api.parseIngredients(t.ingredients),s={name:t.name.trim(),meal_types:t.meal_types.length?t.meal_types:["lunch","dinner"],suitable_for:t.suitable_for,base_servings:Number(t.base_servings)||2,duration_min:t.duration_min?Number(t.duration_min):null,tags:t.tags.split(",").map(n=>n.trim()).filter(Boolean),ingredients:e,steps:t.steps.split(`
`).map(n=>n.trim()).filter(Boolean),source_url:t.source_url.trim()||null,image:t.image||null};this.dishId&&(s.id=this.dishId);let i=await this.api.saveDish(s);this.emit("ep-open",{type:"recipe",dishId:i.id})}catch(e){this._error=e.message||String(e)}this._busy=!1}async _delete(){if(!this._confirmDelete){this._confirmDelete=!0;return}this._busy=!0;try{await this.api.deleteDish(this.dishId),this.close()}catch(t){this._error=t.message||String(t),this._busy=!1}}render(){let t=this._form;if(!t)return"";let e=L(t.image),s=a`
      <label class="field">
        <span>${this.t("edit.name")}</span>
        <input type="text" .value=${t.name} @input=${n=>this._set("name",n.target.value)} />
      </label>

      <div class="field">
        <span class="label">${this.t("edit.image")}</span>
        <div class="image-row">
          ${e?a`<img class="preview" src=${e} alt="" />`:a`<span class="thumb preview"><ha-icon icon="mdi:image-outline"></ha-icon></span>`}
          <div class="image-actions">
            <label class="btn outline upload">
              <ha-icon icon="mdi:camera"></ha-icon>${this.t("edit.upload")}
              <input type="file" accept="image/*" @change=${this._upload} hidden />
            </label>
            ${e?a`<button class="btn flat" @click=${()=>this._set("image",null)}>${this.t("edit.image_remove")}</button>`:""}
          </div>
        </div>
        <div class="row url-row">
          <input
            type="url"
            placeholder=${this.t("edit.image_url")}
            .value=${this._imageUrlInput}
            @input=${n=>this._imageUrlInput=n.target.value}
          />
          <button class="btn outline" ?disabled=${!this._imageUrlInput||this._imageBusy} @click=${this._fromUrl}>
            ${this.t("edit.image_from_url")}
          </button>
        </div>
        ${this._imageBusy?a`<div class="help">${this.t("edit.uploading")}</div>`:""}
      </div>

      <div class="field">
        <span class="label">${this.t("edit.meal_types")}</span>
        <div class="chips">
          ${x.map(n=>a`<button class="chip ${t.meal_types.includes(n)?"on":""}" @click=${()=>this._toggle("meal_types",n)}>
              ${this.t(`meal.${n}`)}
            </button>`)}
        </div>
      </div>

      <div class="field">
        <span class="label">${this.t("edit.suitable_for")}</span>
        <div class="chips">
          ${this.profiles.map(n=>a`<button class="chip ${t.suitable_for.includes(n.id)?"on":""}" @click=${()=>this._toggle("suitable_for",n.id)}>
              ${n.name}
            </button>`)}
        </div>
      </div>

      <div class="row two">
        <label class="field">
          <span>${this.t("edit.base_servings")}</span>
          <input type="number" min="0.5" step="0.5" inputmode="decimal" .value=${String(t.base_servings)}
            @input=${n=>this._set("base_servings",n.target.value)} />
        </label>
        <label class="field">
          <span>${this.t("edit.duration")}</span>
          <input type="number" min="0" step="5" inputmode="numeric" .value=${String(t.duration_min)}
            @input=${n=>this._set("duration_min",n.target.value)} />
        </label>
      </div>

      <label class="field">
        <span>${this.t("edit.ingredients")}</span>
        <textarea rows="8" .value=${t.ingredients} @input=${n=>this._set("ingredients",n.target.value)}></textarea>
        <div class="help">${this.t("edit.ingredients_help")}</div>
      </label>

      <label class="field">
        <span>${this.t("edit.steps")}</span>
        <textarea rows="6" .value=${t.steps} @input=${n=>this._set("steps",n.target.value)}></textarea>
      </label>

      <label class="field">
        <span>${this.t("edit.tags")}</span>
        <input type="text" .value=${t.tags} @input=${n=>this._set("tags",n.target.value)} />
      </label>

      <label class="field">
        <span>${this.t("edit.source_url")}</span>
        <input type="url" .value=${t.source_url} @input=${n=>this._set("source_url",n.target.value)} />
      </label>

      ${this._error?a`<p class="error">${this._error}</p>`:""}
    `,i=a`
      ${this.dishId?a`<button class="btn ${this._confirmDelete?"danger":"flat"}" ?disabled=${this._busy} @click=${this._delete}>
            ${this._confirmDelete?this.t("common.confirm_delete"):this.t("common.delete")}
          </button>`:""}
      <span class="spacer"></span>
      <button class="btn flat" @click=${()=>this.close()}>${this.t("common.cancel")}</button>
      <button class="btn" ?disabled=${this._busy||this._imageBusy} @click=${this._save}>${this.t("common.save")}</button>
    `;return this.shell(this.dishId?this.t("edit.title"):this.t("edit.new_title"),s,i)}};h(K,"properties",{...c.properties,dishId:{attribute:!1},_form:{state:!0},_busy:{state:!0},_imageBusy:{state:!0},_error:{state:!0},_confirmDelete:{state:!0},_imageUrlInput:{state:!0}}),h(K,"styles",[...c.styles,u`
      .label {
        display: block;
        font-size: 13px;
        color: var(--secondary-text-color);
        margin-bottom: 6px;
      }
      .field {
        margin-bottom: 14px;
        display: block;
      }
      .image-row {
        display: flex;
        gap: 12px;
        align-items: center;
        margin-bottom: 8px;
      }
      .preview {
        width: 96px;
        height: 96px;
        border-radius: 10px;
        object-fit: cover;
      }
      .image-actions {
        display: flex;
        flex-direction: column;
        gap: 6px;
        align-items: flex-start;
      }
      .upload {
        cursor: pointer;
      }
      .url-row input {
        flex: 1;
      }
      .two > * {
        flex: 1;
      }
    `]);customElements.define("ep-dish-editor",K);var ht={ok:0,warn:1,excluded:2},St=40,V=class extends c{constructor(){super(),this._list=null,this._for=[],this._query="",this._allMeals=!1,this._unsuitable=!1,this._busy=!1,this._error=null}willUpdate(){this._list===null&&this.data&&(this._list=(this.assignments||[]).map(t=>({dish_id:t.dish_id,profiles:[...t.profiles],servings:t.servings})),this._resetFor())}_resetFor(){let t=new Set(this._list.flatMap(s=>s.profiles)),e=this.profiles.map(s=>s.id).filter(s=>!t.has(s));this._for=e.length?e:this.profiles.map(s=>s.id)}_servingsFor(t){return t.reduce((e,s)=>{let i=this.profiles.find(n=>n.id===s);return e+(i?i.servings:1)},0)}_toggleFor(t){this._for=this._for.includes(t)?this._for.filter(e=>e!==t):[...this._for,t]}_status(t){let e=this.compat&&this.compat[t]||{};return this._for.reduce((s,i)=>{let n=e[i]||"excluded";return ht[n]>ht[s]?n:s},"ok")}get _candidates(){let t=this._query.toLowerCase().split(/\s+/).filter(Boolean);return this.dishes.filter(e=>this._allMeals||e.meal_types.includes(this.mealType)).filter(e=>!t.length||t.every(s=>e.name.toLowerCase().includes(s))).map(e=>({dish:e,status:this._status(e.id)})).filter(e=>this._unsuitable||e.status!=="excluded").sort((e,s)=>ht[e.status]-ht[s.status]||e.dish.name.localeCompare(s.dish.name,"de"))}_choose(t){if(!this._for.length)return;let e=this._list.map(s=>({...s,profiles:s.profiles.filter(i=>!this._for.includes(i))})).filter(s=>s.profiles.length).map(s=>({...s,servings:this._servingsFor(s.profiles)}));e.push({dish_id:t.id,profiles:[...this._for],servings:this._servingsFor(this._for)}),this._list=e,this._query="",this._resetFor()}_remove(t){this._list=this._list.filter((e,s)=>s!==t),this._resetFor()}_setServings(t,e){let s=[...this._list];s[t]={...s[t],servings:Math.max(.5,Number(e)||1)},this._list=s}async _save(){this._busy=!0,this._error=null;try{await this.api.setMeal(this.date,this.mealType,this._list),this.close()}catch(t){this._error=t.message||String(t),this._busy=!1}}render(){if(!this._list)return"";let t=this.t("slot.title",{day:A(this.hass,T(this.date)),meal:this.t(`meal.${this.mealType}`)}),e=this._candidates,s=a`
      ${this._list.length?a`<ul class="current">
            ${this._list.map((n,o)=>{let l=this.dish(n.dish_id);return a`<li class="row">
                ${this.thumb(l,40)}
                <span class="text">
                  <span class="name">${l?l.name:"?"}</span>
                  <span class="chips">${n.profiles.map(p=>a`<span class="chip small">${this.profileName(p)}</span>`)}</span>
                </span>
                <input class="servings" type="number" min="0.5" step="0.5" inputmode="decimal"
                  .value=${String(n.servings)} @change=${p=>this._setServings(o,p.target.value)}
                  aria-label=${this.t("dish.servings")} />
                <button class="icon-btn" @click=${()=>this._remove(o)} aria-label=${this.t("slot.remove")}>
                  <ha-icon icon="mdi:delete-outline"></ha-icon>
                </button>
              </li>`})}
          </ul>`:a`<p class="muted">${this.t("slot.nothing")}</p>`}

      <h3>${this.t("slot.add")}</h3>
      <div class="row for">
        <span class="muted">${this.t("slot.for")}:</span>
        <div class="chips">
          ${this.profiles.map(n=>a`<button class="chip ${this._for.includes(n.id)?"on":""}" @click=${()=>this._toggleFor(n.id)}>
              ${n.name}
            </button>`)}
        </div>
      </div>
      <input type="search" placeholder=${this.t("slot.search")} .value=${this._query}
        @input=${n=>this._query=n.target.value} />
      <div class="row toggles">
        <label class="row"><input type="checkbox" .checked=${this._allMeals}
          @change=${n=>this._allMeals=n.target.checked} />${this.t("slot.show_all_meals")}</label>
        <label class="row"><input type="checkbox" .checked=${this._unsuitable}
          @change=${n=>this._unsuitable=n.target.checked} />${this.t("slot.show_unsuitable")}</label>
      </div>
      ${this._for.length?a`<ul class="candidates">
            ${e.slice(0,St).map(n=>a`<li>
                <button class="candidate" @click=${()=>this._choose(n.dish)}>
                  ${this.thumb(n.dish,40)}
                  <span class="text">
                    <span class="name">${n.dish.name}</span>
                    <span class="small status-${n.status}">${this.t(`status.${n.status}`)}</span>
                  </span>
                  <span class="dots">${this.compatDots(n.dish.id)}</span>
                </button>
              </li>`)}
          </ul>
          ${e.length>St?a`<p class="muted small">+ ${e.length-St} …</p>`:""}`:a`<p class="muted">${this.t("slot.no_profiles")}</p>`}
      ${this._error?a`<p class="error">${this._error}</p>`:""}
    `,i=a`
      <button class="btn flat" @click=${()=>this.close()}>${this.t("common.cancel")}</button>
      <button class="btn" ?disabled=${this._busy} @click=${this._save}>${this.t("common.save")}</button>
    `;return this.shell(t,s,i)}};h(V,"properties",{...c.properties,date:{attribute:!1},mealType:{attribute:!1},assignments:{attribute:!1},_list:{state:!0},_for:{state:!0},_query:{state:!0},_allMeals:{state:!0},_unsuitable:{state:!0},_busy:{state:!0},_error:{state:!0}}),h(V,"styles",[...c.styles,u`
      h3 {
        font-size: 15px;
        margin: 16px 0 8px;
      }
      ul {
        list-style: none;
        margin: 0;
        padding: 0;
      }
      .current li {
        padding: 6px 0;
        border-bottom: 1px solid var(--divider-color, #eee);
      }
      .text {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 3px;
        min-width: 0;
      }
      .name {
        font-weight: 500;
      }
      input.servings {
        width: 64px;
        flex: none;
        padding: 8px;
      }
      .current .chips {
        gap: 4px;
      }
      .for {
        margin-bottom: 8px;
        flex-wrap: wrap;
      }
      .toggles {
        flex-wrap: wrap;
        gap: 16px;
        margin: 8px 0;
        font-size: 14px;
      }
      input[type="checkbox"] {
        width: 20px;
        height: 20px;
        accent-color: var(--primary-color);
      }
      .candidate {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        padding: 8px 4px;
        border: none;
        border-bottom: 1px solid var(--divider-color, #eee);
        background: transparent;
        color: inherit;
        text-align: left;
      }
      .candidate:hover {
        background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
      }
      .small {
        font-size: 12px;
      }
      .dots {
        display: flex;
        gap: 3px;
      }
    `]);customElements.define("ep-slot-editor",V);var Y=class extends c{constructor(){super(),this._meals=null,this._for=null,this._overwrite=!1,this._alternatives=null,this._busy=!1,this._result=null,this._error=null}get _days(){let t=T(this.start);return[0,1,2,3,4,5,6].map(e=>v(P(t,e)))}willUpdate(){if(this._meals===null&&this.data&&this.start){let t=this.data.default_meal_types||["lunch","dinner"];this._meals=Object.fromEntries(this._days.map(e=>[e,[...t]])),this._for=this.profiles.map(e=>e.id),this._alternatives=this.data.alternatives??1}}_toggleMeal(t,e){let s=this._meals[t];this._meals={...this._meals,[t]:s.includes(e)?s.filter(i=>i!==e):[...s,e]}}_toggleColumn(t){let e=this._days.every(s=>this._meals[s].includes(t));this._meals=Object.fromEntries(this._days.map(s=>{let i=this._meals[s].filter(n=>n!==t);return[s,e?i:[...i,t]]}))}_toggleFor(t){this._for=this._for.includes(t)?this._for.filter(e=>e!==t):[...this._for,t]}async _run(){this._busy=!0,this._error=null;try{let t=await this.api.generate({start_date:this.start,days:7,meals:this._meals,profiles:this._for,overwrite:this._overwrite,alternatives:this._alternatives});this._result=t}catch(t){this._error=t.message||String(t)}this._busy=!1}_countPlanned(t){let e=0;for(let s of Object.values(t.days))for(let i of Object.values(s))e+=i.assignments.length;return e}_countOpen(t){let e=0;for(let s of Object.values(t.days))for(let i of Object.values(s))e+=i.assignments.filter(n=>!n.chosen).length;return e}render(){if(!this._meals)return"";if(this._result)return this._renderResult();let t=a`
      <h3>${this.t("gen.days")}</h3>
      <table class="grid">
        <thead>
          <tr>
            <th></th>
            ${x.map(s=>a`<th><button class="colhead" @click=${()=>this._toggleColumn(s)}>${this.t(`meal.${s}`)}</button></th>`)}
          </tr>
        </thead>
        <tbody>
          ${this._days.map(s=>a`<tr>
              <th class="day">${A(this.hass,T(s))}</th>
              ${x.map(i=>a`<td>
                  <input type="checkbox" .checked=${this._meals[s].includes(i)} @change=${()=>this._toggleMeal(s,i)}
                    aria-label="${s} ${i}" />
                </td>`)}
            </tr>`)}
        </tbody>
      </table>

      <h3>${this.t("gen.profiles")}</h3>
      <div class="chips">
        ${this.profiles.map(s=>a`<button class="chip ${this._for.includes(s.id)?"on":""}" @click=${()=>this._toggleFor(s.id)}>
            ${s.name}
          </button>`)}
      </div>

      <label class="field alt">
        <span>${this.t("gen.alternatives")}</span>
        <select @change=${s=>this._alternatives=Number(s.target.value)}>
          ${[0,1,2,3].map(s=>a`<option value=${s} ?selected=${s===this._alternatives}>
              ${s===0?this.t("gen.alternatives_none"):s}</option>`)}
        </select>
      </label>
      <label class="row overwrite">
        <input type="checkbox" .checked=${this._overwrite} @change=${s=>this._overwrite=s.target.checked} />
        <span>${this.t("gen.overwrite")}</span>
      </label>
      ${this._error?a`<p class="error">${this._error}</p>`:""}
    `,e=a`
      <button class="btn flat" @click=${()=>this.close()}>${this.t("common.cancel")}</button>
      <button class="btn" ?disabled=${this._busy||!this._for.length} @click=${this._run}>
        <ha-icon icon="mdi:auto-fix"></ha-icon>${this.t("gen.run")}
      </button>
    `;return this.shell(this.t("gen.title"),t,e)}_renderResult(){let t=this._result,e=a`
      <p class="status-ok">${this.t("gen.done",{n:this._countPlanned(t)})}</p>
      ${this._countOpen(t)?a`<p>${this.t("gen.choose_hint",{n:this._countOpen(t)})}</p>`:""}
      ${t.warnings.length?a`<ul class="warnings">
            ${t.warnings.map(s=>a`<li class="status-warn">
                ${this.t("gen.no_dish",{day:A(this.hass,T(s.date)),meal:this.t(`meal.${s.meal_type}`),profiles:s.profiles.map(i=>this.profileName(i)).join(", ")})}
              </li>`)}
          </ul>`:""}
    `;return this.shell(this.t("gen.title"),e,a`<button class="btn" @click=${()=>this.close()}>${this.t("common.close")}</button>`)}};h(Y,"properties",{...c.properties,start:{attribute:!1},_meals:{state:!0},_for:{state:!0},_overwrite:{state:!0},_alternatives:{state:!0},_busy:{state:!0},_result:{state:!0},_error:{state:!0}}),h(Y,"styles",[...c.styles,u`
      h3 {
        font-size: 15px;
        margin: 4px 0 8px;
      }
      h3 + .chips {
        margin-bottom: 16px;
      }
      .grid {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 16px;
      }
      .grid th,
      .grid td {
        text-align: center;
        padding: 4px 2px;
      }
      .grid .day {
        text-align: left;
        font-weight: 500;
        white-space: nowrap;
      }
      .colhead {
        border: none;
        background: transparent;
        color: var(--secondary-text-color);
        font-size: 12px;
        padding: 4px;
      }
      input[type="checkbox"] {
        width: 22px;
        height: 22px;
        accent-color: var(--primary-color);
      }
      .overwrite {
        align-items: flex-start;
      }
      .alt select {
        max-width: 160px;
      }
      .warnings {
        padding-left: 18px;
      }
    `]);customElements.define("ep-generate-dialog",Y);var Qt=["tolerated","not_tolerated","likes","dislikes"],be=["exclude","warn","allow"];function $e(r){return r.split(/[\n,;]+/).map(t=>t.trim()).filter(Boolean)}var dt=class extends c{constructor(){super(),this._form=null,this._busy=!1,this._error=null,this._confirmDelete=!1,this._initFor=void 0}willUpdate(){if(this.data&&this._initFor!==this.profileId){this._initFor=this.profileId;let t=this.profileId?this.profiles.find(e=>e.id===this.profileId):null;this._form={name:t?t.name:"",servings:t?t.servings:1,unknown_ingredients:t?t.unknown_ingredients:"exclude",max_duration:t&&t.max_duration?t.max_duration:"",excluded_groups:t?[...t.excluded_groups||[]]:[],small_amounts:t?t.small_amounts.map(e=>e.max_amount!==null&&e.max_amount!==void 0?[k(e.max_amount),e.unit,e.name].filter(Boolean).join(" "):e.name).join(`
`):"",...Object.fromEntries(Qt.map(e=>[e,t?t[e].join(`
`):""]))}}}_set(t,e){this._form={...this._form,[t]:e}}async _save(){let t=this._form;if(!t.name.trim()){this._error=`${this.t("profile.name")}?`;return}this._busy=!0,this._error=null;try{let e=await this.api.parseIngredients(t.small_amounts),s={name:t.name.trim(),servings:Number(t.servings)||1,unknown_ingredients:t.unknown_ingredients,max_duration:t.max_duration?Number(t.max_duration):null,excluded_groups:t.excluded_groups,small_amounts:e.map(n=>({name:n.name,max_amount:n.amount,unit:n.unit})),...Object.fromEntries(Qt.map(n=>[n,$e(t[n])]))};this.profileId&&(s.id=this.profileId);let i=await this.api.saveProfile(s);this.profileId?this.close():this.emit("ep-open",{type:"ingredients",profileId:i.id})}catch(e){this._error=e.message||String(e),this._busy=!1}}async _delete(){if(!this._confirmDelete){this._confirmDelete=!0;return}this._busy=!0;try{await this.api.deleteProfile(this.profileId),this.close()}catch(t){this._error=t.message||String(t),this._busy=!1}}_textarea(t,e){return a`<label class="field">
      <span>${this.t(`profile.${t}`)}</span>
      <textarea rows="4" .value=${this._form[t]} @input=${s=>this._set(t,s.target.value)}></textarea>
      <div class="help">${e}</div>
    </label>`}render(){let t=this._form;if(!t)return"";let e=a`
      <label class="field">
        <span>${this.t("profile.name")}</span>
        <input type="text" .value=${t.name} @input=${i=>this._set("name",i.target.value)} />
      </label>
      <div class="row">
        <label class="field" style="flex:1">
          <span>${this.t("profile.servings")}</span>
          <input type="number" min="0.5" step="0.5" inputmode="decimal" .value=${String(t.servings)}
            @input=${i=>this._set("servings",i.target.value)} />
        </label>
        <label class="field" style="flex:2">
          <span>${this.t("profile.max_duration")}</span>
          <input type="number" min="0" step="5" inputmode="numeric" .value=${String(t.max_duration)}
            @input=${i=>this._set("max_duration",i.target.value)} />
        </label>
      </div>
      <label class="field">
        <span>${this.t("profile.unknown")}</span>
        <select @change=${i=>this._set("unknown_ingredients",i.target.value)}>
          ${be.map(i=>a`<option value=${i} ?selected=${t.unknown_ingredients===i}>${this.t(`profile.unknown.${i}`)}</option>`)}
        </select>
      </label>
      <div class="field">
        <span class="label">${this.t("groups.editor_title")}</span>
        ${this.groupChips(t.excluded_groups,i=>this._set("excluded_groups",t.excluded_groups.includes(i)?t.excluded_groups.filter(n=>n!==i):[...t.excluded_groups,i]))}
      </div>
      ${this._textarea("likes",this.t("profile.list_help"))}
      ${this._textarea("dislikes",this.t("profile.list_help"))}
      <details>
        <summary>${this.t("profile.as_text")}</summary>
        <p class="help">${this.t("profile.as_text_help")}</p>
        ${this._textarea("tolerated",this.t("profile.list_help"))}
        ${this._textarea("not_tolerated",this.t("profile.list_help"))}
        ${this._textarea("small_amounts",this.t("profile.small_help"))}
      </details>
      ${this._error?a`<p class="error">${this._error}</p>`:""}
    `,s=a`
      ${this.profileId?a`<button class="btn ${this._confirmDelete?"danger":"flat"}" ?disabled=${this._busy} @click=${this._delete}>
            ${this._confirmDelete?this.t("common.confirm_delete"):this.t("common.delete")}
          </button>`:""}
      <span class="spacer"></span>
      <button class="btn flat" @click=${()=>this.close()}>${this.t("common.cancel")}</button>
      <button class="btn" ?disabled=${this._busy} @click=${this._save}>${this.t("common.save")}</button>
    `;return this.shell(this.profileId?this.t("profile.title"):this.t("profile.new"),e,s)}};h(dt,"properties",{...c.properties,profileId:{attribute:!1},_form:{state:!0},_busy:{state:!0},_error:{state:!0},_confirmDelete:{state:!0}});customElements.define("ep-profile-editor",dt);var Jt=["all","unknown","tolerated","small","not_tolerated"],xe=[{state:"tolerated",icon:"mdi:check",cls:"ok"},{state:"small",icon:"mdi:approximately-equal",cls:"warn"},{state:"not_tolerated",icon:"mdi:close",cls:"bad"}],Q=80;function ve(r){let t=/^\s*(\d+(?:[.,]\d+)?)\s*(.*)$/.exec(r||"");return t?{max_amount:Number(t[1].replace(",",".")),unit:t[2].trim()||null}:{max_amount:null,unit:null}}var J=class extends c{constructor(){super(),this._items=null,this._filter="all",this._query="",this._limit=Q,this._pending=new Set,this._error=null,this._loadedFor=null}updated(){this.api&&this.profileId&&this._loadedFor!==this.profileId&&(this._loadedFor=this.profileId,this.api.profileIngredients(this.profileId).then(t=>this._items=t).catch(t=>this._error=t.message||String(t)))}get _profile(){return this.profiles.find(t=>t.id===this.profileId)}get _visible(){let t=this._query.toLowerCase().split(/\s+/).filter(Boolean);return(this._items||[]).filter(e=>this._filter==="all"||e.state===this._filter).filter(e=>!t.length||t.every(s=>e.name.toLowerCase().includes(s)))}async _set(t,e,s={}){let i=t.explicit&&t.state===e&&!s.keep?"unknown":e;this._pending=new Set([...this._pending,t.name]),this._error=null;try{this._items=await this.api.setIngredient({profile_id:this.profileId,name:t.name,state:i,max_amount:s.max_amount??t.max_amount??null,unit:s.unit??t.unit??null})}catch(o){this._error=o.message||String(o)}let n=new Set(this._pending);n.delete(t.name),this._pending=n}_setLimit(t,e){let s=ve(e);this._set(t,"small",{...s,keep:!0})}_addNew(t){let e=this._query.trim();e&&(this._set({name:e,state:"unknown",explicit:!1},t),this._query="")}_counts(){let t=Object.fromEntries(Jt.map(e=>[e,0]));for(let e of this._items||[])t.all+=1,t[e.state]+=1;return t}render(){let t=this._profile;if(!t)return"";let e=this.t("ingr.title",{name:t.name});if(!this._items)return this.shell(e,a`<p class="muted">${this._error||this.t("common.loading")}</p>`);let s=this._counts(),i=this._visible,n=this._query.trim().toLowerCase(),o=n&&this._items.some(d=>d.name.toLowerCase()===n),l=a`
      ${t.unknown_ingredients==="exclude"?a`<p class="hint">${this.t("ingr.hint_exclude")}</p>`:""}
      <div class="groupbar">
        <div class="groupbar-text">
          <span class="muted">${this.t("groups.bar_title")}</span>
          ${(t.excluded_groups||[]).length?a`<span class="chips">${t.excluded_groups.map(d=>a`<span class="chip small on bad">${this.groupLabel(d)}</span>`)}</span>`:a`<span class="muted">${this.t("groups.none")}</span>`}
        </div>
        <button class="btn outline" @click=${()=>this.emit("ep-open",{type:"groups",profileId:this.profileId,back:{type:"ingredients",profileId:this.profileId}})}>
          <ha-icon icon="mdi:alert-circle-outline"></ha-icon>${this.t("groups.button")}
        </button>
      </div>
      <div class="sticky">
        <input type="search" placeholder=${this.t("ingr.search")} .value=${this._query}
          @input=${d=>{this._query=d.target.value,this._limit=Q}} />
        <div class="chips filters">
          ${Jt.map(d=>a`<button class="chip small ${this._filter===d?"on":""}"
              @click=${()=>{this._filter=d,this._limit=Q}}>${this.t(`ingr.filter.${d}`)} (${s[d]})</button>`)}
        </div>
        <div class="legend muted">
          <span><span class="mini ok">✓</span>${this.t("ingr.state.tolerated")}</span>
          <span><span class="mini warn">≈</span>${this.t("ingr.state.small")}</span>
          <span><span class="mini bad">✕</span>${this.t("ingr.state.not_tolerated")}</span>
        </div>
      </div>

      ${n&&!o?a`<div class="item new">
            <span class="text"><span class="name">„${this._query.trim()}“ ${this.t("ingr.add")}</span></span>
            ${this._buttons({name:this._query.trim(),state:"unknown",explicit:!1},d=>this._addNew(d))}
          </div>`:""}

      <ul class="list">
        ${i.slice(0,this._limit).map(d=>this._renderItem(d))}
      </ul>
      ${i.length>this._limit?a`<div class="more"><button class="btn outline" @click=${()=>this._limit+=Q}>
            + ${Math.min(Q,i.length-this._limit)}</button></div>`:""}
      ${!i.length&&!n?a`<p class="muted">${this.t("ingr.none")}</p>`:""}
      ${this._error?a`<p class="error">${this._error}</p>`:""}
    `,p=a`<button class="btn" @click=${()=>this.close()}>${this.t("ingr.done")}</button>`;return this.shell(e,l,p)}_buttons(t,e){let s=this._pending.has(t.name);return a`<span class="seg">
      ${xe.map(i=>{let n=t.state===i.state,o=n?t.explicit?`on ${i.cls}`:`implied ${i.cls}`:"";return a`<button class="segbtn ${o}" ?disabled=${s}
          aria-pressed=${n&&t.explicit} aria-label=${this.t(`ingr.state.${i.state}`)}
          title=${this.t(`ingr.state.${i.state}`)}
          @click=${()=>e(i.state)}>${i.cls==="ok"?"\u2713":i.cls==="warn"?"\u2248":"\u2715"}</button>`})}
    </span>`}_renderItem(t){let e=t.max_amount!==null&&t.max_amount!==void 0?[k(t.max_amount),t.unit].filter(Boolean).join(" "):"";return a`<li class="item">
      <span class="text">
        <span class="name">${t.name}</span>
        <span class="sub muted">
          ${t.count?this.t("ingr.count",{n:t.count}):this.t("ingr.no_dish")}
          ${!t.explicit&&t.by?a` · <span class="status-${t.state==="tolerated"?"ok":t.state==="small"?"warn":"excluded"}">
                ${this.t(`ingr.by.${t.state}`,{term:t.by})}</span>`:""}
          ${t.group?a` · <span class="status-excluded">${this.t("ingr.by_group",{group:this.groupLabel(t.group)})}</span>`:""}
        </span>
        ${t.state==="small"&&t.explicit?a`<label class="limit">
              <span class="muted">${this.t("ingr.limit")}</span>
              <input type="text" placeholder="z. B. 10 g" .value=${e}
                @change=${s=>this._setLimit(t,s.target.value)} />
            </label>`:""}
      </span>
      ${this._buttons(t,s=>this._set(t,s))}
    </li>`}};h(J,"properties",{...c.properties,profileId:{attribute:!1},_items:{state:!0},_filter:{state:!0},_query:{state:!0},_limit:{state:!0},_pending:{state:!0},_error:{state:!0}}),h(J,"styles",[...c.styles,u`
      .groupbar {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
        margin-bottom: 12px;
        padding: 10px 12px;
        border: 1px solid var(--divider-color, #ddd);
        border-radius: 10px;
      }
      .groupbar-text {
        flex: 1 1 200px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-size: 13px;
      }
      .hint {
        background: var(--secondary-background-color, #f3f3f3);
        border-left: 4px solid var(--ep-warn);
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 13px;
        margin: 0 0 12px;
      }
      .sticky {
        position: sticky;
        top: -16px;
        z-index: 1;
        background: var(--card-background-color, #fff);
        padding: 4px 0 8px;
      }
      .filters {
        margin-top: 8px;
      }
      .legend {
        display: flex;
        gap: 14px;
        font-size: 12px;
        margin-top: 8px;
        flex-wrap: wrap;
      }
      .legend > span {
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      .mini {
        display: inline-flex;
        width: 18px;
        height: 18px;
        border-radius: 4px;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 11px;
      }
      .mini.ok,
      .segbtn.on.ok {
        background: var(--ep-ok);
      }
      .mini.warn,
      .segbtn.on.warn {
        background: var(--ep-warn);
      }
      .mini.bad,
      .segbtn.on.bad {
        background: var(--ep-bad);
      }
      .list {
        list-style: none;
        margin: 0;
        padding: 0;
      }
      .item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 0;
        border-bottom: 1px solid var(--divider-color, #eee);
      }
      .item.new {
        border-bottom: 2px solid var(--primary-color);
      }
      .text {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .name {
        font-weight: 500;
        overflow-wrap: anywhere;
      }
      .sub {
        font-size: 12px;
      }
      .limit {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        margin-top: 4px;
      }
      .limit input {
        width: 110px;
        padding: 4px 8px;
        font-size: 14px;
      }
      .seg {
        display: inline-flex;
        flex: none;
        border: 1px solid var(--divider-color, #ccc);
        border-radius: 10px;
        overflow: hidden;
      }
      .segbtn {
        width: 44px;
        height: 40px;
        border: none;
        background: transparent;
        color: var(--secondary-text-color);
        font-size: 17px;
        font-weight: 600;
      }
      .segbtn + .segbtn {
        border-left: 1px solid var(--divider-color, #ccc);
      }
      .segbtn.on {
        color: #fff;
      }
      .segbtn.implied.ok {
        color: var(--ep-ok);
        box-shadow: inset 0 0 0 2px var(--ep-ok);
      }
      .segbtn.implied.warn {
        color: var(--ep-warn);
        box-shadow: inset 0 0 0 2px var(--ep-warn);
      }
      .segbtn.implied.bad {
        color: var(--ep-bad);
        box-shadow: inset 0 0 0 2px var(--ep-bad);
      }
      .segbtn[disabled] {
        opacity: 0.5;
      }
      .more {
        text-align: center;
        margin-top: 12px;
      }
    `]);customElements.define("ep-ingredient-dialog",J);var Xt=6,X=class extends c{constructor(){super(),this._groups=null,this._expanded=new Set,this._busy=!1,this._error=null,this._loadedFor=null}updated(){this.api&&this.profileId&&this._loadedFor!==this.profileId&&(this._loadedFor=this.profileId,this._load())}async _load(){try{this._groups=await this.api.profileGroups(this.profileId)}catch(t){this._error=t.message||String(t)}}close(){this.back?this.emit("ep-open",this.back):super.close()}async _toggle(t){let e=this._groups.filter(i=>i.excluded).map(i=>i.id),s=t.excluded?e.filter(i=>i!==t.id):[...e,t.id];this._groups=this._groups.map(i=>i.id===t.id?{...i,excluded:!i.excluded}:i),this._busy=!0,this._error=null;try{await this.api.setGroups(this.profileId,s)}catch(i){this._error=i.message||String(i),await this._load()}this._busy=!1}_toggleExpand(t){let e=new Set(this._expanded);e.has(t)?e.delete(t):e.add(t),this._expanded=e}_row(t){let e=this._expanded.has(t.id),s=e?t.members:t.members.slice(0,Xt);return a`<li class="row-item ${t.excluded?"excluded":""}">
      <button class="switch-row" role="switch" aria-checked=${t.excluded} ?disabled=${this._busy}
        @click=${()=>this._toggle(t)}>
        <span class="text">
          <span class="name">${this.groupLabel(t.id)}</span>
          <span class="sub muted">
            ${t.count===1?this.t("groups.affects_one"):t.count?this.t("groups.affects",{n:t.count}):this.t("groups.affects_none")}
          </span>
        </span>
        <span class="switch ${t.excluded?"on":""}" aria-hidden="true"><span class="knob"></span></span>
      </button>
      ${t.count?a`<div class="members muted">
            ${s.join(", ")}${!e&&t.count>Xt?a` … <button class="link" @click=${()=>this._toggleExpand(t.id)}>
                  ${this.t("groups.show_all",{n:t.count})}</button>`:""}
          </div>`:""}
    </li>`}render(){let t=this.profiles.find(p=>p.id===this.profileId);if(!t)return"";let e=this.t("groups.title",{name:t.name});if(!this._groups)return this.shell(e,a`<p class="muted">${this._error||this.t("common.loading")}</p>`);let s=this._groups.filter(p=>p.kind==="allergen"),i=this._groups.filter(p=>p.kind==="meat"),n=this._groups.filter(p=>p.excluded).length,o=a`
      <p class="help intro">${this.t("groups.intro")}</p>
      <h3>${this.t("groups.allergens_title")}</h3>
      <ul class="list">${s.map(p=>this._row(p))}</ul>
      <h3>${this.t("groups.meat_title")}</h3>
      <ul class="list">${i.map(p=>this._row(p))}</ul>
      <p class="help">${this.t("groups.disclaimer")}</p>
      ${this._error?a`<p class="error">${this._error}</p>`:""}
    `,l=a`
      <span class="muted count">${this.t("groups.active",{n})}</span>
      <span class="spacer"></span>
      ${this.back?a`<button class="btn" @click=${()=>this.close()}>${this.t("groups.back")}</button>`:a`
            <button class="btn flat" @click=${()=>this.emit("ep-open",{type:"ingredients",profileId:this.profileId})}>
              ${this.t("ingr.open")}
            </button>
            <button class="btn" @click=${()=>this.close()}>${this.t("ingr.done")}</button>
          `}
    `;return this.shell(e,o,l)}};h(X,"properties",{...c.properties,profileId:{attribute:!1},back:{attribute:!1},_groups:{state:!0},_expanded:{state:!0},_busy:{state:!0},_error:{state:!0}}),h(X,"styles",[...c.styles,u`
      .intro {
        margin-top: 0;
      }
      h3 {
        font-size: 15px;
        margin: 18px 0 6px;
      }
      .list {
        list-style: none;
        margin: 0;
        padding: 0;
      }
      .row-item {
        border-bottom: 1px solid var(--divider-color, #eee);
        padding: 4px 0 8px;
      }
      .switch-row {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        min-height: 52px;
        padding: 4px 0;
        border: none;
        background: transparent;
        color: inherit;
        text-align: left;
      }
      .text {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
      }
      .name {
        font-weight: 500;
        font-size: 15px;
      }
      .excluded .name {
        color: var(--ep-bad);
      }
      .sub {
        font-size: 12px;
      }
      .switch {
        flex: none;
        width: 48px;
        height: 28px;
        border-radius: 14px;
        background: var(--divider-color, #ccc);
        position: relative;
        transition: background 0.15s;
      }
      .switch .knob {
        position: absolute;
        top: 3px;
        left: 3px;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: #fff;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        transition: left 0.15s;
      }
      .switch.on {
        background: var(--ep-bad);
      }
      .switch.on .knob {
        left: 23px;
      }
      .members {
        font-size: 12px;
        line-height: 1.4;
      }
      .link {
        border: none;
        background: none;
        padding: 0;
        color: var(--primary-color);
        font-size: 12px;
      }
      .count {
        font-size: 13px;
        align-self: center;
      }
    `]);customElements.define("ep-groups-dialog",X);var te=[{id:"plan",icon:"mdi:calendar-week"},{id:"dishes",icon:"mdi:silverware-fork-knife"},{id:"profiles",icon:"mdi:account-heart"},{id:"shopping",icon:"mdi:cart"}],tt=class extends ${constructor(){super(),this._tab="plan",this._data=null,this._compat={},this._revision=0,this._dialog=null,this._error=null,this._unsub=null,this._api=null}t(t,e){return ot(this.hass,t,e)}connectedCallback(){super.connectedCallback();let t=new URLSearchParams(window.location.search);t.get("tab")&&te.some(e=>e.id===t.get("tab"))&&(this._tab=t.get("tab")),this._openDishId=t.get("dish"),this.hass&&this._start()}disconnectedCallback(){super.disconnectedCallback(),this._unsub&&(this._unsub.then(t=>t()).catch(()=>{}),this._unsub=null)}updated(t){t.has("hass")&&this.hass&&(this._api?this._api.hass=this.hass:this._start())}_start(){this._unsub||!this.hass||(this._api=new rt(this.hass),this._load(),this._unsub=this._api.subscribe(()=>this._load()))}async _load(){try{let[t,e]=await Promise.all([this._api.data(),this._api.compat()]);this._data=t,this._compat=e,this._revision+=1,this._error=null,this._openDishId&&t.dishes.some(s=>s.id===this._openDishId)&&(this._dialog={type:"recipe",dishId:this._openDishId},this._openDishId=null)}catch(t){this._error=t.message||String(t)}}_toggleMenu(){this.dispatchEvent(new CustomEvent("hass-toggle-menu",{bubbles:!0,composed:!0}))}_setTab(t){this._tab=t;let e=new URL(window.location.href);e.searchParams.set("tab",t),e.searchParams.delete("dish"),history.replaceState(null,"",e)}_onOpen(t){this._dialog=t.detail}_closeDialog(){this._dialog=null}render(){if(!this.hass)return a``;let t={hass:this.hass,api:this._api,data:this._data,compat:this._compat};return a`
      <div class="toolbar">
        ${this.narrow?a`<button class="icon-btn menu" @click=${this._toggleMenu} aria-label="Menu">
              <ha-icon icon="mdi:menu"></ha-icon>
            </button>`:""}
        <div class="title">${this.t("title")}</div>
      </div>
      <nav class="tabs" role="tablist">
        ${te.map(e=>a`<button
            role="tab"
            class="tab ${this._tab===e.id?"active":""}"
            aria-selected=${this._tab===e.id}
            @click=${()=>this._setTab(e.id)}
          >
            <ha-icon icon=${e.icon}></ha-icon><span>${this.t(`tab.${e.id}`)}</span>
          </button>`)}
      </nav>
      <main @ep-open=${this._onOpen}>
        ${this._error?a`<p class="error">${this.t("common.error",{msg:this._error})}</p>`:""}
        ${this._data?this._renderView(t):a`<p class="muted loading">${this.t("common.loading")}</p>`}
      </main>
      <div @ep-close=${this._closeDialog} @ep-open=${this._onOpen}>${this._renderDialog(t)}</div>
    `}_renderView(t){switch(this._tab){case"dishes":return a`<ep-dishes-view .hass=${t.hass} .api=${t.api} .data=${t.data} .compat=${t.compat}></ep-dishes-view>`;case"profiles":return a`<ep-profiles-view .hass=${t.hass} .api=${t.api} .data=${t.data} .compat=${t.compat}></ep-profiles-view>`;case"shopping":return a`<ep-shopping-view
          .hass=${t.hass}
          .api=${t.api}
          .data=${t.data}
          .compat=${t.compat}
          .revision=${this._revision}
        ></ep-shopping-view>`;default:return a`<ep-plan-view
          .hass=${t.hass}
          .api=${t.api}
          .data=${t.data}
          .compat=${t.compat}
          .revision=${this._revision}
        ></ep-plan-view>`}}_renderDialog(t){let e=this._dialog;if(!e||!this._data)return"";switch(e.type){case"recipe":return a`<ep-recipe-dialog .hass=${t.hass} .api=${t.api} .data=${t.data} .compat=${t.compat}
          .dishId=${e.dishId} .servings=${e.servings}></ep-recipe-dialog>`;case"dish":return a`<ep-dish-editor .hass=${t.hass} .api=${t.api} .data=${t.data} .compat=${t.compat}
          .dishId=${e.dishId}></ep-dish-editor>`;case"slot":return a`<ep-slot-editor .hass=${t.hass} .api=${t.api} .data=${t.data} .compat=${t.compat}
          .date=${e.date} .mealType=${e.mealType} .assignments=${e.assignments}></ep-slot-editor>`;case"generate":return a`<ep-generate-dialog .hass=${t.hass} .api=${t.api} .data=${t.data} .compat=${t.compat}
          .start=${e.start}></ep-generate-dialog>`;case"profile":return a`<ep-profile-editor .hass=${t.hass} .api=${t.api} .data=${t.data} .compat=${t.compat}
          .profileId=${e.profileId}></ep-profile-editor>`;case"groups":return a`<ep-groups-dialog .hass=${t.hass} .api=${t.api} .data=${t.data} .compat=${t.compat}
          .profileId=${e.profileId} .back=${e.back}></ep-groups-dialog>`;case"ingredients":return a`<ep-ingredient-dialog .hass=${t.hass} .api=${t.api} .data=${t.data} .compat=${t.compat}
          .profileId=${e.profileId}></ep-ingredient-dialog>`;default:return""}}};h(tt,"properties",{hass:{attribute:!1},narrow:{type:Boolean},route:{attribute:!1},panel:{attribute:!1},_tab:{state:!0},_data:{state:!0},_compat:{state:!0},_revision:{state:!0},_dialog:{state:!0},_error:{state:!0}}),h(tt,"styles",[b,u`
      :host {
        display: block;
        min-height: 100vh;
        background: var(--primary-background-color);
      }
      .toolbar {
        display: flex;
        align-items: center;
        height: var(--header-height, 56px);
        padding: 0 12px;
        background: var(--app-header-background-color, var(--primary-color));
        color: var(--app-header-text-color, #fff);
        padding-top: env(safe-area-inset-top);
        box-sizing: content-box;
      }
      .toolbar .menu {
        color: inherit;
      }
      .title {
        font-size: 20px;
        margin-left: 8px;
      }
      .tabs {
        position: sticky;
        top: 0;
        z-index: 2;
        display: flex;
        background: var(--app-header-background-color, var(--primary-color));
        overflow-x: auto;
        scrollbar-width: none;
      }
      .tab {
        flex: 1;
        min-width: 80px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        padding: 8px 4px 6px;
        border: none;
        border-bottom: 3px solid transparent;
        background: transparent;
        color: var(--app-header-text-color, #fff);
        opacity: 0.75;
        font-size: 13px;
      }
      .tab.active {
        opacity: 1;
        border-bottom-color: var(--app-header-text-color, #fff);
      }
      main {
        max-width: 1100px;
        margin: 0 auto;
        padding: 16px 12px calc(32px + env(safe-area-inset-bottom));
      }
      .loading {
        text-align: center;
        padding: 40px 0;
      }
      @media (min-width: 870px) {
        .tab {
          flex-direction: row;
          justify-content: center;
          gap: 8px;
          font-size: 14px;
        }
      }
    `]);customElements.define("essensplaner-panel",tt);
