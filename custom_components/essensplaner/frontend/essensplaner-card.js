var Ee=Object.defineProperty;var Pe=(n,e,t)=>e in n?Ee(n,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):n[e]=t;var S=(n,e,t)=>(Pe(n,typeof e!="symbol"?e+"":e,t),t);var L=globalThis,H=L.ShadowRoot&&(L.ShadyCSS===void 0||L.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,B=Symbol(),ne=new WeakMap,E=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==B)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,t=this.t;if(H&&e===void 0){let i=t!==void 0&&t.length===1;i&&(e=ne.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&ne.set(t,e))}return e}toString(){return this.cssText}},re=n=>new E(typeof n=="string"?n:n+"",void 0,B),w=(n,...e)=>{let t=n.length===1?n[0]:e.reduce((i,s,r)=>i+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+n[r+1],n[0]);return new E(t,n,B)},oe=(n,e)=>{if(H)n.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(let t of e){let i=document.createElement("style"),s=L.litNonce;s!==void 0&&i.setAttribute("nonce",s),i.textContent=t.cssText,n.appendChild(i)}},G=H?n=>n:n=>n instanceof CSSStyleSheet?(e=>{let t="";for(let i of e.cssRules)t+=i.cssText;return re(t)})(n):n;var{is:Ce,defineProperty:Me,getOwnPropertyDescriptor:Ne,getOwnPropertyNames:De,getOwnPropertySymbols:Ue,getPrototypeOf:ze}=Object,Z=globalThis,ae=Z.trustedTypes,Te=ae?ae.emptyScript:"",Oe=Z.reactiveElementPolyfillSupport,P=(n,e)=>n,I={toAttribute(n,e){switch(e){case Boolean:n=n?Te:null;break;case Object:case Array:n=n==null?n:JSON.stringify(n)}return n},fromAttribute(n,e){let t=n;switch(e){case Boolean:t=n!==null;break;case Number:t=n===null?null:Number(n);break;case Object:case Array:try{t=JSON.parse(n)}catch{t=null}}return t}},de=(n,e)=>!Ce(n,e),le={attribute:!0,type:String,converter:I,reflect:!1,useDefault:!1,hasChanged:de};Symbol.metadata??=Symbol("metadata"),Z.litPropertyMetadata??=new WeakMap;var m=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=le){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let i=Symbol(),s=this.getPropertyDescriptor(e,i,t);s!==void 0&&Me(this.prototype,e,s)}}static getPropertyDescriptor(e,t,i){let{get:s,set:r}=Ne(this.prototype,e)??{get(){return this[t]},set(o){this[t]=o}};return{get:s,set(o){let l=s?.call(this);r?.call(this,o),this.requestUpdate(e,l,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??le}static _$Ei(){if(this.hasOwnProperty(P("elementProperties")))return;let e=ze(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(P("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(P("properties"))){let t=this.properties,i=[...De(t),...Ue(t)];for(let s of i)this.createProperty(s,t[s])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[i,s]of t)this.elementProperties.set(i,s)}this._$Eh=new Map;for(let[t,i]of this.elementProperties){let s=this._$Eu(t,i);s!==void 0&&this._$Eh.set(s,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let i=new Set(e.flat(1/0).reverse());for(let s of i)t.unshift(G(s))}else e!==void 0&&t.push(G(e));return t}static _$Eu(e,t){let i=t.attribute;return i===!1?void 0:typeof i=="string"?i:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return oe(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){let i=this.constructor.elementProperties.get(e),s=this.constructor._$Eu(e,i);if(s!==void 0&&i.reflect===!0){let r=(i.converter?.toAttribute!==void 0?i.converter:I).toAttribute(t,i.type);this._$Em=e,r==null?this.removeAttribute(s):this.setAttribute(s,r),this._$Em=null}}_$AK(e,t){let i=this.constructor,s=i._$Eh.get(e);if(s!==void 0&&this._$Em!==s){let r=i.getPropertyOptions(s),o=typeof r.converter=="function"?{fromAttribute:r.converter}:r.converter?.fromAttribute!==void 0?r.converter:I;this._$Em=s;let l=o.fromAttribute(t,r.type);this[s]=l??this._$Ej?.get(s)??l,this._$Em=null}}requestUpdate(e,t,i,s=!1,r){if(e!==void 0){let o=this.constructor;if(s===!1&&(r=this[e]),i??=o.getPropertyOptions(e),!((i.hasChanged??de)(r,t)||i.useDefault&&i.reflect&&r===this._$Ej?.get(e)&&!this.hasAttribute(o._$Eu(e,i))))return;this.C(e,t,i)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:s,wrapped:r},o){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,o??t??this[e]),r!==!0||o!==void 0)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),s===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[s,r]of this._$Ep)this[s]=r;this._$Ep=void 0}let i=this.constructor.elementProperties;if(i.size>0)for(let[s,r]of i){let{wrapped:o}=r,l=this[s];o!==!0||this._$AL.has(s)||l===void 0||this.C(s,void 0,r,l)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(i=>i.hostUpdate?.()),this.update(t)):this._$EM()}catch(i){throw e=!1,this._$EM(),i}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};m.elementStyles=[],m.shadowRootOptions={mode:"open"},m[P("elementProperties")]=new Map,m[P("finalized")]=new Map,Oe?.({ReactiveElement:m}),(Z.reactiveElementVersions??=[]).push("2.1.2");var J=globalThis,he=n=>n,j=J.trustedTypes,ce=j?j.createPolicy("lit-html",{createHTML:n=>n}):void 0,_e="$lit$",b=`lit$${Math.random().toFixed(9).slice(2)}$`,be="?"+b,Re=`<${be}>`,v=document,M=()=>v.createComment(""),N=n=>n===null||typeof n!="object"&&typeof n!="function",Q=Array.isArray,Le=n=>Q(n)||typeof n?.[Symbol.iterator]=="function",W=`[ 	
\f\r]`,C=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,pe=/-->/g,ue=/>/g,y=RegExp(`>|${W}(?:([^\\s"'>=/]+)(${W}*=${W}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),ge=/'/g,me=/"/g,ye=/^(?:script|style|textarea|title)$/i,X=n=>(e,...t)=>({_$litType$:n,strings:e,values:t}),u=X(1),qe=X(2),Ye=X(3),$=Symbol.for("lit-noChange"),c=Symbol.for("lit-nothing"),fe=new WeakMap,x=v.createTreeWalker(v,129);function xe(n,e){if(!Q(n)||!n.hasOwnProperty("raw"))throw Error("invalid template strings array");return ce!==void 0?ce.createHTML(e):e}var He=(n,e)=>{let t=n.length-1,i=[],s,r=e===2?"<svg>":e===3?"<math>":"",o=C;for(let l=0;l<t;l++){let a=n[l],h,p,d=-1,g=0;for(;g<a.length&&(o.lastIndex=g,p=o.exec(a),p!==null);)g=o.lastIndex,o===C?p[1]==="!--"?o=pe:p[1]!==void 0?o=ue:p[2]!==void 0?(ye.test(p[2])&&(s=RegExp("</"+p[2],"g")),o=y):p[3]!==void 0&&(o=y):o===y?p[0]===">"?(o=s??C,d=-1):p[1]===void 0?d=-2:(d=o.lastIndex-p[2].length,h=p[1],o=p[3]===void 0?y:p[3]==='"'?me:ge):o===me||o===ge?o=y:o===pe||o===ue?o=C:(o=y,s=void 0);let _=o===y&&n[l+1].startsWith("/>")?" ":"";r+=o===C?a+Re:d>=0?(i.push(h),a.slice(0,d)+_e+a.slice(d)+b+_):a+b+(d===-2?l:_)}return[xe(n,r+(n[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),i]},D=class n{constructor({strings:e,_$litType$:t},i){let s;this.parts=[];let r=0,o=0,l=e.length-1,a=this.parts,[h,p]=He(e,t);if(this.el=n.createElement(h,i),x.currentNode=this.el.content,t===2||t===3){let d=this.el.content.firstChild;d.replaceWith(...d.childNodes)}for(;(s=x.nextNode())!==null&&a.length<l;){if(s.nodeType===1){if(s.hasAttributes())for(let d of s.getAttributeNames())if(d.endsWith(_e)){let g=p[o++],_=s.getAttribute(d).split(b),R=/([.?@])?(.*)/.exec(g);a.push({type:1,index:r,name:R[2],strings:_,ctor:R[1]==="."?V:R[1]==="?"?K:R[1]==="@"?q:k}),s.removeAttribute(d)}else d.startsWith(b)&&(a.push({type:6,index:r}),s.removeAttribute(d));if(ye.test(s.tagName)){let d=s.textContent.split(b),g=d.length-1;if(g>0){s.textContent=j?j.emptyScript:"";for(let _=0;_<g;_++)s.append(d[_],M()),x.nextNode(),a.push({type:2,index:++r});s.append(d[g],M())}}}else if(s.nodeType===8)if(s.data===be)a.push({type:2,index:r});else{let d=-1;for(;(d=s.data.indexOf(b,d+1))!==-1;)a.push({type:7,index:r}),d+=b.length-1}r++}}static createElement(e,t){let i=v.createElement("template");return i.innerHTML=e,i}};function A(n,e,t=n,i){if(e===$)return e;let s=i!==void 0?t._$Co?.[i]:t._$Cl,r=N(e)?void 0:e._$litDirective$;return s?.constructor!==r&&(s?._$AO?.(!1),r===void 0?s=void 0:(s=new r(n),s._$AT(n,t,i)),i!==void 0?(t._$Co??=[])[i]=s:t._$Cl=s),s!==void 0&&(e=A(n,s._$AS(n,e.values),s,i)),e}var F=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:i}=this._$AD,s=(e?.creationScope??v).importNode(t,!0);x.currentNode=s;let r=x.nextNode(),o=0,l=0,a=i[0];for(;a!==void 0;){if(o===a.index){let h;a.type===2?h=new U(r,r.nextSibling,this,e):a.type===1?h=new a.ctor(r,a.name,a.strings,this,e):a.type===6&&(h=new Y(r,this,e)),this._$AV.push(h),a=i[++l]}o!==a?.index&&(r=x.nextNode(),o++)}return x.currentNode=v,s}p(e){let t=0;for(let i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}},U=class n{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,s){this.type=2,this._$AH=c,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=A(this,e,t),N(e)?e===c||e==null||e===""?(this._$AH!==c&&this._$AR(),this._$AH=c):e!==this._$AH&&e!==$&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):Le(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==c&&N(this._$AH)?this._$AA.nextSibling.data=e:this.T(v.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:i}=e,s=typeof i=="number"?this._$AC(e):(i.el===void 0&&(i.el=D.createElement(xe(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(t);else{let r=new F(s,this),o=r.u(this.options);r.p(t),this.T(o),this._$AH=r}}_$AC(e){let t=fe.get(e.strings);return t===void 0&&fe.set(e.strings,t=new D(e)),t}k(e){Q(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,i,s=0;for(let r of e)s===t.length?t.push(i=new n(this.O(M()),this.O(M()),this,this.options)):i=t[s],i._$AI(r),s++;s<t.length&&(this._$AR(i&&i._$AB.nextSibling,s),t.length=s)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let i=he(e).nextSibling;he(e).remove(),e=i}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},k=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,s,r){this.type=1,this._$AH=c,this._$AN=void 0,this.element=e,this.name=t,this._$AM=s,this.options=r,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=c}_$AI(e,t=this,i,s){let r=this.strings,o=!1;if(r===void 0)e=A(this,e,t,0),o=!N(e)||e!==this._$AH&&e!==$,o&&(this._$AH=e);else{let l=e,a,h;for(e=r[0],a=0;a<r.length-1;a++)h=A(this,l[i+a],t,a),h===$&&(h=this._$AH[a]),o||=!N(h)||h!==this._$AH[a],h===c?e=c:e!==c&&(e+=(h??"")+r[a+1]),this._$AH[a]=h}o&&!s&&this.j(e)}j(e){e===c?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},V=class extends k{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===c?void 0:e}},K=class extends k{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==c)}},q=class extends k{constructor(e,t,i,s,r){super(e,t,i,s,r),this.type=5}_$AI(e,t=this){if((e=A(this,e,t,0)??c)===$)return;let i=this._$AH,s=e===c&&i!==c||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,r=e!==c&&(i===c||s);s&&this.element.removeEventListener(this.name,this,i),r&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},Y=class{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){A(this,e)}};var Ze=J.litHtmlPolyfillSupport;Ze?.(D,U),(J.litHtmlVersions??=[]).push("3.3.3");var ve=(n,e,t)=>{let i=t?.renderBefore??e,s=i._$litPart$;if(s===void 0){let r=t?.renderBefore??null;i._$litPart$=s=new U(e.insertBefore(M(),r),r,void 0,t??{})}return s._$AI(n),s};var ee=globalThis,f=class extends m{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=ve(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return $}};f._$litElement$=!0,f.finalized=!0,ee.litElementHydrateSupport?.({LitElement:f});var je=ee.litElementPolyfillSupport;je?.({LitElement:f});(ee.litElementVersions??=[]).push("4.2.2");var $e=["breakfast","lunch","dinner","snack"],z=class{constructor(e){this.hass=e}call(e,t={}){return this.hass.callWS({type:`essensplaner/${e}`,...t})}data(){return this.call("data")}compat(){return this.call("compat/all")}dishCheck(e){return this.call("dish/check",{dish_id:e})}saveDish(e){return this.call("dish/save",{dish:e})}deleteDish(e){return this.call("dish/delete",{dish_id:e})}saveProfile(e){return this.call("profile/save",{profile:e})}deleteProfile(e){return this.call("profile/delete",{profile_id:e})}profileIngredients(e){return this.call("profile/ingredients",{profile_id:e})}profileGroups(e){return this.call("profile/groups",{profile_id:e})}setGroups(e,t){return this.call("profile/set_groups",{profile_id:e,excluded_groups:t})}setIngredient(e){return this.call("profile/set_ingredient",e)}parseIngredients(e){return this.call("parse_ingredients",{text:e})}plan(e,t){return this.call("plan/get",{start_date:e,days:t})}setMeal(e,t,i){return this.call("plan/set_meal",{date:e,meal_type:t,assignments:i})}generate(e){return this.call("plan/generate",e)}shoppingPreview(e,t){return this.call("shopping/preview",{start_date:e,days:t})}shoppingPush(e){return this.call("shopping/push",e)}imageFromUrl(e){return this.call("image/from_url",{url:e})}async uploadImage(e){let t=new FormData;t.append("file",e);let i=await this.hass.fetchWithAuth("/api/essensplaner/upload",{method:"POST",body:t}),s=await i.json();if(!i.ok)throw new Error(s.message||i.statusText);return{id:s.id,source:s.source}}subscribe(e){return this.hass.connection.subscribeMessage(e,{type:"essensplaner/subscribe"})}};function we(n){return n&&n.id?`/api/essensplaner/images/${n.id}`:null}function Ae(n){let e=n.getFullYear(),t=String(n.getMonth()+1).padStart(2,"0"),i=String(n.getDate()).padStart(2,"0");return`${e}-${t}-${i}`}function ke(n,e){let t=new Date(n);return t.setDate(t.getDate()+e),t}function Se(n){history.pushState(null,"",n),window.dispatchEvent(new CustomEvent("location-changed",{detail:{replace:!1}}))}var Be={title:"Essensplaner","tab.plan":"Wochenplan","tab.dishes":"Gerichte","tab.profiles":"Personen","tab.shopping":"Einkauf","meal.breakfast":"Fr\xFChst\xFCck","meal.lunch":"Mittag","meal.dinner":"Abend","meal.snack":"Snack","plan.week":"KW {week}","plan.today":"Heute","plan.generate":"Woche planen","plan.empty":"Nichts geplant","plan.add_meal":"Mahlzeit","plan.shared":"Gemeinsam: {items}","plan.servings":"{n} Port.","gen.title":"Woche planen","gen.days":"Tage und Mahlzeiten","gen.profiles":"F\xFCr wen?","gen.overwrite":"Bereits geplante Mahlzeiten neu planen (manuell gesetzte bleiben)","gen.run":"Planen","gen.done":"Plan erstellt: {n} Gerichte eingeplant.","gen.no_dish":"{day} {meal}: kein passendes Gericht f\xFCr {profiles}","slot.title":"{day} \xB7 {meal}","slot.for":"F\xFCr","slot.add":"Gericht w\xE4hlen","slot.remove":"Entfernen","slot.search":"Gericht suchen \u2026","slot.show_all_meals":"Alle Mahlzeitentypen","slot.show_unsuitable":"Auch unpassende zeigen","slot.no_profiles":"W\xE4hle zuerst mindestens eine Person.","slot.nothing":"Noch kein Gericht f\xFCr diese Mahlzeit.","dishes.search":"Suchen \u2026","dishes.new":"Neues Gericht","dishes.all_meals":"Alle","dishes.fits":"Passt f\xFCr","dishes.anyone":"Egal","dishes.count":"{n} Gerichte","dishes.none":"Keine Gerichte gefunden.","dish.minutes":"{n} Min.","dish.servings":"Portionen","dish.ingredients":"Zutaten","dish.steps":"Zubereitung","dish.source":"Quelle","dish.compat":"Vertr\xE4glichkeit","dish.edit":"Bearbeiten","edit.new_title":"Neues Gericht","edit.title":"Gericht bearbeiten","edit.name":"Name","edit.meal_types":"Mahlzeiten","edit.suitable_for":"Nur f\xFCr (keine Auswahl = alle)","edit.base_servings":"Portionen im Rezept","edit.duration":"Dauer (Minuten)","edit.tags":"Tags (durch Komma getrennt)","edit.ingredients":"Zutaten (eine pro Zeile)","edit.ingredients_help":"z. B. \u201E250 g H\xFChnerbrust #protein\u201C, \u201E150 g Reis #beilage\u201C, \u201E2 Karotten\u201C, \u201ESalz\u201C","edit.steps":"Zubereitung (ein Schritt pro Zeile)","edit.source_url":"Quelle (URL)","edit.image":"Bild","edit.upload":"Foto hochladen","edit.image_url":"Bild-URL","edit.image_from_url":"\xDCbernehmen","edit.image_remove":"Bild entfernen","edit.uploading":"Wird hochgeladen \u2026","profile.new":"Neue Person","profile.title":"Person bearbeiten","profile.name":"Name","profile.servings":"Portionen","profile.unknown":"Zutaten, die in keiner Liste stehen","profile.unknown.allow":"Erlauben","profile.unknown.warn":"Erlauben, aber warnen","profile.unknown.exclude":"Ausschlie\xDFen (nur Vertr\xE4gliches)","profile.max_duration":"Maximale Zubereitungszeit (Minuten, leer = egal)","profile.tolerated":"Vertr\xE4glich","profile.not_tolerated":"Nicht vertr\xE4glich","profile.small_amounts":"Nur in kleinen Mengen","profile.small_help":"Eine Zutat pro Zeile, optional mit H\xF6chstmenge pro Portion, z. B. \u201E10 g Butter\u201C","profile.likes":"Vorlieben","profile.dislikes":"Abneigungen","profile.list_help":"Ein Eintrag pro Zeile","profile.summary":"{tol} vertr\xE4glich \xB7 {not} nicht vertr\xE4glich \xB7 {small} kleine Mengen","profile.fitting":"{n} passende Gerichte","shop.start":"Ab","shop.days":"Tage","shop.target":"To-do-Liste","shop.skip_existing":"Was schon offen auf der Liste steht, \xFCberspringen","shop.push":"In Liste \xFCbertragen","shop.empty":"Im gew\xE4hlten Zeitraum ist nichts geplant.","shop.result":"{added} hinzugef\xFCgt, {skipped} \xFCbersprungen.","shop.no_target":"Bitte eine To-do-Liste w\xE4hlen.","shop.select_all":"Alle","shop.select_none":"Keine","common.save":"Speichern","common.cancel":"Abbrechen","common.close":"Schlie\xDFen","common.delete":"L\xF6schen","common.confirm_delete":"Wirklich l\xF6schen?","common.add":"Hinzuf\xFCgen","common.loading":"L\xE4dt \u2026","common.error":"Fehler: {msg}","status.ok":"passt","status.warn":"mit Hinweis","status.excluded":"passt nicht","reason.not_suitable":"nicht f\xFCr diese Person vorgesehen","reason.too_long":"dauert zu lange ({duration} Min.)","reason.dislike":"Abneigung: {term}","reason.not_tolerated":"{ingredient} nicht vertr\xE4glich","reason.small_amount":"{ingredient} nur in kleinen Mengen","reason.small_amount_unchecked":"{ingredient}: Menge nicht pr\xFCfbar","reason.small_amount_exceeded":"{ingredient}: {amount} {unit} pro Portion (max. {max})","reason.unknown_ingredient":"{ingredient} steht in keiner Liste","reason.no_ingredients":"keine Zutaten hinterlegt","ingr.open":"Zutaten anklicken","ingr.title":"Vertr\xE4glichkeit \xB7 {name}","ingr.search":"Zutat suchen oder neu eingeben \u2026","ingr.filter.all":"Alle","ingr.filter.unknown":"Offen","ingr.filter.tolerated":"Vertr\xE4glich","ingr.filter.small":"Nur wenig","ingr.filter.not_tolerated":"Nicht vertr\xE4glich","ingr.state.tolerated":"vertr\xE4glich","ingr.state.small":"nur in kleinen Mengen","ingr.state.not_tolerated":"nicht vertr\xE4glich","ingr.by.tolerated":"vertr\xE4glich durch \u201E{term}\u201C","ingr.by.small":"nur wenig durch \u201E{term}\u201C","ingr.by.not_tolerated":"nicht vertr\xE4glich durch \u201E{term}\u201C","ingr.count":"in {n} Gerichten","ingr.no_dish":"in keinem Gericht","ingr.limit":"H\xF6chstens pro Portion:","ingr.add":"hinzuf\xFCgen:","ingr.none":"Keine Zutaten in dieser Auswahl.","ingr.done":"Fertig","ingr.hint_exclude":"Offene Zutaten gelten f\xFCr diese Person als nicht vertr\xE4glich. Gerichte werden erst vorgeschlagen, wenn alle ihre Zutaten als vertr\xE4glich markiert sind.","groups.button":"Allergene","groups.title":"Allergene & Fleisch \xB7 {name}","groups.intro":"Schalter an = vertr\xE4gt bzw. isst die Person nicht. Alle typischen Zutaten der Gruppe gelten dann als nicht vertr\xE4glich \u2013 auch in Gerichten, die sp\xE4ter dazukommen. Einzelne Zutaten lassen sich in der Zutatenliste trotzdem mit \u2713 freigeben.","groups.allergens_title":"Allergien & Unvertr\xE4glichkeiten","groups.meat_title":"Fleisch & Fisch \u2013 isst die Person nicht","groups.affects":"betrifft {n} Zutaten deiner Gerichte","groups.affects_one":"betrifft 1 Zutat deiner Gerichte","groups.affects_none":"kommt in deinen Gerichten derzeit nicht vor","groups.show_all":"alle {n} zeigen","groups.active":"{n} ausgeschlossen","groups.back":"Zur\xFCck zur Zutatenliste","groups.bar_title":"Ausgeschlossen (Allergene & Fleisch):","groups.none":"nichts ausgeschlossen","groups.editor_title":"Allergene & Fleisch (rot = ausgeschlossen)","groups.disclaimer":"Die Gruppen sind eine Auswahlhilfe und ersetzen keine Allergenkennzeichnung verarbeiteter Produkte.","groups.meat":"Isst nicht:","groups.allergens":"Allergien & Unvertr\xE4glichkeiten:","groups.without":"ohne {group}","ingr.by_group":"nicht vertr\xE4glich durch \u201E{group}\u201C","reason.group_excluded":"{ingredient}: {group}","profile.as_text":"Vertr\xE4glichkeit als Text bearbeiten","profile.as_text_help":"Dieselben Listen wie bei \u201EZutaten anklicken\u201C, hier als Text.","card.title":"Was gibt's heute?","card.title_label":"Titel","card.tomorrow":"Was gibt's morgen?","card.nothing":"Heute ist nichts geplant.","card.not_loaded":"Essensplaner ist nicht eingerichtet."},te={title:"Meal planner","tab.plan":"Week","tab.dishes":"Dishes","tab.profiles":"People","tab.shopping":"Shopping","meal.breakfast":"Breakfast","meal.lunch":"Lunch","meal.dinner":"Dinner","meal.snack":"Snack","plan.week":"Week {week}","plan.today":"Today","plan.generate":"Plan week","plan.empty":"Nothing planned","plan.add_meal":"Meal","plan.shared":"Shared: {items}","plan.servings":"{n} serv.","gen.title":"Plan week","gen.days":"Days and meals","gen.profiles":"For whom?","gen.overwrite":"Re-plan meals that are already planned (manual ones are kept)","gen.run":"Plan","gen.done":"Plan created: {n} dishes planned.","gen.no_dish":"{day} {meal}: no suitable dish for {profiles}","slot.title":"{day} \xB7 {meal}","slot.for":"For","slot.add":"Choose dish","slot.remove":"Remove","slot.search":"Search dish \u2026","slot.show_all_meals":"All meal types","slot.show_unsuitable":"Show unsuitable too","slot.no_profiles":"Select at least one person first.","slot.nothing":"No dish for this meal yet.","dishes.search":"Search \u2026","dishes.new":"New dish","dishes.all_meals":"All","dishes.fits":"Suits","dishes.anyone":"Anyone","dishes.count":"{n} dishes","dishes.none":"No dishes found.","dish.minutes":"{n} min","dish.servings":"Servings","dish.ingredients":"Ingredients","dish.steps":"Preparation","dish.source":"Source","dish.compat":"Suitability","dish.edit":"Edit","edit.new_title":"New dish","edit.title":"Edit dish","edit.name":"Name","edit.meal_types":"Meals","edit.suitable_for":"Only for (none selected = everyone)","edit.base_servings":"Servings in recipe","edit.duration":"Duration (minutes)","edit.tags":"Tags (comma separated)","edit.ingredients":"Ingredients (one per line)","edit.ingredients_help":'e.g. "250 g chicken breast #protein", "150 g rice #side", "2 carrots", "salt"',"edit.steps":"Preparation (one step per line)","edit.source_url":"Source (URL)","edit.image":"Image","edit.upload":"Upload photo","edit.image_url":"Image URL","edit.image_from_url":"Use","edit.image_remove":"Remove image","edit.uploading":"Uploading \u2026","profile.new":"New person","profile.title":"Edit person","profile.name":"Name","profile.servings":"Servings","profile.unknown":"Ingredients not in any list","profile.unknown.allow":"Allow","profile.unknown.warn":"Allow with warning","profile.unknown.exclude":"Exclude (tolerated only)","profile.max_duration":"Maximum preparation time (minutes, empty = any)","profile.tolerated":"Tolerated","profile.not_tolerated":"Not tolerated","profile.small_amounts":"Only in small amounts","profile.small_help":'One ingredient per line, optionally with a maximum per serving, e.g. "10 g butter"',"profile.likes":"Likes","profile.dislikes":"Dislikes","profile.list_help":"One entry per line","profile.summary":"{tol} tolerated \xB7 {not} not tolerated \xB7 {small} small amounts","profile.fitting":"{n} suitable dishes","shop.start":"From","shop.days":"Days","shop.target":"To-do list","shop.skip_existing":"Skip items already open on the list","shop.push":"Send to list","shop.empty":"Nothing planned in this period.","shop.result":"{added} added, {skipped} skipped.","shop.no_target":"Please choose a to-do list.","shop.select_all":"All","shop.select_none":"None","common.save":"Save","common.cancel":"Cancel","common.close":"Close","common.delete":"Delete","common.confirm_delete":"Really delete?","common.add":"Add","common.loading":"Loading \u2026","common.error":"Error: {msg}","status.ok":"suitable","status.warn":"with note","status.excluded":"not suitable","reason.not_suitable":"not intended for this person","reason.too_long":"takes too long ({duration} min)","reason.dislike":"dislike: {term}","reason.not_tolerated":"{ingredient} not tolerated","reason.small_amount":"{ingredient} only in small amounts","reason.small_amount_unchecked":"{ingredient}: amount cannot be checked","reason.small_amount_exceeded":"{ingredient}: {amount} {unit} per serving (max {max})","reason.unknown_ingredient":"{ingredient} is not in any list","reason.no_ingredients":"no ingredients","ingr.open":"Tick ingredients","ingr.title":"Tolerances \xB7 {name}","ingr.search":"Search or enter new ingredient \u2026","ingr.filter.all":"All","ingr.filter.unknown":"Open","ingr.filter.tolerated":"Tolerated","ingr.filter.small":"Small amounts","ingr.filter.not_tolerated":"Not tolerated","ingr.state.tolerated":"tolerated","ingr.state.small":"only in small amounts","ingr.state.not_tolerated":"not tolerated","ingr.by.tolerated":'tolerated via "{term}"',"ingr.by.small":'small amounts via "{term}"',"ingr.by.not_tolerated":'not tolerated via "{term}"',"ingr.count":"in {n} dishes","ingr.no_dish":"in no dish","ingr.limit":"Maximum per serving:","ingr.add":"add:","ingr.none":"No ingredients in this selection.","ingr.done":"Done","ingr.hint_exclude":"Open ingredients count as not tolerated for this person. Dishes are only suggested once all their ingredients are marked as tolerated.","groups.button":"Allergens","groups.title":"Allergens & meat \xB7 {name}","groups.intro":"Switch on = this person does not tolerate or eat it. All typical ingredients of the group then count as not tolerated \u2013 also in dishes added later. Single ingredients can still be allowed in the ingredient list with \u2713.","groups.allergens_title":"Allergies & intolerances","groups.meat_title":"Meat & fish \u2013 does not eat","groups.affects":"affects {n} ingredients of your dishes","groups.affects_one":"affects 1 ingredient of your dishes","groups.affects_none":"currently not in any of your dishes","groups.show_all":"show all {n}","groups.active":"{n} excluded","groups.back":"Back to ingredient list","groups.bar_title":"Excluded (allergens & meat):","groups.none":"nothing excluded","groups.editor_title":"Allergens & meat (red = excluded)","groups.disclaimer":"The groups are a selection aid and do not replace allergen labelling of processed products.","groups.meat":"Does not eat:","groups.allergens":"Allergies & intolerances:","groups.without":"no {group}","ingr.by_group":'not tolerated via "{group}"',"reason.group_excluded":"{ingredient}: {group}","profile.as_text":"Edit tolerances as text","profile.as_text_help":'The same lists as in "Tick ingredients", as text.',"card.title":"What's for today?","card.title_label":"Title","card.tomorrow":"What's for tomorrow?","card.nothing":"Nothing planned for today.","card.not_loaded":"Meal planner is not set up."},Ge={de:Be,en:te};function ie(n,e,t={}){let i=n&&n.language&&n.language.split("-")[0]||"en",r=(Ge[i]||te)[e]??te[e]??e;for(let[o,l]of Object.entries(t))r=r.replaceAll(`{${o}}`,String(l));return r}var se=w`
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
`,pt=w`
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
`;var T=class extends f{constructor(){super(),this._config={},this._data=null,this._day=null,this._error=null,this._unsub=null,this._api=null,this._loadedDate=null}static getStubConfig(){return{show_images:!0}}static getConfigElement(){return document.createElement("essensplaner-today-card-editor")}setConfig(e){this._config={show_images:!0,day_offset:0,...e},this._loadedDate=null}getCardSize(){return 3}t(e,t){return ie(this.hass,e,t)}get _date(){return Ae(ke(new Date,Number(this._config.day_offset)||0))}connectedCallback(){super.connectedCallback(),this.hass&&this._start()}disconnectedCallback(){super.disconnectedCallback(),this._unsub&&(this._unsub.then(e=>e()).catch(()=>{}),this._unsub=null)}updated(e){e.has("hass")&&this.hass&&(this._unsub?this._api.hass=this.hass:this._start(),this._loadedDate&&this._loadedDate!==this._date&&this._load())}_start(){this._api=new z(this.hass),this._load(),this._unsub=this._api.subscribe(()=>this._load()),this._unsub.catch(e=>this._error=e.message||String(e))}async _load(){let e=this._date;this._loadedDate=e;try{let[t,i]=await Promise.all([this._api.data(),this._api.plan(e,1)]);this._data=t,this._day=i[e]||{},this._error=null}catch(t){this._error=t.code==="unknown_command"||t.code==="not_loaded"?this.t("card.not_loaded"):t.message}}_open(e){Se(`/essensplaner?dish=${encodeURIComponent(e)}`)}_profileName(e){let t=this._data&&this._data.profiles.find(i=>i.id===e);return t?t.name:"?"}render(){let e=Number(this._config.day_offset)||0,t=this._config.title||this.t(e===1?"card.tomorrow":"card.title"),i=this._config.profiles;return u`
      <ha-card>
        <div class="header">${t}</div>
        <div class="content">
          ${this._error?u`<p class="muted">${this._error}</p>`:this._day?this._renderDay(i):u`<p class="muted">${this.t("common.loading")}</p>`}
        </div>
      </ha-card>
    `}_renderDay(e){let i=$e.filter(r=>this._day[r]).map(r=>({meal:r,assignments:this._day[r].assignments.filter(o=>!e||!e.length||o.profiles.some(l=>e.includes(l)))})).filter(r=>r.assignments.length);if(!i.length)return u`<p class="muted">${this.t("card.nothing")}</p>`;let s=Object.fromEntries((this._data.dishes||[]).map(r=>[r.id,r]));return i.map(r=>u`
        <div class="meal">
          <div class="meal-name">${this.t(`meal.${r.meal}`)}</div>
          ${r.assignments.map(o=>{let l=this._config.show_images?we(s[o.dish_id]&&s[o.dish_id].image):null;return u`<button class="dish" @click=${()=>this._open(o.dish_id)}>
              ${this._config.show_images?l?u`<img class="thumb" src=${l} alt="" loading="lazy" />`:u`<span class="thumb"><ha-icon icon="mdi:silverware-fork-knife"></ha-icon></span>`:""}
              <span class="text">
                <span class="name">${o.dish_name}</span>
                <span class="who">${o.profiles.map(a=>this._profileName(a)).join(", ")}</span>
              </span>
            </button>`})}
        </div>
      `)}};S(T,"properties",{hass:{attribute:!1},_config:{state:!0},_data:{state:!0},_day:{state:!0},_error:{state:!0}}),S(T,"styles",[se,w`
      .header {
        padding: 16px 16px 4px;
        font-size: 20px;
        font-weight: 500;
      }
      .content {
        padding: 4px 16px 16px;
      }
      .meal + .meal {
        margin-top: 8px;
      }
      .meal-name {
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--secondary-text-color);
        margin: 6px 0 2px;
      }
      .dish {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        padding: 6px 0;
        border: none;
        background: transparent;
        color: inherit;
        text-align: left;
      }
      .thumb {
        width: 52px;
        height: 52px;
      }
      .text {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .name {
        font-weight: 500;
      }
      .who {
        font-size: 13px;
        color: var(--secondary-text-color);
      }
    `]);var O=class extends f{constructor(){super(),this._config={},this._profiles=[]}setConfig(e){this._config=e}updated(e){e.has("hass")&&this.hass&&!this._loaded&&(this._loaded=!0,new z(this.hass).data().then(t=>this._profiles=t.profiles).catch(()=>{}))}_change(e,t){let i={...this._config,[e]:t};(t===""||t===void 0||Array.isArray(t)&&!t.length)&&delete i[e],this._config=i,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:i},bubbles:!0,composed:!0}))}_toggleProfile(e){let t=this._config.profiles||[];this._change("profiles",t.includes(e)?t.filter(i=>i!==e):[...t,e])}render(){let e=i=>ie(this.hass,i),t=this._config.profiles||[];return u`
      <label class="field">
        <span>${e("card.title_label")}</span>
        <input type="text" .value=${this._config.title||""} @input=${i=>this._change("title",i.target.value)} />
      </label>
      <label class="row field">
        <input type="checkbox" .checked=${this._config.show_images!==!1}
          @change=${i=>this._change("show_images",i.target.checked)} />
        <span>${e("edit.image")}</span>
      </label>
      <label class="row field">
        <input type="checkbox" .checked=${Number(this._config.day_offset)===1}
          @change=${i=>this._change("day_offset",i.target.checked?1:0)} />
        <span>${e("card.tomorrow")}</span>
      </label>
      <div class="field">
        <span class="muted">${e("tab.profiles")}</span>
        <div class="chips">
          ${this._profiles.map(i=>u`<button class="chip ${t.includes(i.id)?"on":""}" @click=${()=>this._toggleProfile(i.id)}>
              ${i.name}
            </button>`)}
        </div>
      </div>
    `}};S(O,"properties",{hass:{attribute:!1},_config:{state:!0},_profiles:{state:!0}}),S(O,"styles",[se]);customElements.get("essensplaner-today-card")||(customElements.define("essensplaner-today-card",T),customElements.define("essensplaner-today-card-editor",O),window.customCards=window.customCards||[],window.customCards.push({type:"essensplaner-today-card",name:"Essensplaner \u2013 Heute",description:"Zeigt, was es heute gibt.",preview:!0}));
