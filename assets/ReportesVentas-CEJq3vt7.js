import{r as d,s as v,j as e,S as se,b as re,E as G,o as ne,X as le,p as de}from"./index-DyRGlXyn.js";import{n as m,F as ce,L as I}from"./index-Bk6qzOxF.js";import{F as M}from"./file-chart-column-increasing-CW4iBOj0.js";import{F as pe}from"./file-down-B7taR7BA.js";import{D as N}from"./dollar-sign-BJpoOmkd.js";import{T as xe}from"./trending-up-CNeeSLoG.js";import{a as he,A as ge}from"./arrow-up-D_Oo1aW9.js";function Te(){const[$,X]=d.useState([]),[fe,U]=d.useState([]),[ue,be]=d.useState([]),[z,R]=d.useState(!0),[Y,D]=d.useState(!1),[b,K]=d.useState(null),[A,V]=d.useState([]),[E,_]=d.useState(!1),[y,J]=d.useState(!1),[L,q]=d.useState([]),[Q,Z]=d.useState([]),[c,T]=d.useState(""),[O,k]=d.useState(""),[P,w]=d.useState(!1),[i,C]=d.useState({periodo:"mes",fechaInicio:(()=>{const o=new Date;return o.setDate(1),o.toISOString().split("T")[0]})(),fechaFin:new Date().toISOString().split("T")[0]}),[j,ee]=d.useState({totalVentas:0,cantidadTickets:0,promedioTicket:0,totalDevoluciones:0,ventasNetas:0});d.useEffect(()=>{B()},[]),d.useEffect(()=>{i.fechaInicio&&i.fechaFin&&B()},[i.fechaInicio,i.fechaFin,c]);const B=async()=>{R(!0);try{const o=await v.rpc("fn_listar_usuarios");if(!o.error){const x=(o.data||[]).filter(u=>u.estado==="ACTIVO"&&u.rol_nombre?.toUpperCase()==="CAJERO");Z(x)}const a=await v.rpc("fn_leer_ventas_cajero",{p_fecha_inicio:i.fechaInicio,p_fecha_fin:i.fechaFin,p_id_usuario:c||null}),s=await v.rpc("fn_leer_devoluciones_ventas",{p_fecha_inicio:i.fechaInicio,p_fecha_fin:i.fechaFin,p_id_usuario:c||null}),n=s.error?[]:s.data||[];q(n),a.error?(console.error("Error cargando ventas:",a.error),m.error("Error al cargar ventas")):(X(a.data||[]),W(a.data||[],n));const l=await v.rpc("fn_reporte_ventas_periodo",{p_fecha_inicio:i.fechaInicio,p_fecha_fin:i.fechaFin});l.error||U(l.data||[])}catch(o){console.error("Error:",o),m.error("Error al cargar datos")}finally{R(!1)}},W=(o,a=[])=>{const s=o.reduce((x,u)=>x+parseFloat(u.total||0),0),n=o.length,l=a.reduce((x,u)=>x+parseFloat(u.total_devuelto||u.total_venta||0),0);ee({totalVentas:s,cantidadTickets:n,promedioTicket:n>0?s/n:0,totalDevoluciones:l,ventasNetas:s-l})},te=o=>{const a=new Date;let s,n;switch(o){case"hoy":s=n=a.toISOString().split("T")[0];break;case"semana":const l=new Date(a);l.setDate(a.getDate()-a.getDay()),s=l.toISOString().split("T")[0],n=a.toISOString().split("T")[0];break;case"mes":s=new Date(a.getFullYear(),a.getMonth(),1).toISOString().split("T")[0],n=a.toISOString().split("T")[0];break;default:return}C({...i,periodo:o,fechaInicio:s,fechaFin:n})},g=$.filter(o=>{if(c&&o.cajero_id!==c&&o.id_usuario!==c)return!0;const a=new Date(o.fecha);if(i.periodo!=="todos"&&i.periodo!=="personalizado"){const s=new Date;let n,l;if(i.periodo==="hoy")n=new Date(s.setHours(0,0,0,0)),l=new Date(s.setHours(23,59,59,999));else if(i.periodo==="semana"){const x=new Date(s);x.setDate(s.getDate()-s.getDay()),x.setHours(0,0,0,0),n=x,l=new Date}else i.periodo==="mes"&&(n=new Date(s.getFullYear(),s.getMonth(),1),l=new Date);if(n&&l&&(a<n||a>l))return!1}return!((i.periodo==="personalizado"||i.fechaInicio||i.fechaFin)&&(i.fechaInicio&&a<new Date(i.fechaInicio+"T00:00:00")||i.fechaFin&&a>new Date(i.fechaFin+"T23:59:59")))}).sort((o,a)=>{const s=new Date(o.fecha),n=new Date(a.fecha);return y?s-n:n-s}),f=L.filter(o=>{if(c&&o.id_usuario!==c)return!0;const a=new Date(o.fecha);return!(i.fechaInicio&&a<new Date(i.fechaInicio+"T00:00:00")||i.fechaFin&&a>new Date(i.fechaFin+"T23:59:59"))});d.useEffect(()=>{W(g,f)},[$,L,i,c]);const oe=()=>{const o=new Date,a=new Date(o.getFullYear(),o.getMonth(),1);C({periodo:"mes",fechaInicio:a.toISOString().split("T")[0],fechaFin:o.toISOString().split("T")[0]}),T(""),k("")},H=()=>{const o={day:"2-digit",month:"long",year:"numeric"},a=new Date(i.fechaInicio+"T00:00:00").toLocaleDateString("es-BO",o),s=new Date(i.fechaFin+"T00:00:00").toLocaleDateString("es-BO",o);return i.fechaInicio===i.fechaFin?a:`${a} - ${s}`},ae=async o=>{K(o),D(!0),V([]);try{const{data:a,error:s}=await v.rpc("fn_obtener_detalle_venta",{p_id_venta:o.id});!s&&a&&V(a)}catch{console.log("Detalle no disponible")}},ie=async()=>{_(!0);try{const o=H(),a=g.reduce((r,h)=>r+parseFloat(h.total||0),0),s=f.reduce((r,h)=>r+parseFloat(h.total_devuelto||h.total_venta||0),0),n=a-s;m.loading("Cargando detalles de productos...");const l=[],x=g.slice(0,50);for(const r of x)try{const{data:h}=await v.rpc("fn_obtener_detalle_venta",{p_id_venta:r.id});l.push({...r,productos:h||[]})}catch{l.push({...r,productos:[]})}m.dismiss();const u=`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Reporte de Ventas - Don Baraton</title>
          <style>
            @page { size: A4 portrait; margin: 15mm; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Tahoma, Arial, sans-serif; 
              background: #fff; 
              color: #333; 
              font-size: 11px;
              line-height: 1.4;
            }
            .container { max-width: 800px; margin: 0 auto; padding: 20px; }
            
            /* Header Premium */
            .header { 
              display: flex; 
              align-items: center; 
              justify-content: space-between;
              margin-bottom: 25px; 
              padding-bottom: 20px; 
              border-bottom: 3px solid #1a5d1a;
            }
            .header-left { display: flex; align-items: center; gap: 15px; }
            .logo { width: 70px; height: 70px; border-radius: 10px; object-fit: cover; }
            .empresa h1 { color: #1a5d1a; font-size: 24px; margin-bottom: 3px; }
            .empresa p { color: #666; font-size: 11px; }
            .header-right { text-align: right; }
            .header-right p { font-size: 10px; color: #666; margin-bottom: 2px; }
            
            /* Título */
            .titulo-reporte { 
              background: linear-gradient(135deg, #1a5d1a 0%, #2e8b57 100%); 
              color: white; 
              padding: 18px 25px; 
              border-radius: 12px; 
              margin-bottom: 25px;
              box-shadow: 0 4px 15px rgba(26, 93, 26, 0.3);
            }
            .titulo-reporte h2 { font-size: 18px; margin-bottom: 5px; font-weight: 700; }
            .titulo-reporte p { font-size: 11px; opacity: 0.9; }
            
            /* Stats Grid */
            .stats { 
              display: grid; 
              grid-template-columns: repeat(4, 1fr); 
              gap: 12px; 
              margin-bottom: 25px; 
            }
            .stat { 
              background: linear-gradient(145deg, #f8f9fa, #ffffff);
              padding: 18px; 
              border-radius: 12px; 
              text-align: center; 
              border-left: 4px solid #1a5d1a;
              box-shadow: 0 2px 8px rgba(0,0,0,0.04);
            }
            .stat-value { font-size: 22px; font-weight: 700; color: #1a5d1a; }
            .stat-label { font-size: 10px; color: #666; margin-top: 5px; text-transform: uppercase; letter-spacing: 0.5px; }
            
            /* Secciones */
            .seccion {
              background: #fff;
              border-radius: 12px;
              padding: 20px;
              margin-bottom: 15px;
              border: 1px solid #e9ecef;
              box-shadow: 0 2px 8px rgba(0,0,0,0.04);
              page-break-inside: avoid;
            }
            .seccion-titulo {
              font-size: 14px;
              font-weight: 700;
              color: #1a5d1a;
              margin-bottom: 15px;
              padding-bottom: 10px;
              border-bottom: 2px solid #e8f5e9;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .seccion-titulo.devolucion { color: #c62828; border-bottom-color: #ffebee; }
            
            /* Tablas */
            table { width: 100%; border-collapse: collapse; }
            th { 
              background: linear-gradient(135deg, #1a5d1a, #2e8b57); 
              color: white; 
              padding: 10px; 
              text-align: left; 
              font-size: 10px; 
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.3px;
            }
            th.devolucion { background: linear-gradient(135deg, #c62828, #e53935); }
            th:first-child { border-radius: 6px 0 0 0; }
            th:last-child { border-radius: 0 6px 0 0; }
            td { 
              padding: 8px 10px; 
              border-bottom: 1px solid #e9ecef; 
              font-size: 10px; 
            }
            tr:nth-child(even) { background: #f8f9fa; }
            tr:hover { background: #e8f5e9; }
            
            /* Footer */
            .footer { 
              margin-top: 30px; 
              padding-top: 20px; 
              border-top: 2px solid #e9ecef; 
              text-align: center;
            }
            .footer p { font-size: 9px; color: #999; margin-bottom: 2px; }
            .footer .brand { color: #1a5d1a; font-weight: 600; font-size: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="header-left">
                <img src="${de}" class="logo" alt="Logo">
                <div class="empresa">
                  <h1>Don Baraton</h1>
                  <p>Supermercado - Sistema de Gestión</p>
                </div>
              </div>
              <div class="header-right">
                <p>NIT: 123456789</p>
                <p>Tel: +591 XXX XXXX</p>
                <p>Dirección: La Paz, Bolivia</p>
              </div>
            </div>
            
            <div class="titulo-reporte">
              <h2>Reporte de Ventas</h2>
              <p>Período: ${o} • Generado: ${new Date().toLocaleDateString("es-BO")} ${new Date().toLocaleTimeString("es-BO")}</p>
            </div>

            <div class="stats">
              <div class="stat">
                <div class="stat-value">${g.length}</div>
                <div class="stat-label">Tickets Emitidos</div>
              </div>
              <div class="stat">
                <div class="stat-value">Bs ${a.toFixed(2)}</div>
                <div class="stat-label">Total Bruto</div>
              </div>
              <div class="stat" style="border-left-color: #c62828;">
                <div class="stat-value" style="color: #c62828;">- Bs ${s.toFixed(2)}</div>
                <div class="stat-label">Devoluciones (${f.length})</div>
              </div>
              <div class="stat" style="border-left-color: #1565c0;">
                <div class="stat-value" style="color: #1565c0;">Bs ${n.toFixed(2)}</div>
                <div class="stat-label">Ventas Netas</div>
              </div>
            </div>

            <div style="margin-bottom: 20px;">
              <h3 style="color: #1a5d1a; font-size: 16px; margin-bottom: 15px; border-left: 4px solid #1a5d1a; padding-left: 10px;">
                Detalle de Ventas (${l.length} registros mostrados)
              </h3>
            </div>
            
            ${l.map(r=>`
              <div class="seccion">
                <div class="seccion-titulo">
                  <span>Venta #${r.id||"-"} <span style="font-weight:400; color:#666; font-size:11px; margin-left:10px;">${S(r.fecha)}</span></span>
                  <span style="font-size:12px;">Total: <span style="color:#1a5d1a; font-size:14px;">Bs ${parseFloat(r.total||0).toFixed(2)}</span></span>
                </div>
                <div style="display:flex; gap:20px; margin-bottom:10px; font-size:10px; color:#555; background:#f8f9fa; padding:8px; border-radius:6px;">
                  <span><strong>Cliente:</strong> ${r.cliente||"Consumidor Final"}</span>
                  <span><strong>Cajero/a:</strong> ${r.cajero||"Sin asignar"}</span>
                  <span><strong>Comprobante:</strong> ${r.comprobante||"TICKET"}</span>
                </div>
                
                ${r.productos&&r.productos.length>0?`
                  <table>
                    <thead>
                      <tr>
                        <th style="padding:6px 10px; font-size:9px;">Producto</th>
                        <th style="padding:6px 10px; text-align:center; width:60px; font-size:9px;">Cant.</th>
                        <th style="padding:6px 10px; text-align:right; width:80px; font-size:9px;">Precio</th>
                        <th style="padding:6px 10px; text-align:right; width:80px; font-size:9px;">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${r.productos.map(h=>`
                        <tr>
                          <td style="padding:6px 10px;">${h.nombre||"Producto"}</td>
                          <td style="text-align:center; padding:6px 10px;">${h.cantidad}</td>
                          <td style="text-align:right; padding:6px 10px;">Bs ${parseFloat(h.precio_unitario||0).toFixed(2)}</td>
                          <td style="text-align:right; padding:6px 10px;">Bs ${parseFloat(h.subtotal||0).toFixed(2)}</td>
                        </tr>
                      `).join("")}
                    </tbody>
                  </table>
                `:'<p style="font-size:10px; color:#999; text-align:center; padding:10px;">Sin detalle de productos</p>'}
              </div>
            `).join("")}

            ${f.length>0?`
            <div class="seccion" style="margin-top: 30px;">
              <div class="seccion-titulo devolucion">Devoluciones de Ventas (${f.length} registros)</div>
              <table>
                <thead>
                  <tr>
                    <th class="devolucion">ID</th>
                    <th class="devolucion">Fecha</th>
                    <th class="devolucion">Venta Orig.</th>
                    <th class="devolucion">Motivo</th>
                    <th class="devolucion" style="text-align:right">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  ${f.map(r=>`
                    <tr style="background:#fff5f5">
                      <td><strong>${r.id_devolucion}</strong></td>
                      <td>${S(r.fecha)}</td>
                      <td>${r.id_venta}</td>
                      <td>${r.motivo||"-"}</td>
                      <td style="text-align:right; font-weight:700; color:#c62828">- Bs ${parseFloat(r.total_devuelto||r.total_venta||0).toFixed(2)}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
            `:""}

            <div class="seccion" style="border: 2px solid #1565c0; background: #e3f2fd; margin-top: 20px;">
              <div class="seccion-titulo" style="color: #1565c0; border-bottom-color: #bbdefb;">Resumen Financiero del Período</div>
              <table>
                <tbody>
                  <tr>
                    <td style="text-align:right; padding:8px;">Total Ventas (Bruto):</td>
                    <td style="text-align:right; font-weight:bold; width:150px;">Bs ${a.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="text-align:right; padding:8px; color:#c62828;">(-) Devoluciones:</td>
                    <td style="text-align:right; font-weight:bold; color:#c62828;">- Bs ${s.toFixed(2)}</td>
                  </tr>
                  <tr style="border-top: 2px solid #1565c0;">
                    <td style="text-align:right; padding:12px; font-weight:bold; color:#1565c0; font-size:12px;">TOTAL VENTAS NETAS:</td>
                    <td style="text-align:right; font-weight:bold; font-size:14px; color:#1565c0;">Bs ${n.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="footer">
              <p class="brand">Don Baraton - Sistema de Gestión de Supermercado</p>
              <p>Reporte generado automáticamente • ${new Date().toLocaleDateString("es-BO")} ${new Date().toLocaleTimeString("es-BO")}</p>
              <p>Este documento es para uso interno</p>
            </div>
          </div>
        </body>
        </html>
      `,F=window.open("","_blank");if(!F){m.error("Por favor permite las ventanas emergentes para generar el PDF"),_(!1);return}F.document.write(u),F.document.close(),setTimeout(()=>{F.print(),m.success("PDF listo para guardar")},500)}catch(o){console.error("Error:",o),m.error("Error al generar PDF")}finally{_(!1)}},p=o=>`Bs ${parseFloat(o||0).toFixed(2)}`,S=o=>{if(!o)return"-";const a=new Date(o);return`${a.toLocaleDateString("es-BO")} ${a.toLocaleTimeString("es-BO",{hour:"2-digit",minute:"2-digit"})}`};return e.jsxs("div",{style:t.container,children:[e.jsx(ce,{position:"top-right"}),e.jsxs("header",{style:t.header,children:[e.jsxs("div",{children:[e.jsxs("h1",{style:t.title,children:[e.jsx(M,{size:28,style:{marginRight:"12px"}}),"Reportes de Ventas"]}),e.jsxs("p",{style:t.subtitle,children:["Historial y estadísticas de ventas • ",g.length," registros"]})]}),e.jsx("button",{style:t.exportButton,onClick:ie,disabled:E||g.length===0,children:E?e.jsxs(e.Fragment,{children:[e.jsx(I,{size:18,style:{animation:"spin 1s linear infinite"}})," Generando..."]}):e.jsxs(e.Fragment,{children:[e.jsx(pe,{size:18})," Exportar PDF"]})})]}),e.jsxs("div",{style:t.statsGrid,children:[e.jsxs("div",{style:{...t.statCard,borderTop:"4px solid #1a5d1a"},children:[e.jsx(se,{size:32,style:{color:"#1a5d1a"}}),e.jsxs("div",{children:[e.jsx("span",{style:t.statValue,children:j.cantidadTickets}),e.jsx("span",{style:t.statLabel,children:"Tickets Emitidos"})]})]}),e.jsxs("div",{style:{...t.statCard,borderTop:"4px solid #2e7d32"},children:[e.jsx(N,{size:32,style:{color:"#2e7d32"}}),e.jsxs("div",{children:[e.jsx("span",{style:{...t.statValue,color:"#2e7d32"},children:p(j.totalVentas)}),e.jsx("span",{style:t.statLabel,children:"Total Bruto"})]})]}),e.jsxs("div",{style:{...t.statCard,borderTop:"4px solid #c62828"},children:[e.jsx(xe,{size:32,style:{color:"#c62828"}}),e.jsxs("div",{children:[e.jsxs("span",{style:{...t.statValue,color:"#c62828"},children:["- ",p(j.totalDevoluciones)]}),e.jsx("span",{style:t.statLabel,children:"Devoluciones"})]})]}),e.jsxs("div",{style:{...t.statCard,borderTop:"4px solid #1565c0"},children:[e.jsx(N,{size:32,style:{color:"#1565c0"}}),e.jsxs("div",{children:[e.jsx("span",{style:{...t.statValue,color:"#1565c0",fontSize:"28px"},children:p(j.ventasNetas)}),e.jsx("span",{style:t.statLabel,children:"VENTAS NETAS"})]})]})]}),e.jsxs("div",{style:t.filtersCard,children:[e.jsxs("h3",{style:t.filtersTitle,children:[e.jsx(re,{size:18})," Filtros de Período"]}),e.jsxs("div",{style:t.filtersRow,children:[e.jsx("div",{style:t.periodButtons,children:[{key:"hoy",label:"Hoy"},{key:"semana",label:"Esta Semana"},{key:"mes",label:"Este Mes"}].map(o=>e.jsx("button",{style:{...t.periodButton,...i.periodo===o.key?t.periodButtonActive:{}},onClick:()=>te(o.key),children:o.label},o.key))}),e.jsxs("div",{style:t.filterGroup,children:[e.jsx("label",{style:t.filterLabel,children:"Desde:"}),e.jsx("input",{type:"date",value:i.fechaInicio,onChange:o=>C({...i,periodo:"personalizado",fechaInicio:o.target.value}),style:t.input})]}),e.jsxs("div",{style:t.filterGroup,children:[e.jsx("label",{style:t.filterLabel,children:"Hasta:"}),e.jsx("input",{type:"date",value:i.fechaFin,onChange:o=>C({...i,periodo:"personalizado",fechaFin:o.target.value}),style:t.input})]}),e.jsxs("div",{style:t.filterGroup,children:[e.jsx("label",{style:t.filterLabel,children:"Cajero:"}),e.jsxs("div",{style:{position:"relative"},children:[e.jsx("input",{type:"text",value:O,onChange:o=>{k(o.target.value),w(!0),o.target.value||T("")},onFocus:()=>w(!0),placeholder:"Buscar cajero...",style:{...t.input,minWidth:"200px"}}),P&&e.jsxs("div",{style:{position:"absolute",top:"100%",left:0,right:0,maxHeight:"200px",overflowY:"auto",background:"white",border:"1px solid #e9ecef",borderRadius:"8px",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",zIndex:100},children:[e.jsx("div",{style:{padding:"10px 15px",cursor:"pointer",background:c?"white":"#e8f5e9",borderBottom:"1px solid #e9ecef"},onClick:()=>{T(""),k(""),w(!1)},children:e.jsx("strong",{children:"Todas las cajas"})}),Q.filter(o=>{const a=O.toLowerCase();return(o.empleado_nombre||o.username||"").toLowerCase().includes(a)}).slice(0,10).map(o=>e.jsxs("div",{style:{padding:"10px 15px",cursor:"pointer",background:c===o.id_usuario?"#e8f5e9":"white",borderBottom:"1px solid #f0f0f0"},onClick:()=>{T(o.id_usuario),k(o.empleado_nombre||o.username),w(!1)},onMouseEnter:a=>a.target.style.background="#f8f9fa",onMouseLeave:a=>a.target.style.background=c===o.id_usuario?"#e8f5e9":"white",children:[e.jsx("div",{style:{fontWeight:"500"},children:o.empleado_nombre||o.username}),e.jsx("div",{style:{fontSize:"11px",color:"#666"},children:o.rol_nombre||"Usuario"})]},o.id_usuario))]}),P&&e.jsx("div",{style:{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:99},onClick:()=>w(!1)})]})]}),e.jsxs("button",{style:{...t.periodButton,background:y?"#e8f5e9":"#fff3e0",color:y?"#2e7d32":"#e65100"},onClick:()=>J(!y),title:y?"Orden Ascendente":"Orden Descendente",children:[y?e.jsx(he,{size:14}):e.jsx(ge,{size:14}),y?"Antiguo primero":"Reciente primero"]}),e.jsx("button",{style:t.clearButton,onClick:oe,children:"Limpiar"})]}),e.jsxs("div",{style:{marginTop:"10px",fontSize:"13px",color:"#1a5d1a",fontWeight:"500"},children:["📅 Período: ",H()]})]}),e.jsxs("div",{style:t.tableContainer,children:[e.jsxs("div",{style:t.tableHeader,children:[e.jsxs("h3",{style:t.tableTitle,children:["Historial de Ventas (",g.length," registros)"]}),e.jsxs("button",{style:t.refreshButton,onClick:B,disabled:z,children:[e.jsx(I,{size:16,style:{animation:z?"spin 1s linear infinite":"none"}}),"Actualizar"]})]}),z?e.jsxs("div",{style:t.loadingState,children:[e.jsx(I,{size:40,style:{animation:"spin 1s linear infinite",color:"#1a5d1a"}}),e.jsx("p",{children:"Cargando datos..."})]}):g.length===0?e.jsxs("div",{style:t.emptyState,children:[e.jsx(M,{size:48,style:{color:"#ccc"}}),e.jsx("p",{children:"No hay ventas para mostrar"})]}):e.jsxs("table",{style:t.table,children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{style:t.th,children:"ID Venta"}),e.jsx("th",{style:t.th,children:"Fecha/Hora"}),e.jsx("th",{style:t.th,children:"Cliente"}),e.jsx("th",{style:t.th,children:"Cajero"}),e.jsx("th",{style:t.th,children:"Comprobante"}),e.jsx("th",{style:t.th,children:"Total"}),e.jsx("th",{style:{...t.th,textAlign:"center"},children:"Detalle"})]})}),e.jsx("tbody",{children:g.map((o,a)=>e.jsxs("tr",{style:t.tr,children:[e.jsx("td",{style:t.td,children:e.jsx("strong",{children:o.id||"-"})}),e.jsx("td",{style:t.td,children:S(o.fecha)}),e.jsx("td",{style:t.td,children:o.cliente||"Cliente General"}),e.jsx("td",{style:t.td,children:e.jsx("span",{style:{...t.badge,background:"#e8f5e9",color:"#2e7d32"},children:o.cajero||"Sin asignar"})}),e.jsx("td",{style:t.td,children:e.jsx("span",{style:{...t.badge,background:o.comprobante?.includes("FACTURA")?"#e3f2fd":"#f5f5f5"},children:o.comprobante||"TICKET"})}),e.jsx("td",{style:t.td,children:e.jsx("strong",{style:{color:"#1a5d1a"},children:p(o.total)})}),e.jsx("td",{style:{...t.td,textAlign:"center"},children:e.jsx("button",{style:t.viewButton,onClick:()=>ae(o),title:"Ver detalle",children:e.jsx(G,{size:16})})})]},o.id||`venta-${a}`))}),e.jsx("tfoot",{children:e.jsxs("tr",{style:t.tfootRow,children:[e.jsx("td",{colSpan:"6",style:{...t.td,textAlign:"right",fontWeight:"600"},children:"Total Filtrado:"}),e.jsx("td",{style:{...t.td,fontWeight:"700",color:"#1a5d1a",fontSize:"16px"},children:p(g.reduce((o,a)=>o+parseFloat(a.total||0),0))}),e.jsx("td",{style:t.td})]})})]})]}),f.length>0&&e.jsxs("div",{style:{...t.tableContainer,borderTop:"4px solid #c62828",marginTop:"25px"},children:[e.jsx("div",{style:t.tableHeader,children:e.jsxs("h3",{style:{...t.tableTitle,color:"#c62828"},children:[e.jsx(ne,{size:18,style:{marginRight:"8px"}}),"Devoluciones de Ventas (",f.length," registros) - Total: ",p(j.totalDevoluciones)]})}),e.jsxs("table",{style:t.table,children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{style:{...t.th,background:"#c62828"},children:"ID Devolución"}),e.jsx("th",{style:{...t.th,background:"#c62828"},children:"Venta"}),e.jsx("th",{style:{...t.th,background:"#c62828"},children:"Fecha"}),e.jsx("th",{style:{...t.th,background:"#c62828"},children:"Cliente"}),e.jsx("th",{style:{...t.th,background:"#c62828"},children:"Realizado por"}),e.jsx("th",{style:{...t.th,background:"#c62828",textAlign:"center"},children:"Productos"}),e.jsx("th",{style:{...t.th,background:"#c62828"},children:"Motivo"}),e.jsx("th",{style:{...t.th,background:"#c62828",textAlign:"right"},children:"Total Devuelto"})]})}),e.jsx("tbody",{children:f.map((o,a)=>e.jsxs("tr",{style:{...t.tr,background:"#fff5f5"},children:[e.jsx("td",{style:t.td,children:e.jsx("strong",{children:o.id_devolucion})}),e.jsx("td",{style:t.td,children:o.id_venta}),e.jsx("td",{style:t.td,children:S(o.fecha)}),e.jsx("td",{style:t.td,children:o.cliente||"Cliente General"}),e.jsx("td",{style:t.td,children:e.jsx("span",{style:{...t.badge,background:"#ffebee",color:"#c62828"},children:o.usuario_devolucion||"Sistema"})}),e.jsx("td",{style:{...t.td,textAlign:"center"},children:o.productos_devueltos||0}),e.jsx("td",{style:t.td,children:o.motivo||"-"}),e.jsxs("td",{style:{...t.td,textAlign:"right",color:"#c62828",fontWeight:"700"},children:["- ",p(o.total_devuelto||o.total_venta||0)]})]},`dev-${a}`))}),e.jsx("tfoot",{children:e.jsxs("tr",{style:{background:"#ffebee"},children:[e.jsx("td",{colSpan:"7",style:{...t.td,textAlign:"right",fontWeight:"600",color:"#c62828"},children:"Total Devoluciones:"}),e.jsxs("td",{style:{...t.td,fontWeight:"700",color:"#c62828",fontSize:"16px",textAlign:"right"},children:["- ",p(j.totalDevoluciones)]})]})})]})]}),Y&&b&&e.jsx("div",{style:t.modalOverlay,onClick:()=>D(!1),children:e.jsxs("div",{style:t.modal,onClick:o=>o.stopPropagation(),children:[e.jsxs("div",{style:t.modalHeader,children:[e.jsxs("h2",{style:t.modalTitle,children:[e.jsx(G,{size:20})," Detalle de Venta"]}),e.jsx("button",{style:t.closeButton,onClick:()=>D(!1),children:e.jsx(le,{size:20})})]}),e.jsxs("div",{style:t.modalBody,children:[e.jsxs("div",{style:t.infoCard,children:[e.jsxs("p",{children:[e.jsx("strong",{children:"Venta:"})," ",b.id||"-"]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Fecha:"})," ",S(b.fecha)]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Cliente:"})," ",b.cliente||"Cliente General"]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Cajero:"})," ",b.cajero||"Sin asignar"]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Comprobante:"})," ",b.comprobante||"TICKET"]})]}),A.length>0&&e.jsxs("div",{style:{marginTop:"20px"},children:[e.jsx("h4",{style:{marginBottom:"10px",color:"#1a5d1a"},children:"Productos:"}),e.jsxs("table",{style:{width:"100%",fontSize:"13px"},children:[e.jsx("thead",{children:e.jsxs("tr",{style:{background:"#f8f9fa"},children:[e.jsx("th",{style:{padding:"8px",textAlign:"left"},children:"Producto"}),e.jsx("th",{style:{padding:"8px",textAlign:"center"},children:"Cant."}),e.jsx("th",{style:{padding:"8px",textAlign:"right"},children:"Precio"}),e.jsx("th",{style:{padding:"8px",textAlign:"right"},children:"Subtotal"})]})}),e.jsx("tbody",{children:A.map((o,a)=>e.jsxs("tr",{style:{borderBottom:"1px solid #e9ecef"},children:[e.jsx("td",{style:{padding:"8px"},children:o.nombre||"Producto"}),e.jsx("td",{style:{padding:"8px",textAlign:"center"},children:o.cantidad}),e.jsx("td",{style:{padding:"8px",textAlign:"right"},children:p(o.precio_unitario)}),e.jsx("td",{style:{padding:"8px",textAlign:"right"},children:p(o.subtotal)})]},`det-${a}`))})]})]}),e.jsxs("p",{style:t.totalBig,children:[e.jsx("strong",{children:"Total:"})," ",p(b.total)]})]}),e.jsx("div",{style:t.modalFooter,children:e.jsx("button",{style:t.modalCancelButton,onClick:()=>D(!1),children:"Cerrar"})})]})}),e.jsx("style",{children:"@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }"})]})}const t={container:{padding:"20px",maxWidth:"1400px",margin:"0 auto"},header:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"25px",flexWrap:"wrap",gap:"15px"},title:{margin:0,fontSize:"28px",fontWeight:"700",color:"#1a5d1a",display:"flex",alignItems:"center"},subtitle:{margin:"8px 0 0 0",color:"#6c757d",fontSize:"14px"},exportButton:{display:"flex",alignItems:"center",gap:"8px",padding:"12px 20px",background:"linear-gradient(135deg, #1a5d1a, #2e8b57)",color:"white",border:"none",borderRadius:"10px",fontSize:"14px",fontWeight:"600",cursor:"pointer",boxShadow:"0 4px 12px rgba(26, 93, 26, 0.3)"},statsGrid:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))",gap:"20px",marginBottom:"25px"},statCard:{display:"flex",alignItems:"center",gap:"20px",padding:"25px",background:"white",borderRadius:"16px",boxShadow:"0 2px 12px rgba(0,0,0,0.05)"},statValue:{display:"block",fontSize:"28px",fontWeight:"700",color:"#1a5d1a"},statLabel:{fontSize:"14px",color:"#6c757d"},filtersCard:{background:"white",borderRadius:"16px",padding:"20px",marginBottom:"25px",boxShadow:"0 2px 12px rgba(0,0,0,0.05)"},filtersTitle:{display:"flex",alignItems:"center",gap:"8px",margin:"0 0 15px 0",fontSize:"16px",fontWeight:"600",color:"#333"},filtersRow:{display:"flex",gap:"15px",flexWrap:"wrap",alignItems:"flex-end"},periodButtons:{display:"flex",gap:"5px",marginRight:"20px"},periodButton:{padding:"8px 16px",border:"2px solid #e9ecef",borderRadius:"8px",background:"white",cursor:"pointer",fontSize:"13px",fontWeight:"500",color:"#6c757d",transition:"all 0.2s",display:"flex",alignItems:"center",gap:"5px"},periodButtonActive:{background:"#1a5d1a",color:"white",borderColor:"#1a5d1a"},filterGroup:{display:"flex",flexDirection:"column",gap:"5px"},filterLabel:{fontSize:"13px",fontWeight:"500",color:"#6c757d"},input:{padding:"10px 15px",border:"2px solid #e9ecef",borderRadius:"10px",fontSize:"14px",outline:"none"},clearButton:{padding:"10px 20px",background:"#f8f9fa",border:"1px solid #e9ecef",borderRadius:"10px",fontSize:"14px",cursor:"pointer",color:"#6c757d"},tableContainer:{background:"white",borderRadius:"16px",boxShadow:"0 2px 12px rgba(0,0,0,0.05)",overflow:"hidden",marginBottom:"25px"},tableHeader:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px",borderBottom:"1px solid #e9ecef"},tableTitle:{margin:0,fontSize:"16px",fontWeight:"600",color:"#333"},refreshButton:{display:"flex",alignItems:"center",gap:"8px",padding:"10px 16px",background:"white",border:"1px solid #e9ecef",borderRadius:"10px",fontSize:"14px",color:"#495057",cursor:"pointer"},table:{width:"100%",borderCollapse:"collapse"},th:{padding:"15px 20px",textAlign:"left",background:"#f8f9fa",color:"#1a5d1a",fontWeight:"600",fontSize:"14px",borderBottom:"2px solid #e9ecef"},tr:{borderBottom:"1px solid #e9ecef"},td:{padding:"15px 20px",fontSize:"14px",color:"#495057"},tfootRow:{background:"#f8f9fa"},badge:{display:"inline-block",padding:"5px 12px",borderRadius:"20px",fontSize:"12px",fontWeight:"500"},viewButton:{padding:"8px",background:"#e3f2fd",border:"none",borderRadius:"8px",cursor:"pointer",color:"#1976d2"},loadingState:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"60px 20px",color:"#6c757d",gap:"15px"},emptyState:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"60px 20px",color:"#6c757d",gap:"15px"},modalOverlay:{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0, 0, 0, 0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1e3,padding:"20px"},modal:{background:"white",borderRadius:"16px",width:"100%",maxWidth:"600px",boxShadow:"0 20px 60px rgba(0, 0, 0, 0.3)",overflow:"hidden",maxHeight:"90vh",overflowY:"auto"},modalHeader:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 25px",borderBottom:"1px solid #e9ecef",background:"linear-gradient(135deg, #f8f9fa, #e8f5e9)"},modalTitle:{margin:0,fontSize:"20px",fontWeight:"600",color:"#1a5d1a",display:"flex",alignItems:"center",gap:"10px"},closeButton:{background:"none",border:"none",cursor:"pointer",color:"#6c757d",padding:"5px",borderRadius:"5px"},modalBody:{padding:"25px"},infoCard:{padding:"20px",background:"#f8f9fa",borderRadius:"12px"},totalBig:{marginTop:"20px",fontSize:"20px",color:"#1a5d1a",padding:"15px",background:"#e8f5e9",borderRadius:"10px",textAlign:"center"},modalFooter:{display:"flex",justifyContent:"flex-end",gap:"12px",padding:"20px 25px",borderTop:"1px solid #e9ecef",background:"#f8f9fa"},modalCancelButton:{padding:"10px 20px",background:"white",border:"1px solid #e9ecef",borderRadius:"8px",fontSize:"14px",cursor:"pointer",color:"#6c757d"}};export{Te as default};
