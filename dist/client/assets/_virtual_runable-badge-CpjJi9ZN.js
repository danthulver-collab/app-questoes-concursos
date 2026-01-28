import{r as o,j as e,c as y}from"./index-CnA7Tapg.js";const n="website-editor-root",b="website-editor__badge";function v(){const[r,t]=o.useState(!0),[a,l]=o.useState(!1),[i,s]=o.useState(!1),u=o.useCallback(()=>l(!0),[]),p=o.useCallback(()=>l(!1),[]),k=o.useCallback(()=>s(!0),[]),f=o.useCallback(()=>s(!1),[]),g=o.useCallback(d=>{d.preventDefault()},[]),m=o.useCallback(d=>{d.preventDefault(),d.stopPropagation(),t(!1),window.dispatchEvent(new CustomEvent("website-editor:close"))},[]);return e.jsxs("a",{id:b,href:"https://runable.com",target:"_blank",rel:"noopener noreferrer","aria-label":"Made with Runable",onClick:g,onMouseEnter:u,onMouseLeave:p,style:{position:"fixed",right:"16px",bottom:"16px",display:"inline-flex",alignItems:"center",gap:"10px",paddingLeft:"12px",paddingRight:"8px",paddingTop:"8px",paddingBottom:"8px",borderRadius:"9999px",backgroundColor:"var(--editor-surface-elevated)",textDecoration:"none",cursor:"pointer",zIndex:2147483646,transition:"all 250ms ease-out",transform:r?"translateY(0)":"translateY(calc(100% + 24px))",opacity:r?1:0,pointerEvents:r?"auto":"none",boxShadow:a?"var(--editor-shadow-md)":"var(--editor-shadow-sm)"},children:[e.jsxs("svg",{width:"18",height:"16",viewBox:"0 0 737 665",fill:"none",xmlns:"http://www.w3.org/2000/svg",style:{flexShrink:0,transition:"transform 250ms ease-out",transform:a?"scale(1.05)":"scale(1)",color:"var(--editor-text-strong)"},children:[e.jsx("path",{d:"M499.606 664.888C558.427 664.888 606.111 617.204 606.111 558.383C606.111 499.562 558.427 451.878 499.606 451.878C460.545 451.879 426.395 472.907 407.859 504.26L405.405 507.185C385.812 530.537 349.863 530.472 330.355 507.048L327.193 503.253C308.526 472.458 274.692 451.879 236.051 451.878C177.23 451.878 129.546 499.562 129.546 558.383C129.546 617.204 177.23 664.888 236.051 664.888C274.174 664.888 307.619 644.857 326.435 614.746L330.694 609.744C350.176 586.858 385.497 586.794 405.062 609.608L408.589 613.72C427.282 644.401 461.051 664.888 499.606 664.888Z",fill:"currentColor"}),e.jsx("path",{d:"M331.503 160.669C360.913 109.728 343.46 44.5909 292.519 15.1805C241.579 -14.2299 176.441 3.2236 147.031 54.164C127.499 87.9948 128.637 128.088 146.526 159.818L147.83 163.398C158.257 192.042 140.225 223.142 110.185 228.324L105.306 229.167C69.3056 229.939 34.5711 248.95 15.2522 282.412C-14.1582 333.352 3.29541 398.489 54.2357 427.9C105.176 457.31 170.314 439.857 199.724 388.916C218.782 355.907 218.161 316.936 201.502 285.588L199.292 279.378C189.213 251.064 206.818 220.443 236.358 214.906L241.682 213.909C277.599 213.06 312.226 194.058 331.503 160.669Z",fill:"currentColor"}),e.jsx("path",{d:"M537.284 388.915C566.695 439.855 631.832 457.309 682.773 427.898C733.713 398.488 751.166 333.35 721.756 282.41C702.224 248.58 666.935 229.52 630.512 229.146L626.759 228.484C596.739 223.193 578.821 192.027 589.353 163.421L591.065 158.769C608.394 127.207 609.296 87.6227 589.978 54.1632C560.567 3.22282 495.43 -14.2307 444.489 15.1797C393.549 44.5902 376.095 109.728 405.506 160.668C424.565 193.679 458.628 212.627 494.107 213.872L500.586 215.062C530.146 220.491 547.862 251.047 537.887 279.398L536.092 284.498C518.864 316.029 518.005 355.522 537.284 388.915Z",fill:"currentColor"})]}),e.jsxs("div",{style:{position:"relative",height:"20px",overflow:"hidden"},children:[e.jsx("span",{style:{display:"block",fontSize:"14px",fontWeight:500,fontFamily:"system-ui, sans-serif",whiteSpace:"nowrap",color:"var(--editor-text-strong)",transition:"transform 250ms ease-out, opacity 200ms ease-out",transform:a?"translateY(-100%)":"translateY(0)",opacity:a?0:1},children:"Made with Runable"}),e.jsx("span",{style:{display:"block",fontSize:"14px",fontWeight:500,fontFamily:"system-ui, sans-serif",whiteSpace:"nowrap",color:"var(--editor-text-strong)",transition:"transform 250ms ease-out, opacity 200ms ease-out",transform:a?"translateY(-100%)":"translateY(0)",opacity:a?1:0},children:"Design with Runable"})]}),e.jsx("button",{type:"button","aria-label":"Close",style:{width:"20px",height:"20px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"14px",lineHeight:1,cursor:"pointer",transition:"all 200ms ease-out",border:"none",borderRadius:"9999px",backgroundColor:i?"var(--editor-surface-strong)":"transparent",color:i?"var(--editor-text-strong)":"var(--editor-text-muted)",transform:i?"scale(1.1)":"scale(1)"},onClick:m,onMouseEnter:k,onMouseLeave:f,children:"×"})]})}const h="runable-editor-theme",x=`
#${n} {
  color-scheme: dark;

  --radius: 0.5px;
  --ring: oklch(0.8489 0.146 208.1);

  --background-100: oklch(0 0 0);
  --background-200: oklch(0.1496 0 89.9);
  --background-300: oklch(0.1374 0.0205 201.2);
  --background-400: oklch(0.2346 0.0076 211.1);
  --overlay: oklch(1 0 89.9 / 0.039);
  --secondary-surface: #ffffff0d;

  --card: var(--background-300);
  --card-foreground: var(--foreground);
  --popover: var(--secondary-800);
  --popover-foreground: var(--foreground);
  --dropdown: var(--background-400);
  --dropdown-accent: var(--background-300);

  --border: oklch(1 0 0 / 0.05);
  --input: oklch(1 0 89.9 / 0.102);

  --foreground: oklch(1 0 89.9 / 0.8);
  --muted-foreground: oklch(1 0 89.9 / 0.4);
  --primary-foreground: oklch(0 0 0);

  --success: #d1fe17;
  --warning: oklch(0.8264 0.1362 69.2);
  --warning-dark: oklch(0.55 0.15 65);
  --purple: oklch(0.7414 0.1198 300.9);
  --teal: oklch(0.8494 0.114 181.9);
  --destructive: oklch(60.155% 0.22304 27.215);
  --lemon: oklch(0.9 0.1 90);

  --accent: var(--overlay);
  --accent-foreground: var(--foreground);
  --tertiary: var(--purple);
  --tertiary-foreground: var(--foreground);

  --primary: oklch(0.8489 0.146 208.1);
  --primary-100: oklch(0.95 0.146 208.1);
  --primary-200: oklch(0.9 0.146 208.1);
  --primary-300: oklch(0.85 0.146 208.1);
  --primary-400: oklch(0.8 0.146 208.1);
  --primary-500: oklch(0.8489 0.146 208.1);
  --primary-600: oklch(0.7 0.146 208.1);
  --primary-700: oklch(0.6 0.146 208.1);
  --primary-800: oklch(0.5 0.146 208.1);
  --primary-900: oklch(0.42 0.146 208.1);

  --secondary-foreground: oklch(1 0 89.9);
  --secondary-100: oklch(0.9 0 89.9);
  --secondary-200: oklch(0.7 0 89.9);
  --secondary-300: oklch(0.4 0 89.9);
  --secondary-400: oklch(0.3 0 89.9);
  --secondary-500: oklch(0.2346 0.0076 211.1);
  --secondary-600: oklch(0.1496 0 89.9);
  --secondary-700: #1a1f20;
  --secondary-800: #0b0b0b;
  --secondary-900: #000000;

  --sidebar: oklch(0.1496 0 89.9);
  --sidebar-foreground: oklch(1 0 89.9 / 0.8);
  --sidebar-primary: oklch(0.8489 0.146 208.1);
  --sidebar-primary-foreground: oklch(1 0 89.9);
  --sidebar-accent: oklch(1 0 89.9 / 0.039);
  --sidebar-accent-foreground: oklch(1 0 89.9 / 0.8);
  --sidebar-border: oklch(1 0 89.9 / 0.2);
  --sidebar-ring: oklch(0.8489 0.146 208.1);

  --editor-text-strong: var(--secondary-foreground);
  --editor-text: var(--foreground);
  --editor-text-muted: var(--muted-foreground);
  --editor-surface: var(--background-200);
  --editor-surface-raised: var(--background-300);
  --editor-surface-elevated: var(--background-400);
  --editor-surface-subtle: var(--secondary-surface);
  --editor-surface-strong: var(--input);
  --editor-border: var(--border);
  --editor-border-strong: var(--input);
  --editor-primary: var(--primary);
  --editor-primary-foreground: var(--primary-foreground);
  --editor-destructive: var(--destructive);
  --editor-destructive-alpha-15: oklch(60.155% 0.22304 27.215 / 0.15);
  --editor-primary-alpha-04: oklch(0.8489 0.146 208.1 / 0.04);
  --editor-primary-alpha-06: oklch(0.8489 0.146 208.1 / 0.06);
  --editor-primary-alpha-10: oklch(0.8489 0.146 208.1 / 0.1);
  --editor-primary-alpha-12: oklch(0.8489 0.146 208.1 / 0.12);
  --editor-primary-alpha-15: oklch(0.8489 0.146 208.1 / 0.15);
  --editor-primary-alpha-30: oklch(0.8489 0.146 208.1 / 0.3);
  --editor-primary-alpha-40: oklch(0.8489 0.146 208.1 / 0.4);
  --editor-primary-alpha-50: oklch(0.8489 0.146 208.1 / 0.5);
  --editor-scrollbar-thumb: oklch(1 0 89.9 / 0.2);
  --editor-scrollbar-thumb-hover: oklch(1 0 89.9 / 0.3);
  --editor-surface-highlight: oklch(1 0 89.9 / 0.03);
  --editor-shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.2);
  --editor-shadow-md: 0 4px 16px rgba(0, 0, 0, 0.4);
  --editor-shadow-lg: 0 4px 32px rgba(0, 0, 0, 0.5);
  --editor-shadow-xl: 0 14px 30px rgba(0, 0, 0, 0.5);
}

#${n}[data-theme="light"] {
  color-scheme: light;

  --background-100: #ffffff;
  --background-200: #fafafa;
  --background-300: #fafafa;
  --background-400: #eaeaea;
  --overlay: #00000008;
  --secondary-surface: #0000000d;

  --card: var(--background-300);
  --card-foreground: var(--foreground);
  --popover: var(--secondary-800);
  --popover-foreground: var(--foreground);
  --dropdown: oklch(0.99 0.001 208.1);
  --dropdown-accent: var(--background-200);

  --border: oklch(0 0 0 / 0.05);
  --input: oklch(0 0 0 / 0.12);

  --foreground: oklch(0.12 0 0);
  --muted-foreground: #858a8e;
  --primary-foreground: oklch(0.99 0 0);

  --success: #4a9d00;
  --warning: #cb7614;
  --warning-dark: #a35a0a;
  --purple: oklch(0.5 0.17 295);
  --teal: oklch(0.52 0.15 180);
  --destructive: oklch(0.48 0.23 25);
  --lemon: oklch(0.68 0.15 85);

  --accent: var(--overlay);
  --accent-foreground: var(--foreground);
  --tertiary: var(--purple);
  --tertiary-foreground: var(--foreground);

  --ring: oklch(0.48 0.17 208.1);
  --primary: #00b7ca;
  --primary-100: oklch(0.88 0.1 208.1);
  --primary-200: oklch(0.8 0.13 208.1);
  --primary-300: oklch(0.68 0.15 208.1);
  --primary-400: oklch(0.58 0.16 208.1);
  --primary-500: oklch(0.48 0.17 208.1);
  --primary-600: oklch(0.4 0.16 208.1);
  --primary-700: oklch(0.33 0.14 208.1);
  --primary-800: oklch(0.25 0.12 208.1);
  --primary-900: oklch(0.2 0.1 208.1);

  --secondary-foreground: oklch(0.1 0 0);
  --secondary: #eaeaea;
  --secondary-100: oklch(0.15 0 0);
  --secondary-200: oklch(0.28 0 0);
  --secondary-300: oklch(0.48 0 0);
  --secondary-400: oklch(0.58 0 0);
  --secondary-500: oklch(0.85 0.007 208.1);
  --secondary-600: oklch(0.89 0.006 208.1);
  --secondary-700: #eaeaea;
  --secondary-800: #fafafa;
  --secondary-900: #ffffff;

  --sidebar: var(--background-200);
  --sidebar-foreground: oklch(0.18 0 0);
  --sidebar-primary: oklch(0.48 0.17 208.1);
  --sidebar-primary-foreground: oklch(0.99 0 0);
  --sidebar-accent: var(--overlay);
  --sidebar-accent-foreground: oklch(0.18 0 0);
  --sidebar-border: oklch(0.25 0 0 / 0.2);
  --sidebar-ring: oklch(0.48 0.17 208.1);

  --editor-text-strong: var(--secondary-foreground);
  --editor-text: var(--foreground);
  --editor-text-muted: var(--muted-foreground);
  --editor-surface: var(--background-200);
  --editor-surface-raised: var(--background-300);
  --editor-surface-elevated: var(--background-400);
  --editor-surface-subtle: var(--secondary-surface);
  --editor-surface-strong: var(--input);
  --editor-border: var(--border);
  --editor-border-strong: var(--input);
  --editor-primary: var(--primary);
  --editor-primary-foreground: var(--primary-foreground);
  --editor-destructive: var(--destructive);
  --editor-destructive-alpha-15: oklch(0.48 0.23 25 / 0.15);
  --editor-primary-alpha-04: oklch(0.48 0.17 208.1 / 0.04);
  --editor-primary-alpha-06: oklch(0.48 0.17 208.1 / 0.06);
  --editor-primary-alpha-10: oklch(0.48 0.17 208.1 / 0.1);
  --editor-primary-alpha-12: oklch(0.48 0.17 208.1 / 0.12);
  --editor-primary-alpha-15: oklch(0.48 0.17 208.1 / 0.15);
  --editor-primary-alpha-30: oklch(0.48 0.17 208.1 / 0.3);
  --editor-primary-alpha-40: oklch(0.48 0.17 208.1 / 0.4);
  --editor-primary-alpha-50: oklch(0.48 0.17 208.1 / 0.5);
  --editor-scrollbar-thumb: oklch(0 0 0 / 0.2);
  --editor-scrollbar-thumb-hover: oklch(0 0 0 / 0.3);
  --editor-surface-highlight: oklch(0 0 0 / 0.03);
  --editor-shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.12);
  --editor-shadow-md: 0 4px 16px rgba(0, 0, 0, 0.15);
  --editor-shadow-lg: 0 4px 24px rgba(0, 0, 0, 0.18);
  --editor-shadow-xl: 0 14px 30px rgba(0, 0, 0, 0.2);
}
`,C=r=>r==="light"?"light":"dark",w=()=>typeof window>"u"?"dark":C(window.__RUNABLE_CONFIG__?.theme),E=()=>{if(typeof document>"u"||document.getElementById(h))return;const r=document.createElement("style");r.id=h,r.textContent=x,document.head.appendChild(r)},L=r=>{if(typeof document>"u")return;const t=document.getElementById(n);t&&(t.dataset.theme=r)},c=document.createElement("div");c.id=n;document.body.appendChild(c);E();L(w());y.createRoot(c).render(e.jsx(v,{}));
