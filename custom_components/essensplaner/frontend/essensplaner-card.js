var Ee=Object.defineProperty;var Ce=(n,e,t)=>e in n?Ee(n,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):n[e]=t;var k=(n,e,t)=>(Ce(n,typeof e!="symbol"?e+"":e,t),t);var L=globalThis,H=L.ShadowRoot&&(L.ShadyCSS===void 0||L.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,W=Symbol(),ne=new WeakMap,E=class{constructor(e,t,s){if(this._$cssResult$=!0,s!==W)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,t=this.t;if(H&&e===void 0){let s=t!==void 0&&t.length===1;s&&(e=ne.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),s&&ne.set(t,e))}return e}toString(){return this.cssText}},re=n=>new E(typeof n=="string"?n:n+"",void 0,W),w=(n,...e)=>{let t=n.length===1?n[0]:e.reduce((s,i,r)=>s+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+n[r+1],n[0]);return new E(t,n,W)},oe=(n,e)=>{if(H)n.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(let t of e){let s=document.createElement("style"),i=L.litNonce;i!==void 0&&s.setAttribute("nonce",i),s.textContent=t.cssText,n.appendChild(s)}},I=H?n=>n:n=>n instanceof CSSStyleSheet?(e=>{let t="";for(let s of e.cssRules)t+=s.cssText;return re(t)})(n):n;var{is:Pe,defineProperty:Me,getOwnPropertyDescriptor:Ne,getOwnPropertyNames:Ue,getOwnPropertySymbols:De,getPrototypeOf:Te}=Object,j=globalThis,ae=j.trustedTypes,ze=ae?ae.emptyScript:"",Oe=j.reactiveElementPolyfillSupport,C=(n,e)=>n,Z={toAttribute(n,e){switch(e){case Boolean:n=n?ze:null;break;case Object:case Array:n=n==null?n:JSON.stringify(n)}return n},fromAttribute(n,e){let t=n;switch(e){case Boolean:t=n!==null;break;case Number:t=n===null?null:Number(n);break;case Object:case Array:try{t=JSON.parse(n)}catch{t=null}}return t}},de=(n,e)=>!Pe(n,e),le={attribute:!0,type:String,converter:Z,reflect:!1,useDefault:!1,hasChanged:de};Symbol.metadata??=Symbol("metadata"),j.litPropertyMetadata??=new WeakMap;var g=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=le){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let s=Symbol(),i=this.getPropertyDescriptor(e,s,t);i!==void 0&&Me(this.prototype,e,i)}}static getPropertyDescriptor(e,t,s){let{get:i,set:r}=Ne(this.prototype,e)??{get(){return this[t]},set(o){this[t]=o}};return{get:i,set(o){let l=i?.call(this);r?.call(this,o),this.requestUpdate(e,l,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??le}static _$Ei(){if(this.hasOwnProperty(C("elementProperties")))return;let e=Te(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(C("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(C("properties"))){let t=this.properties,s=[...Ue(t),...De(t)];for(let i of s)this.createProperty(i,t[i])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[s,i]of t)this.elementProperties.set(s,i)}this._$Eh=new Map;for(let[t,s]of this.elementProperties){let i=this._$Eu(t,s);i!==void 0&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let s=new Set(e.flat(1/0).reverse());for(let i of s)t.unshift(I(i))}else e!==void 0&&t.push(I(e));return t}static _$Eu(e,t){let s=t.attribute;return s===!1?void 0:typeof s=="string"?s:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let s of t.keys())this.hasOwnProperty(s)&&(e.set(s,this[s]),delete this[s]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return oe(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,s){this._$AK(e,s)}_$ET(e,t){let s=this.constructor.elementProperties.get(e),i=this.constructor._$Eu(e,s);if(i!==void 0&&s.reflect===!0){let r=(s.converter?.toAttribute!==void 0?s.converter:Z).toAttribute(t,s.type);this._$Em=e,r==null?this.removeAttribute(i):this.setAttribute(i,r),this._$Em=null}}_$AK(e,t){let s=this.constructor,i=s._$Eh.get(e);if(i!==void 0&&this._$Em!==i){let r=s.getPropertyOptions(i),o=typeof r.converter=="function"?{fromAttribute:r.converter}:r.converter?.fromAttribute!==void 0?r.converter:Z;this._$Em=i;let l=o.fromAttribute(t,r.type);this[i]=l??this._$Ej?.get(i)??l,this._$Em=null}}requestUpdate(e,t,s,i=!1,r){if(e!==void 0){let o=this.constructor;if(i===!1&&(r=this[e]),s??=o.getPropertyOptions(e),!((s.hasChanged??de)(r,t)||s.useDefault&&s.reflect&&r===this._$Ej?.get(e)&&!this.hasAttribute(o._$Eu(e,s))))return;this.C(e,t,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:s,reflect:i,wrapped:r},o){s&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,o??t??this[e]),r!==!0||o!==void 0)||(this._$AL.has(e)||(this.hasUpdated||s||(t=void 0),this._$AL.set(e,t)),i===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[i,r]of this._$Ep)this[i]=r;this._$Ep=void 0}let s=this.constructor.elementProperties;if(s.size>0)for(let[i,r]of s){let{wrapped:o}=r,l=this[i];o!==!0||this._$AL.has(i)||l===void 0||this.C(i,void 0,r,l)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(t)):this._$EM()}catch(s){throw e=!1,this._$EM(),s}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};g.elementStyles=[],g.shadowRootOptions={mode:"open"},g[C("elementProperties")]=new Map,g[C("finalized")]=new Map,Oe?.({ReactiveElement:g}),(j.reactiveElementVersions??=[]).push("2.1.2");var J=globalThis,he=n=>n,B=J.trustedTypes,ce=B?B.createPolicy("lit-html",{createHTML:n=>n}):void 0,_e="$lit$",b=`lit$${Math.random().toFixed(9).slice(2)}$`,be="?"+b,Re=`<${be}>`,x=document,M=()=>x.createComment(""),N=n=>n===null||typeof n!="object"&&typeof n!="function",Q=Array.isArray,Le=n=>Q(n)||typeof n?.[Symbol.iterator]=="function",F=`[ 	
\f\r]`,P=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,pe=/-->/g,ue=/>/g,y=RegExp(`>|${F}(?:([^\\s"'>=/]+)(${F}*=${F}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),me=/'/g,ge=/"/g,ye=/^(?:script|style|textarea|title)$/i,X=n=>(e,...t)=>({_$litType$:n,strings:e,values:t}),u=X(1),qe=X(2),Ye=X(3),v=Symbol.for("lit-noChange"),c=Symbol.for("lit-nothing"),fe=new WeakMap,$=x.createTreeWalker(x,129);function $e(n,e){if(!Q(n)||!n.hasOwnProperty("raw"))throw Error("invalid template strings array");return ce!==void 0?ce.createHTML(e):e}var He=(n,e)=>{let t=n.length-1,s=[],i,r=e===2?"<svg>":e===3?"<math>":"",o=P;for(let l=0;l<t;l++){let a=n[l],h,p,d=-1,m=0;for(;m<a.length&&(o.lastIndex=m,p=o.exec(a),p!==null);)m=o.lastIndex,o===P?p[1]==="!--"?o=pe:p[1]!==void 0?o=ue:p[2]!==void 0?(ye.test(p[2])&&(i=RegExp("</"+p[2],"g")),o=y):p[3]!==void 0&&(o=y):o===y?p[0]===">"?(o=i??P,d=-1):p[1]===void 0?d=-2:(d=o.lastIndex-p[2].length,h=p[1],o=p[3]===void 0?y:p[3]==='"'?ge:me):o===ge||o===me?o=y:o===pe||o===ue?o=P:(o=y,i=void 0);let _=o===y&&n[l+1].startsWith("/>")?" ":"";r+=o===P?a+Re:d>=0?(s.push(h),a.slice(0,d)+_e+a.slice(d)+b+_):a+b+(d===-2?l:_)}return[$e(n,r+(n[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),s]},U=class n{constructor({strings:e,_$litType$:t},s){let i;this.parts=[];let r=0,o=0,l=e.length-1,a=this.parts,[h,p]=He(e,t);if(this.el=n.createElement(h,s),$.currentNode=this.el.content,t===2||t===3){let d=this.el.content.firstChild;d.replaceWith(...d.childNodes)}for(;(i=$.nextNode())!==null&&a.length<l;){if(i.nodeType===1){if(i.hasAttributes())for(let d of i.getAttributeNames())if(d.endsWith(_e)){let m=p[o++],_=i.getAttribute(d).split(b),R=/([.?@])?(.*)/.exec(m);a.push({type:1,index:r,name:R[2],strings:_,ctor:R[1]==="."?V:R[1]==="?"?K:R[1]==="@"?q:S}),i.removeAttribute(d)}else d.startsWith(b)&&(a.push({type:6,index:r}),i.removeAttribute(d));if(ye.test(i.tagName)){let d=i.textContent.split(b),m=d.length-1;if(m>0){i.textContent=B?B.emptyScript:"";for(let _=0;_<m;_++)i.append(d[_],M()),$.nextNode(),a.push({type:2,index:++r});i.append(d[m],M())}}}else if(i.nodeType===8)if(i.data===be)a.push({type:2,index:r});else{let d=-1;for(;(d=i.data.indexOf(b,d+1))!==-1;)a.push({type:7,index:r}),d+=b.length-1}r++}}static createElement(e,t){let s=x.createElement("template");return s.innerHTML=e,s}};function A(n,e,t=n,s){if(e===v)return e;let i=s!==void 0?t._$Co?.[s]:t._$Cl,r=N(e)?void 0:e._$litDirective$;return i?.constructor!==r&&(i?._$AO?.(!1),r===void 0?i=void 0:(i=new r(n),i._$AT(n,t,s)),s!==void 0?(t._$Co??=[])[s]=i:t._$Cl=i),i!==void 0&&(e=A(n,i._$AS(n,e.values),i,s)),e}var G=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:s}=this._$AD,i=(e?.creationScope??x).importNode(t,!0);$.currentNode=i;let r=$.nextNode(),o=0,l=0,a=s[0];for(;a!==void 0;){if(o===a.index){let h;a.type===2?h=new D(r,r.nextSibling,this,e):a.type===1?h=new a.ctor(r,a.name,a.strings,this,e):a.type===6&&(h=new Y(r,this,e)),this._$AV.push(h),a=s[++l]}o!==a?.index&&(r=$.nextNode(),o++)}return $.currentNode=x,i}p(e){let t=0;for(let s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(e,s,t),t+=s.strings.length-2):s._$AI(e[t])),t++}},D=class n{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,s,i){this.type=2,this._$AH=c,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=s,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=A(this,e,t),N(e)?e===c||e==null||e===""?(this._$AH!==c&&this._$AR(),this._$AH=c):e!==this._$AH&&e!==v&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):Le(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==c&&N(this._$AH)?this._$AA.nextSibling.data=e:this.T(x.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:s}=e,i=typeof s=="number"?this._$AC(e):(s.el===void 0&&(s.el=U.createElement($e(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===i)this._$AH.p(t);else{let r=new G(i,this),o=r.u(this.options);r.p(t),this.T(o),this._$AH=r}}_$AC(e){let t=fe.get(e.strings);return t===void 0&&fe.set(e.strings,t=new U(e)),t}k(e){Q(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,s,i=0;for(let r of e)i===t.length?t.push(s=new n(this.O(M()),this.O(M()),this,this.options)):s=t[i],s._$AI(r),i++;i<t.length&&(this._$AR(s&&s._$AB.nextSibling,i),t.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let s=he(e).nextSibling;he(e).remove(),e=s}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},S=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,s,i,r){this.type=1,this._$AH=c,this._$AN=void 0,this.element=e,this.name=t,this._$AM=i,this.options=r,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=c}_$AI(e,t=this,s,i){let r=this.strings,o=!1;if(r===void 0)e=A(this,e,t,0),o=!N(e)||e!==this._$AH&&e!==v,o&&(this._$AH=e);else{let l=e,a,h;for(e=r[0],a=0;a<r.length-1;a++)h=A(this,l[s+a],t,a),h===v&&(h=this._$AH[a]),o||=!N(h)||h!==this._$AH[a],h===c?e=c:e!==c&&(e+=(h??"")+r[a+1]),this._$AH[a]=h}o&&!i&&this.j(e)}j(e){e===c?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},V=class extends S{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===c?void 0:e}},K=class extends S{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==c)}},q=class extends S{constructor(e,t,s,i,r){super(e,t,s,i,r),this.type=5}_$AI(e,t=this){if((e=A(this,e,t,0)??c)===v)return;let s=this._$AH,i=e===c&&s!==c||e.capture!==s.capture||e.once!==s.once||e.passive!==s.passive,r=e!==c&&(s===c||i);i&&this.element.removeEventListener(this.name,this,s),r&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},Y=class{constructor(e,t,s){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(e){A(this,e)}};var je=J.litHtmlPolyfillSupport;je?.(U,D),(J.litHtmlVersions??=[]).push("3.3.3");var xe=(n,e,t)=>{let s=t?.renderBefore??e,i=s._$litPart$;if(i===void 0){let r=t?.renderBefore??null;s._$litPart$=i=new D(e.insertBefore(M(),r),r,void 0,t??{})}return i._$AI(n),i};var ee=globalThis,f=class extends g{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=xe(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return v}};f._$litElement$=!0,f.finalized=!0,ee.litElementHydrateSupport?.({LitElement:f});var Be=ee.litElementPolyfillSupport;Be?.({LitElement:f});(ee.litElementVersions??=[]).push("4.2.2");var ve=["breakfast","lunch","dinner","snack"],T=class{constructor(e){this.hass=e}call(e,t={}){return this.hass.callWS({type:`essensplaner/${e}`,...t})}data(){return this.call("data")}compat(){return this.call("compat/all")}dishCheck(e){return this.call("dish/check",{dish_id:e})}saveDish(e){return this.call("dish/save",{dish:e})}deleteDish(e){return this.call("dish/delete",{dish_id:e})}saveProfile(e){return this.call("profile/save",{profile:e})}deleteProfile(e){return this.call("profile/delete",{profile_id:e})}parseIngredients(e){return this.call("parse_ingredients",{text:e})}plan(e,t){return this.call("plan/get",{start_date:e,days:t})}setMeal(e,t,s){return this.call("plan/set_meal",{date:e,meal_type:t,assignments:s})}generate(e){return this.call("plan/generate",e)}shoppingPreview(e,t){return this.call("shopping/preview",{start_date:e,days:t})}shoppingPush(e){return this.call("shopping/push",e)}imageFromUrl(e){return this.call("image/from_url",{url:e})}async uploadImage(e){let t=new FormData;t.append("file",e);let s=await this.hass.fetchWithAuth("/api/essensplaner/upload",{method:"POST",body:t}),i=await s.json();if(!s.ok)throw new Error(i.message||s.statusText);return{id:i.id,source:i.source}}subscribe(e){return this.hass.connection.subscribeMessage(e,{type:"essensplaner/subscribe"})}};function we(n){return n&&n.id?`/api/essensplaner/images/${n.id}`:null}function Ae(n){let e=n.getFullYear(),t=String(n.getMonth()+1).padStart(2,"0"),s=String(n.getDate()).padStart(2,"0");return`${e}-${t}-${s}`}function Se(n,e){let t=new Date(n);return t.setDate(t.getDate()+e),t}function ke(n){history.pushState(null,"",n),window.dispatchEvent(new CustomEvent("location-changed",{detail:{replace:!1}}))}var We={title:"Essensplaner","tab.plan":"Wochenplan","tab.dishes":"Gerichte","tab.profiles":"Personen","tab.shopping":"Einkauf","meal.breakfast":"Fr\xFChst\xFCck","meal.lunch":"Mittag","meal.dinner":"Abend","meal.snack":"Snack","plan.week":"KW {week}","plan.today":"Heute","plan.generate":"Woche planen","plan.empty":"Nichts geplant","plan.add_meal":"Mahlzeit","plan.shared":"Gemeinsam: {items}","plan.servings":"{n} Port.","gen.title":"Woche planen","gen.days":"Tage und Mahlzeiten","gen.profiles":"F\xFCr wen?","gen.overwrite":"Bereits geplante Mahlzeiten neu planen (manuell gesetzte bleiben)","gen.run":"Planen","gen.done":"Plan erstellt: {n} Gerichte eingeplant.","gen.no_dish":"{day} {meal}: kein passendes Gericht f\xFCr {profiles}","slot.title":"{day} \xB7 {meal}","slot.for":"F\xFCr","slot.add":"Gericht w\xE4hlen","slot.remove":"Entfernen","slot.search":"Gericht suchen \u2026","slot.show_all_meals":"Alle Mahlzeitentypen","slot.show_unsuitable":"Auch unpassende zeigen","slot.no_profiles":"W\xE4hle zuerst mindestens eine Person.","slot.nothing":"Noch kein Gericht f\xFCr diese Mahlzeit.","dishes.search":"Suchen \u2026","dishes.new":"Neues Gericht","dishes.all_meals":"Alle","dishes.fits":"Passt f\xFCr","dishes.anyone":"Egal","dishes.count":"{n} Gerichte","dishes.none":"Keine Gerichte gefunden.","dish.minutes":"{n} Min.","dish.servings":"Portionen","dish.ingredients":"Zutaten","dish.steps":"Zubereitung","dish.source":"Quelle","dish.compat":"Vertr\xE4glichkeit","dish.edit":"Bearbeiten","edit.new_title":"Neues Gericht","edit.title":"Gericht bearbeiten","edit.name":"Name","edit.meal_types":"Mahlzeiten","edit.suitable_for":"Nur f\xFCr (keine Auswahl = alle)","edit.base_servings":"Portionen im Rezept","edit.duration":"Dauer (Minuten)","edit.tags":"Tags (durch Komma getrennt)","edit.ingredients":"Zutaten (eine pro Zeile)","edit.ingredients_help":"z. B. \u201E250 g H\xFChnerbrust #protein\u201C, \u201E150 g Reis #beilage\u201C, \u201E2 Karotten\u201C, \u201ESalz\u201C","edit.steps":"Zubereitung (ein Schritt pro Zeile)","edit.source_url":"Quelle (URL)","edit.image":"Bild","edit.upload":"Foto hochladen","edit.image_url":"Bild-URL","edit.image_from_url":"\xDCbernehmen","edit.image_remove":"Bild entfernen","edit.uploading":"Wird hochgeladen \u2026","profile.new":"Neue Person","profile.title":"Person bearbeiten","profile.name":"Name","profile.servings":"Portionen","profile.unknown":"Zutaten, die in keiner Liste stehen","profile.unknown.allow":"Erlauben","profile.unknown.warn":"Erlauben, aber warnen","profile.unknown.exclude":"Ausschlie\xDFen (nur Vertr\xE4gliches)","profile.max_duration":"Maximale Zubereitungszeit (Minuten, leer = egal)","profile.tolerated":"Vertr\xE4glich","profile.not_tolerated":"Nicht vertr\xE4glich","profile.small_amounts":"Nur in kleinen Mengen","profile.small_help":"Eine Zutat pro Zeile, optional mit H\xF6chstmenge pro Portion, z. B. \u201E10 g Butter\u201C","profile.likes":"Vorlieben","profile.dislikes":"Abneigungen","profile.list_help":"Ein Eintrag pro Zeile","profile.summary":"{tol} vertr\xE4glich \xB7 {not} nicht vertr\xE4glich \xB7 {small} kleine Mengen","profile.fitting":"{n} passende Gerichte","shop.start":"Ab","shop.days":"Tage","shop.target":"To-do-Liste","shop.skip_existing":"Was schon offen auf der Liste steht, \xFCberspringen","shop.push":"In Liste \xFCbertragen","shop.empty":"Im gew\xE4hlten Zeitraum ist nichts geplant.","shop.result":"{added} hinzugef\xFCgt, {skipped} \xFCbersprungen.","shop.no_target":"Bitte eine To-do-Liste w\xE4hlen.","shop.select_all":"Alle","shop.select_none":"Keine","common.save":"Speichern","common.cancel":"Abbrechen","common.close":"Schlie\xDFen","common.delete":"L\xF6schen","common.confirm_delete":"Wirklich l\xF6schen?","common.add":"Hinzuf\xFCgen","common.loading":"L\xE4dt \u2026","common.error":"Fehler: {msg}","status.ok":"passt","status.warn":"mit Hinweis","status.excluded":"passt nicht","reason.not_suitable":"nicht f\xFCr diese Person vorgesehen","reason.too_long":"dauert zu lange ({duration} Min.)","reason.dislike":"Abneigung: {term}","reason.not_tolerated":"{ingredient} nicht vertr\xE4glich","reason.small_amount":"{ingredient} nur in kleinen Mengen","reason.small_amount_unchecked":"{ingredient}: Menge nicht pr\xFCfbar","reason.small_amount_exceeded":"{ingredient}: {amount} {unit} pro Portion (max. {max})","reason.unknown_ingredient":"{ingredient} steht in keiner Liste","reason.no_ingredients":"keine Zutaten hinterlegt","card.title":"Was gibt's heute?","card.title_label":"Titel","card.tomorrow":"Was gibt's morgen?","card.nothing":"Heute ist nichts geplant.","card.not_loaded":"Essensplaner ist nicht eingerichtet."},te={title:"Meal planner","tab.plan":"Week","tab.dishes":"Dishes","tab.profiles":"People","tab.shopping":"Shopping","meal.breakfast":"Breakfast","meal.lunch":"Lunch","meal.dinner":"Dinner","meal.snack":"Snack","plan.week":"Week {week}","plan.today":"Today","plan.generate":"Plan week","plan.empty":"Nothing planned","plan.add_meal":"Meal","plan.shared":"Shared: {items}","plan.servings":"{n} serv.","gen.title":"Plan week","gen.days":"Days and meals","gen.profiles":"For whom?","gen.overwrite":"Re-plan meals that are already planned (manual ones are kept)","gen.run":"Plan","gen.done":"Plan created: {n} dishes planned.","gen.no_dish":"{day} {meal}: no suitable dish for {profiles}","slot.title":"{day} \xB7 {meal}","slot.for":"For","slot.add":"Choose dish","slot.remove":"Remove","slot.search":"Search dish \u2026","slot.show_all_meals":"All meal types","slot.show_unsuitable":"Show unsuitable too","slot.no_profiles":"Select at least one person first.","slot.nothing":"No dish for this meal yet.","dishes.search":"Search \u2026","dishes.new":"New dish","dishes.all_meals":"All","dishes.fits":"Suits","dishes.anyone":"Anyone","dishes.count":"{n} dishes","dishes.none":"No dishes found.","dish.minutes":"{n} min","dish.servings":"Servings","dish.ingredients":"Ingredients","dish.steps":"Preparation","dish.source":"Source","dish.compat":"Suitability","dish.edit":"Edit","edit.new_title":"New dish","edit.title":"Edit dish","edit.name":"Name","edit.meal_types":"Meals","edit.suitable_for":"Only for (none selected = everyone)","edit.base_servings":"Servings in recipe","edit.duration":"Duration (minutes)","edit.tags":"Tags (comma separated)","edit.ingredients":"Ingredients (one per line)","edit.ingredients_help":'e.g. "250 g chicken breast #protein", "150 g rice #side", "2 carrots", "salt"',"edit.steps":"Preparation (one step per line)","edit.source_url":"Source (URL)","edit.image":"Image","edit.upload":"Upload photo","edit.image_url":"Image URL","edit.image_from_url":"Use","edit.image_remove":"Remove image","edit.uploading":"Uploading \u2026","profile.new":"New person","profile.title":"Edit person","profile.name":"Name","profile.servings":"Servings","profile.unknown":"Ingredients not in any list","profile.unknown.allow":"Allow","profile.unknown.warn":"Allow with warning","profile.unknown.exclude":"Exclude (tolerated only)","profile.max_duration":"Maximum preparation time (minutes, empty = any)","profile.tolerated":"Tolerated","profile.not_tolerated":"Not tolerated","profile.small_amounts":"Only in small amounts","profile.small_help":'One ingredient per line, optionally with a maximum per serving, e.g. "10 g butter"',"profile.likes":"Likes","profile.dislikes":"Dislikes","profile.list_help":"One entry per line","profile.summary":"{tol} tolerated \xB7 {not} not tolerated \xB7 {small} small amounts","profile.fitting":"{n} suitable dishes","shop.start":"From","shop.days":"Days","shop.target":"To-do list","shop.skip_existing":"Skip items already open on the list","shop.push":"Send to list","shop.empty":"Nothing planned in this period.","shop.result":"{added} added, {skipped} skipped.","shop.no_target":"Please choose a to-do list.","shop.select_all":"All","shop.select_none":"None","common.save":"Save","common.cancel":"Cancel","common.close":"Close","common.delete":"Delete","common.confirm_delete":"Really delete?","common.add":"Add","common.loading":"Loading \u2026","common.error":"Error: {msg}","status.ok":"suitable","status.warn":"with note","status.excluded":"not suitable","reason.not_suitable":"not intended for this person","reason.too_long":"takes too long ({duration} min)","reason.dislike":"dislike: {term}","reason.not_tolerated":"{ingredient} not tolerated","reason.small_amount":"{ingredient} only in small amounts","reason.small_amount_unchecked":"{ingredient}: amount cannot be checked","reason.small_amount_exceeded":"{ingredient}: {amount} {unit} per serving (max {max})","reason.unknown_ingredient":"{ingredient} is not in any list","reason.no_ingredients":"no ingredients","card.title":"What's for today?","card.title_label":"Title","card.tomorrow":"What's for tomorrow?","card.nothing":"Nothing planned for today.","card.not_loaded":"Meal planner is not set up."},Ie={de:We,en:te};function se(n,e,t={}){let s=n&&n.language&&n.language.split("-")[0]||"en",r=(Ie[s]||te)[e]??te[e]??e;for(let[o,l]of Object.entries(t))r=r.replaceAll(`{${o}}`,String(l));return r}var ie=w`
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
`;var z=class extends f{constructor(){super(),this._config={},this._data=null,this._day=null,this._error=null,this._unsub=null,this._api=null,this._loadedDate=null}static getStubConfig(){return{show_images:!0}}static getConfigElement(){return document.createElement("essensplaner-today-card-editor")}setConfig(e){this._config={show_images:!0,day_offset:0,...e},this._loadedDate=null}getCardSize(){return 3}t(e,t){return se(this.hass,e,t)}get _date(){return Ae(Se(new Date,Number(this._config.day_offset)||0))}connectedCallback(){super.connectedCallback(),this.hass&&this._start()}disconnectedCallback(){super.disconnectedCallback(),this._unsub&&(this._unsub.then(e=>e()).catch(()=>{}),this._unsub=null)}updated(e){e.has("hass")&&this.hass&&(this._unsub?this._api.hass=this.hass:this._start(),this._loadedDate&&this._loadedDate!==this._date&&this._load())}_start(){this._api=new T(this.hass),this._load(),this._unsub=this._api.subscribe(()=>this._load()),this._unsub.catch(e=>this._error=e.message||String(e))}async _load(){let e=this._date;this._loadedDate=e;try{let[t,s]=await Promise.all([this._api.data(),this._api.plan(e,1)]);this._data=t,this._day=s[e]||{},this._error=null}catch(t){this._error=t.code==="unknown_command"||t.code==="not_loaded"?this.t("card.not_loaded"):t.message}}_open(e){ke(`/essensplaner?dish=${encodeURIComponent(e)}`)}_profileName(e){let t=this._data&&this._data.profiles.find(s=>s.id===e);return t?t.name:"?"}render(){let e=Number(this._config.day_offset)||0,t=this._config.title||this.t(e===1?"card.tomorrow":"card.title"),s=this._config.profiles;return u`
      <ha-card>
        <div class="header">${t}</div>
        <div class="content">
          ${this._error?u`<p class="muted">${this._error}</p>`:this._day?this._renderDay(s):u`<p class="muted">${this.t("common.loading")}</p>`}
        </div>
      </ha-card>
    `}_renderDay(e){let s=ve.filter(r=>this._day[r]).map(r=>({meal:r,assignments:this._day[r].assignments.filter(o=>!e||!e.length||o.profiles.some(l=>e.includes(l)))})).filter(r=>r.assignments.length);if(!s.length)return u`<p class="muted">${this.t("card.nothing")}</p>`;let i=Object.fromEntries((this._data.dishes||[]).map(r=>[r.id,r]));return s.map(r=>u`
        <div class="meal">
          <div class="meal-name">${this.t(`meal.${r.meal}`)}</div>
          ${r.assignments.map(o=>{let l=this._config.show_images?we(i[o.dish_id]&&i[o.dish_id].image):null;return u`<button class="dish" @click=${()=>this._open(o.dish_id)}>
              ${this._config.show_images?l?u`<img class="thumb" src=${l} alt="" loading="lazy" />`:u`<span class="thumb"><ha-icon icon="mdi:silverware-fork-knife"></ha-icon></span>`:""}
              <span class="text">
                <span class="name">${o.dish_name}</span>
                <span class="who">${o.profiles.map(a=>this._profileName(a)).join(", ")}</span>
              </span>
            </button>`})}
        </div>
      `)}};k(z,"properties",{hass:{attribute:!1},_config:{state:!0},_data:{state:!0},_day:{state:!0},_error:{state:!0}}),k(z,"styles",[ie,w`
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
    `]);var O=class extends f{constructor(){super(),this._config={},this._profiles=[]}setConfig(e){this._config=e}updated(e){e.has("hass")&&this.hass&&!this._loaded&&(this._loaded=!0,new T(this.hass).data().then(t=>this._profiles=t.profiles).catch(()=>{}))}_change(e,t){let s={...this._config,[e]:t};(t===""||t===void 0||Array.isArray(t)&&!t.length)&&delete s[e],this._config=s,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:s},bubbles:!0,composed:!0}))}_toggleProfile(e){let t=this._config.profiles||[];this._change("profiles",t.includes(e)?t.filter(s=>s!==e):[...t,e])}render(){let e=s=>se(this.hass,s),t=this._config.profiles||[];return u`
      <label class="field">
        <span>${e("card.title_label")}</span>
        <input type="text" .value=${this._config.title||""} @input=${s=>this._change("title",s.target.value)} />
      </label>
      <label class="row field">
        <input type="checkbox" .checked=${this._config.show_images!==!1}
          @change=${s=>this._change("show_images",s.target.checked)} />
        <span>${e("edit.image")}</span>
      </label>
      <label class="row field">
        <input type="checkbox" .checked=${Number(this._config.day_offset)===1}
          @change=${s=>this._change("day_offset",s.target.checked?1:0)} />
        <span>${e("card.tomorrow")}</span>
      </label>
      <div class="field">
        <span class="muted">${e("tab.profiles")}</span>
        <div class="chips">
          ${this._profiles.map(s=>u`<button class="chip ${t.includes(s.id)?"on":""}" @click=${()=>this._toggleProfile(s.id)}>
              ${s.name}
            </button>`)}
        </div>
      </div>
    `}};k(O,"properties",{hass:{attribute:!1},_config:{state:!0},_profiles:{state:!0}}),k(O,"styles",[ie]);customElements.get("essensplaner-today-card")||(customElements.define("essensplaner-today-card",z),customElements.define("essensplaner-today-card-editor",O),window.customCards=window.customCards||[],window.customCards.push({type:"essensplaner-today-card",name:"Essensplaner \u2013 Heute",description:"Zeigt, was es heute gibt.",preview:!0}));
