import{r as c,s as F,j as e,q as J,o as _,b as K,E as R,X as Q,p as Z}from"./index-DyRGlXyn.js";import{n as y,F as ee,L as T}from"./index-Bk6qzOxF.js";import{F as $}from"./file-chart-column-increasing-CW4iBOj0.js";import{F as te}from"./file-down-B7taR7BA.js";import{D as A}from"./dollar-sign-BJpoOmkd.js";import{a as oe,A as re}from"./arrow-up-D_Oo1aW9.js";function ce(){const[z,P]=c.useState([]),[L,W]=c.useState([]),[w,k]=c.useState(!0),[N,j]=c.useState(!1),[f,M]=c.useState(null),[C,D]=c.useState(!1),[h,H]=c.useState(!1),[m,G]=c.useState([]),[i,v]=c.useState({periodo:"mes",fechaInicio:(()=>{const o=new Date;return o.setDate(1),o.toISOString().split("T")[0]})(),fechaFin:new Date().toISOString().split("T")[0],proveedor:""}),[u,X]=c.useState({totalCompras:0,cantidadOrdenes:0,ordenesRecibidas:0,ordenesPendientes:0,totalDevoluciones:0,comprasNetas:0});c.useEffect(()=>{I()},[i.fechaInicio,i.fechaFin]);const I=async()=>{k(!0);try{const o=await F.rpc("fn_leer_ordenes_compra_completo",{p_estado:null,p_fecha_inicio:i.fechaInicio||null,p_fecha_fin:i.fechaFin||null,p_id_proveedor:i.proveedor||null});if(o.error)y.error("Error al cargar datos");else{const r=(o.data||[]).map(d=>({id:d.id_orden,id_proveedor:d.id_proveedor,proveedor:d.proveedor||"Sin proveedor",fecha_emision:d.fecha_emision,fecha_entrega:d.fecha_entrega,total:d.total,estado:d.estado}));P(r);const s=await F.rpc("fn_listar_proveedores");s.error||W(s.data||[]);const a=await F.rpc("fn_leer_devoluciones_proveedor",{p_fecha_inicio:i.fechaInicio||null,p_fecha_fin:i.fechaFin||null}),n=a.error?[]:a.data||[];G(n),B(r,n)}}catch{y.error("Error al cargar datos")}finally{k(!1)}},B=(o,r=[])=>{const s=o.reduce((n,d)=>n+parseFloat(d.total||0),0),a=r.reduce((n,d)=>n+parseFloat(d.total||0),0);X({totalCompras:s,cantidadOrdenes:o.length,ordenesRecibidas:o.filter(n=>n.estado==="RECIBIDA").length,ordenesPendientes:o.filter(n=>n.estado==="PENDIENTE").length,totalDevoluciones:a,comprasNetas:s-a})},E=()=>{const o=new Date;switch(o.setHours(0,0,0,0),i.periodo){case"hoy":return{inicio:o,fin:new Date(o.getTime()+1440*60*1e3)};case"semana":const r=new Date(o);return r.setDate(o.getDate()-o.getDay()),{inicio:r,fin:new Date(r.getTime()+10080*60*1e3)};case"mes":return{inicio:new Date(o.getFullYear(),o.getMonth(),1),fin:new Date(o.getFullYear(),o.getMonth()+1,0)};default:return null}},p=z.filter(o=>{if(i.proveedor&&o.id_proveedor!==i.proveedor)return!1;const r=new Date(o.fecha_emision+"T12:00:00");if(i.periodo!=="todos"&&i.periodo!=="personalizado"){const s=E();if(s&&(r<s.inicio||r>s.fin))return!1}return!((i.periodo==="personalizado"||i.fechaInicio||i.fechaFin)&&(i.fechaInicio&&r<new Date(i.fechaInicio+"T00:00:00")||i.fechaFin&&r>new Date(i.fechaFin+"T23:59:59")))}).sort((o,r)=>{const s=parseInt((o.id||"").replace(/\D/g,"")||"0"),a=parseInt((r.id||"").replace(/\D/g,"")||"0");return h?s-a:a-s}),b=m.filter(o=>{const r=new Date(o.fecha);if(i.periodo!=="todos"&&i.periodo!=="personalizado"){const s=E();if(s&&(r<s.inicio||r>new Date(s.fin.getTime()+86399999)))return!1}return!(i.fechaInicio&&r<new Date(i.fechaInicio+"T00:00:00")||i.fechaFin&&r>new Date(i.fechaFin+"T23:59:59"))});c.useEffect(()=>{B(p,b)},[i,z,m]),c.useEffect(()=>{if(i.fechaInicio&&i.fechaFin){const o=new Date(i.fechaInicio),r=new Date(i.fechaFin);o>r&&y.error('La fecha "Desde" no puede ser mayor que "Hasta"')}},[i.fechaInicio,i.fechaFin]);const V=()=>{const o=new Date,r=new Date(o.getFullYear(),o.getMonth(),1);v({periodo:"mes",fechaInicio:r.toISOString().split("T")[0],fechaFin:o.toISOString().split("T")[0],proveedor:""})},O=()=>{const o={day:"2-digit",month:"long",year:"numeric"};if(i.fechaInicio&&i.fechaFin){const r=new Date(i.fechaInicio+"T00:00:00").toLocaleDateString("es-BO",o),s=new Date(i.fechaFin+"T00:00:00").toLocaleDateString("es-BO",o);return i.fechaInicio===i.fechaFin?r:`${r} - ${s}`}return"Todas las fechas"},Y=o=>{M(o),j(!0)},U=async()=>{D(!0);try{const o=O(),r=p.reduce((l,S)=>l+parseFloat(S.total||0),0),s=b.reduce((l,S)=>l+parseFloat(S.total||0),0),a=r-s,n=`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Reporte de Compras - Don Baraton</title>
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
              margin-bottom: 20px;
              border: 1px solid #e9ecef;
              box-shadow: 0 2px 8px rgba(0,0,0,0.04);
            }
            .seccion-titulo {
              font-size: 14px;
              font-weight: 700;
              color: #1a5d1a;
              margin-bottom: 15px;
              padding-bottom: 10px;
              border-bottom: 2px solid #e8f5e9;
            }
            .seccion-titulo.devolucion { color: #c62828; border-bottom-color: #ffebee; }
            
            /* Tablas */
            table { width: 100%; border-collapse: collapse; }
            th { 
              background: linear-gradient(135deg, #1a5d1a, #2e8b57); 
              color: white; 
              padding: 12px 10px; 
              text-align: left; 
              font-size: 10px; 
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.3px;
            }
            th.devolucion { background: linear-gradient(135deg, #c62828, #e53935); }
            th:first-child { border-radius: 8px 0 0 0; }
            th:last-child { border-radius: 0 8px 0 0; }
            td { 
              padding: 10px; 
              border-bottom: 1px solid #e9ecef; 
              font-size: 10px; 
            }
            tr:nth-child(even) { background: #f8f9fa; }
            tr:hover { background: #e8f5e9; }
            .currency { font-weight: 600; }
            .positive { color: #2e7d32; }
            .negative { color: #c62828; }
            
            tfoot td {
              background: linear-gradient(135deg, #e8f5e9, #f0f9f0);
              font-weight: 700;
              border-top: 2px solid #1a5d1a;
            }
            
            /* Footer */
            .footer { 
              margin-top: 30px; 
              padding-top: 20px; 
              border-top: 2px solid #e9ecef; 
              text-align: center;
            }
            .footer p { font-size: 9px; color: #999; margin-bottom: 2px; }
            .footer .brand { color: #1a5d1a; font-weight: 600; font-size: 10px; }
            
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .container { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="header-left">
                <img src="${Z}" class="logo" alt="Logo">
                <div class="empresa">
                  <h1>Don Baraton</h1>
                  <p>Supermercado - Sistema de Gestión</p>
                </div>
              </div>
              <div class="header-right">
                <p><strong>NIT:</strong> 123456789</p>
                <p><strong>Tel:</strong> +591 XXX XXXX</p>
                <p><strong>Dirección:</strong> La Paz, Bolivia</p>
              </div>
            </div>
            
            <div class="titulo-reporte">
              <h2>Reporte de Compras</h2>
              <p>Período: ${o} • Generado: ${new Date().toLocaleDateString("es-BO")} ${new Date().toLocaleTimeString("es-BO")}</p>
            </div>

            <div class="stats">
              <div class="stat">
                <div class="stat-value">${p.length}</div>
                <div class="stat-label">Órdenes Totales</div>
              </div>
              <div class="stat">
                <div class="stat-value">Bs ${r.toFixed(2)}</div>
                <div class="stat-label">Total Bruto</div>
              </div>
              <div class="stat" style="border-left-color: #c62828;">
                <div class="stat-value" style="color: #c62828;">- Bs ${s.toFixed(2)}</div>
                <div class="stat-label">Devoluciones (${b.length})</div>
              </div>
              <div class="stat" style="border-left-color: #1565c0;">
                <div class="stat-value" style="color: #1565c0;">Bs ${a.toFixed(2)}</div>
                <div class="stat-label">Compras Netas</div>
              </div>
            </div>


            <div class="seccion">
              <div class="seccion-titulo">Órdenes de Compra</div>
              <table>
                <thead>
                  <tr>
                    <th>ID Orden</th>
                    <th>Proveedor</th>
                    <th>Fecha Emisión</th>
                    <th>Fecha Entrega</th>
                    <th style="text-align:right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${p.map(l=>`
                    <tr>
                      <td><strong>${l.id}</strong></td>
                      <td>${l.proveedor}</td>
                      <td>${g(l.fecha_emision)}</td>
                      <td>${g(l.fecha_entrega)||"-"}</td>
                      <td style="text-align:right" class="currency positive"><strong>Bs ${parseFloat(l.total||0).toFixed(2)}</strong></td>
                    </tr>
                  `).join("")}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="4" style="text-align:right"><strong>TOTAL:</strong></td>
                    <td style="text-align:right" class="currency positive"><strong>Bs ${r.toFixed(2)}</strong></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            ${b.length>0?`
            <div class="seccion">
              <div class="seccion-titulo devolucion">Devoluciones a Proveedores (${b.length} registros)</div>
              <table>
                <thead>
                  <tr>
                    <th class="devolucion">ID</th>
                    <th class="devolucion">Fecha</th>
                    <th class="devolucion">Producto</th>
                    <th class="devolucion" style="text-align:center">Cantidad</th>
                    <th class="devolucion">Motivo</th>
                    <th class="devolucion" style="text-align:right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${b.map(l=>`
                    <tr style="background:#fff5f5">
                      <td><strong>${l.id_devolucion}</strong></td>
                      <td>${g(l.fecha)}</td>
                      <td>${l.producto||"Sin producto"}</td>
                      <td style="text-align:center;color:#c62828;font-weight:700">${l.cantidad}</td>
                      <td>${l.motivo||"-"}</td>
                      <td style="text-align:right;color:#c62828;font-weight:700">- Bs ${parseFloat(l.total||0).toFixed(2)}</td>
                    </tr>
                  `).join("")}
                </tbody>
                <tfoot>
                  <tr style="background:#ffebee">
                    <td colspan="5" style="text-align:right"><strong>TOTAL DEVOLUCIONES:</strong></td>
                    <td style="text-align:right;color:#c62828;font-weight:700"><strong>- Bs ${s.toFixed(2)}</strong></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            `:""}

            <div class="seccion" style="border: 2px solid #1565c0; background: #e3f2fd;">
              <div class="seccion-titulo" style="color: #1565c0; border-bottom-color: #bbdefb;">Resumen Financiero del Período</div>
              <table>
                <tbody>
                  <tr>
                    <td style="text-align:right; font-size:12px; padding:8px;">Total Compras (Bruto):</td>
                    <td style="text-align:right; font-weight:bold; font-size:12px; width:150px;">Bs ${r.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="text-align:right; font-size:12px; padding:8px; color:#c62828;">(-) Devoluciones:</td>
                    <td style="text-align:right; font-weight:bold; font-size:12px; color:#c62828;">- Bs ${s.toFixed(2)}</td>
                  </tr>
                  <tr style="border-top: 2px solid #1565c0;">
                    <td style="text-align:right; font-size:14px; padding:12px; font-weight:bold; color:#1565c0;">TOTAL COMPRAS NETAS:</td>
                    <td style="text-align:right; font-weight:bold; font-size:16px; color:#1565c0;">Bs ${a.toFixed(2)}</td>
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
      `,d=window.open("","_blank");if(!d){y.error("Por favor permite las ventanas emergentes para generar el PDF"),D(!1);return}d.document.write(n),d.document.close(),setTimeout(()=>{d.print(),y.success("PDF listo para guardar")},500)}catch(o){console.error("Error:",o),y.error("Error al generar PDF")}finally{D(!1)}},x=o=>`Bs ${parseFloat(o||0).toFixed(2)}`,g=o=>{if(!o)return"-";const[r,s,a]=o.split("-");return r&&s&&a?`${a}/${s}/${r}`:new Date(o+"T12:00:00").toLocaleDateString("es-BO")},q=o=>{const r={PENDIENTE:{bg:"#fff3e0",color:"#e65100"},RECIBIDA:{bg:"#e8f5e9",color:"#2e7d32"},CANCELADA:{bg:"#ffebee",color:"#c62828"}},s=r[o]||r.PENDIENTE;return e.jsx("span",{style:{...t.badge,background:s.bg,color:s.color},children:o})};return e.jsxs("div",{style:t.container,children:[e.jsx(ee,{position:"top-right"}),e.jsxs("header",{style:t.header,children:[e.jsxs("div",{children:[e.jsxs("h1",{style:t.title,children:[e.jsx($,{size:28,style:{marginRight:"12px"}}),"Reportes de Compras"]}),e.jsxs("p",{style:t.subtitle,children:["Historial y estadísticas de compras • ",p.length," registros"]})]}),e.jsx("button",{style:t.exportButton,onClick:U,disabled:C||p.length===0,children:C?e.jsxs(e.Fragment,{children:[e.jsx(T,{size:18,style:{animation:"spin 1s linear infinite"}})," Generando..."]}):e.jsxs(e.Fragment,{children:[e.jsx(te,{size:18})," Exportar PDF"]})})]}),e.jsxs("div",{style:t.statsGrid,children:[e.jsxs("div",{style:{...t.statCard,borderTop:"4px solid #1a5d1a"},children:[e.jsx(J,{size:32,style:{color:"#1a5d1a"}}),e.jsxs("div",{children:[e.jsx("span",{style:t.statValue,children:u.cantidadOrdenes}),e.jsx("span",{style:t.statLabel,children:"Órdenes Totales"})]})]}),e.jsxs("div",{style:{...t.statCard,borderTop:"4px solid #2e7d32"},children:[e.jsx(A,{size:32,style:{color:"#2e7d32"}}),e.jsxs("div",{children:[e.jsx("span",{style:{...t.statValue,color:"#2e7d32"},children:x(u.totalCompras)}),e.jsx("span",{style:t.statLabel,children:"Total Bruto"})]})]}),e.jsxs("div",{style:{...t.statCard,borderTop:"4px solid #c62828"},children:[e.jsx(_,{size:32,style:{color:"#c62828"}}),e.jsxs("div",{children:[e.jsxs("span",{style:{...t.statValue,color:"#c62828"},children:["- ",x(u.totalDevoluciones)]}),e.jsx("span",{style:t.statLabel,children:"Devoluciones"})]})]}),e.jsxs("div",{style:{...t.statCard,borderTop:"4px solid #1565c0"},children:[e.jsx(A,{size:32,style:{color:"#1565c0"}}),e.jsxs("div",{children:[e.jsx("span",{style:{...t.statValue,color:"#1565c0",fontSize:"28px"},children:x(u.comprasNetas)}),e.jsx("span",{style:t.statLabel,children:"COMPRAS NETAS"})]})]})]}),e.jsxs("div",{style:t.filtersCard,children:[e.jsxs("h3",{style:t.filtersTitle,children:[e.jsx(K,{size:18})," Filtros de Período"]}),e.jsxs("div",{style:t.filtersRow,children:[e.jsx("div",{style:t.periodButtons,children:[{key:"hoy",label:"Hoy"},{key:"semana",label:"Esta Semana"},{key:"mes",label:"Este Mes"}].map(o=>e.jsx("button",{style:{...t.periodButton,...i.periodo===o.key?t.periodButtonActive:{}},onClick:()=>{const r=new Date;let s,a;switch(o.key){case"hoy":s=a=r.toISOString().split("T")[0];break;case"semana":const n=new Date(r);n.setDate(r.getDate()-r.getDay()),s=n.toISOString().split("T")[0],a=r.toISOString().split("T")[0];break;case"mes":s=new Date(r.getFullYear(),r.getMonth(),1).toISOString().split("T")[0],a=r.toISOString().split("T")[0];break;default:s=a=r.toISOString().split("T")[0]}v({...i,periodo:o.key,fechaInicio:s,fechaFin:a})},children:o.label},o.key))}),e.jsxs("div",{style:t.filterGroup,children:[e.jsx("label",{style:t.filterLabel,children:"Desde:"}),e.jsx("input",{type:"date",value:i.fechaInicio,onChange:o=>v({...i,periodo:"personalizado",fechaInicio:o.target.value}),style:t.input})]}),e.jsxs("div",{style:t.filterGroup,children:[e.jsx("label",{style:t.filterLabel,children:"Hasta:"}),e.jsx("input",{type:"date",value:i.fechaFin,onChange:o=>v({...i,periodo:"personalizado",fechaFin:o.target.value}),style:t.input})]}),e.jsxs("div",{style:t.filterGroup,children:[e.jsx("label",{style:t.filterLabel,children:"Proveedor:"}),e.jsxs("select",{value:i.proveedor,onChange:o=>v({...i,proveedor:o.target.value}),style:t.select,children:[e.jsx("option",{value:"",children:"Todos"}),L.map(o=>e.jsx("option",{value:o.id_proveedor,children:o.razon_social},o.id_proveedor))]})]}),e.jsxs("button",{style:{...t.periodButton,background:h?"#e8f5e9":"#fff3e0",color:h?"#2e7d32":"#e65100",borderColor:h?"#2e7d32":"#e65100"},onClick:()=>H(!h),title:h?"Orden Ascendente":"Orden Descendente",children:[h?e.jsx(oe,{size:14}):e.jsx(re,{size:14}),h?"Antiguo primero":"Reciente primero"]}),e.jsx("button",{style:t.clearButton,onClick:V,children:"Limpiar"})]}),e.jsxs("div",{style:{marginTop:"10px",fontSize:"13px",color:"#1a5d1a",fontWeight:"500"},children:["📅 Período: ",O()]})]}),e.jsxs("div",{style:t.tableContainer,children:[e.jsxs("div",{style:t.tableHeader,children:[e.jsxs("h3",{style:t.tableTitle,children:["Historial de Compras (",p.length," registros)"]}),e.jsxs("button",{style:t.refreshButton,onClick:I,disabled:w,children:[e.jsx(T,{size:16,style:{animation:w?"spin 1s linear infinite":"none"}}),"Actualizar"]})]}),w?e.jsxs("div",{style:t.loadingState,children:[e.jsx(T,{size:40,style:{animation:"spin 1s linear infinite",color:"#1a5d1a"}}),e.jsx("p",{children:"Cargando datos..."})]}):p.length===0?e.jsxs("div",{style:t.emptyState,children:[e.jsx($,{size:48,style:{color:"#ccc"}}),e.jsx("p",{children:"No hay datos para mostrar"})]}):e.jsxs("table",{style:t.table,children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{style:t.th,children:"ID Orden"}),e.jsx("th",{style:t.th,children:"Proveedor"}),e.jsx("th",{style:t.th,children:"Fecha Emisión"}),e.jsx("th",{style:t.th,children:"Fecha Entrega"}),e.jsx("th",{style:t.th,children:"Total"}),e.jsx("th",{style:{...t.th,textAlign:"center"},children:"Detalle"})]})}),e.jsx("tbody",{children:p.map(o=>e.jsxs("tr",{style:t.tr,children:[e.jsx("td",{style:t.td,children:e.jsx("strong",{children:o.id})}),e.jsx("td",{style:t.td,children:o.proveedor}),e.jsx("td",{style:t.td,children:g(o.fecha_emision)}),e.jsx("td",{style:t.td,children:g(o.fecha_entrega)}),e.jsx("td",{style:t.td,children:e.jsx("strong",{children:x(o.total)})}),e.jsx("td",{style:{...t.td,textAlign:"center"},children:e.jsx("button",{style:t.viewButton,onClick:()=>Y(o),title:"Ver detalle",children:e.jsx(R,{size:16})})})]},o.id))}),e.jsx("tfoot",{children:e.jsxs("tr",{style:t.tfootRow,children:[e.jsx("td",{colSpan:"4",style:{...t.td,textAlign:"right",fontWeight:"600"},children:"Total Filtrado:"}),e.jsx("td",{style:{...t.td,fontWeight:"700",color:"#1a5d1a",fontSize:"16px"},children:x(p.reduce((o,r)=>o+parseFloat(r.total||0),0))}),e.jsx("td",{style:t.td})]})})]})]}),m.length>0&&e.jsxs("div",{style:{...t.tableContainer,borderTop:"4px solid #c62828",marginTop:"25px"},children:[e.jsx("div",{style:t.tableHeader,children:e.jsxs("h3",{style:{...t.tableTitle,color:"#c62828"},children:[e.jsx(_,{size:18,style:{marginRight:"8px"}}),"Devoluciones a Proveedores (",m.length," registros) - Total: ",x(u.totalDevoluciones)]})}),e.jsxs("table",{style:t.table,children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{style:{...t.th,background:"#c62828"},children:"ID"}),e.jsx("th",{style:{...t.th,background:"#c62828"},children:"Fecha"}),e.jsx("th",{style:{...t.th,background:"#c62828"},children:"Proveedor"}),e.jsx("th",{style:{...t.th,background:"#c62828"},children:"Producto"}),e.jsx("th",{style:{...t.th,background:"#c62828",textAlign:"center"},children:"Cantidad"}),e.jsx("th",{style:{...t.th,background:"#c62828"},children:"Motivo"}),e.jsx("th",{style:{...t.th,background:"#c62828"},children:"Observaciones"}),e.jsx("th",{style:{...t.th,background:"#c62828",textAlign:"right"},children:"Total"})]})}),e.jsx("tbody",{children:m.map((o,r)=>e.jsxs("tr",{style:{...t.tr,background:"#fff5f5"},children:[e.jsx("td",{style:t.td,children:e.jsx("strong",{children:o.id_devolucion})}),e.jsx("td",{style:t.td,children:g(o.fecha)}),e.jsx("td",{style:t.td,children:o.proveedor||"Sin proveedor"}),e.jsx("td",{style:t.td,children:o.producto||"-"}),e.jsx("td",{style:{...t.td,textAlign:"center"},children:o.cantidad||0}),e.jsx("td",{style:t.td,children:e.jsx("span",{style:{...t.badge,background:"#ffebee",color:"#c62828"},children:o.motivo||"-"})}),e.jsx("td",{style:t.td,children:o.observaciones||"-"}),e.jsxs("td",{style:{...t.td,textAlign:"right",color:"#c62828",fontWeight:"700"},children:["- ",x(o.total||0)]})]},`dev-${r}`))}),e.jsx("tfoot",{children:e.jsxs("tr",{style:{background:"#ffebee"},children:[e.jsx("td",{colSpan:"7",style:{...t.td,textAlign:"right",fontWeight:"600",color:"#c62828"},children:"Total Devoluciones:"}),e.jsxs("td",{style:{...t.td,fontWeight:"700",color:"#c62828",fontSize:"16px",textAlign:"right"},children:["- ",x(u.totalDevoluciones)]})]})})]})]}),N&&f&&e.jsx("div",{style:t.modalOverlay,onClick:()=>j(!1),children:e.jsxs("div",{style:t.modal,onClick:o=>o.stopPropagation(),children:[e.jsxs("div",{style:t.modalHeader,children:[e.jsxs("h2",{style:t.modalTitle,children:[e.jsx(R,{size:20})," Detalle de Orden"]}),e.jsx("button",{style:t.closeButton,onClick:()=>j(!1),children:e.jsx(Q,{size:20})})]}),e.jsx("div",{style:t.modalBody,children:e.jsxs("div",{style:t.infoCard,children:[e.jsxs("p",{children:[e.jsx("strong",{children:"Orden:"})," ",f.id]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Proveedor:"})," ",f.proveedor]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Fecha Emisión:"})," ",g(f.fecha_emision)]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Fecha Entrega:"})," ",g(f.fecha_entrega)]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Estado:"})," ",q(f.estado)]}),e.jsxs("p",{style:t.totalBig,children:[e.jsx("strong",{children:"Total:"})," ",x(f.total)]})]})}),e.jsx("div",{style:t.modalFooter,children:e.jsx("button",{style:t.modalCancelButton,onClick:()=>j(!1),children:"Cerrar"})})]})}),e.jsx("style",{children:"@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }"})]})}const t={container:{padding:"20px",maxWidth:"1400px",margin:"0 auto"},header:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"25px",flexWrap:"wrap",gap:"15px"},title:{margin:0,fontSize:"28px",fontWeight:"700",color:"#1a5d1a",display:"flex",alignItems:"center"},subtitle:{margin:"8px 0 0 0",color:"#6c757d",fontSize:"14px"},exportButton:{display:"flex",alignItems:"center",gap:"8px",padding:"12px 20px",background:"linear-gradient(135deg, #1a5d1a, #2e8b57)",color:"white",border:"none",borderRadius:"10px",fontSize:"14px",fontWeight:"600",cursor:"pointer",boxShadow:"0 4px 12px rgba(26, 93, 26, 0.3)"},statsGrid:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))",gap:"20px",marginBottom:"25px"},statCard:{display:"flex",alignItems:"center",gap:"20px",padding:"25px",background:"white",borderRadius:"16px",boxShadow:"0 2px 12px rgba(0,0,0,0.05)"},statValue:{display:"block",fontSize:"28px",fontWeight:"700",color:"#1a5d1a"},statLabel:{fontSize:"14px",color:"#6c757d"},filtersCard:{background:"white",borderRadius:"16px",padding:"20px",marginBottom:"25px",boxShadow:"0 2px 12px rgba(0,0,0,0.05)"},filtersTitle:{display:"flex",alignItems:"center",gap:"8px",margin:"0 0 15px 0",fontSize:"16px",fontWeight:"600",color:"#333"},filtersRow:{display:"flex",gap:"15px",flexWrap:"wrap",alignItems:"flex-end"},periodButtons:{display:"flex",gap:"5px",marginRight:"20px"},periodButton:{padding:"8px 16px",border:"2px solid #e9ecef",borderRadius:"8px",background:"white",cursor:"pointer",fontSize:"13px",fontWeight:"500",color:"#6c757d",transition:"all 0.2s"},periodButtonActive:{background:"#1a5d1a",color:"white",borderColor:"#1a5d1a"},filterGroup:{display:"flex",flexDirection:"column",gap:"5px"},filterLabel:{fontSize:"13px",fontWeight:"500",color:"#6c757d"},input:{padding:"10px 15px",border:"2px solid #e9ecef",borderRadius:"10px",fontSize:"14px",outline:"none"},select:{padding:"10px 15px",border:"2px solid #e9ecef",borderRadius:"10px",fontSize:"14px",outline:"none",background:"white",minWidth:"150px"},clearButton:{padding:"10px 20px",background:"#f8f9fa",border:"1px solid #e9ecef",borderRadius:"10px",fontSize:"14px",cursor:"pointer",color:"#6c757d"},tableContainer:{background:"white",borderRadius:"16px",boxShadow:"0 2px 12px rgba(0,0,0,0.05)",overflow:"hidden"},tableHeader:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px",borderBottom:"1px solid #e9ecef"},tableTitle:{margin:0,fontSize:"16px",fontWeight:"600",color:"#333"},refreshButton:{display:"flex",alignItems:"center",gap:"8px",padding:"10px 16px",background:"white",border:"1px solid #e9ecef",borderRadius:"10px",fontSize:"14px",color:"#495057",cursor:"pointer"},table:{width:"100%",borderCollapse:"collapse"},th:{padding:"15px 20px",textAlign:"left",background:"#f8f9fa",color:"#1a5d1a",fontWeight:"600",fontSize:"14px",borderBottom:"2px solid #e9ecef"},tr:{borderBottom:"1px solid #e9ecef"},td:{padding:"15px 20px",fontSize:"14px",color:"#495057"},tfootRow:{background:"#f8f9fa"},badge:{display:"inline-block",padding:"5px 12px",borderRadius:"20px",fontSize:"12px",fontWeight:"500"},viewButton:{padding:"8px",background:"#e3f2fd",border:"none",borderRadius:"8px",cursor:"pointer",color:"#1976d2"},loadingState:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"60px 20px",color:"#6c757d",gap:"15px"},emptyState:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"60px 20px",color:"#6c757d",gap:"15px"},modalOverlay:{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0, 0, 0, 0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1e3,padding:"20px"},modal:{background:"white",borderRadius:"16px",width:"100%",maxWidth:"500px",boxShadow:"0 20px 60px rgba(0, 0, 0, 0.3)",overflow:"hidden"},modalHeader:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 25px",borderBottom:"1px solid #e9ecef",background:"linear-gradient(135deg, #f8f9fa, #e8f5e9)"},modalTitle:{margin:0,fontSize:"20px",fontWeight:"600",color:"#1a5d1a",display:"flex",alignItems:"center",gap:"10px"},closeButton:{background:"none",border:"none",cursor:"pointer",color:"#6c757d",padding:"5px",borderRadius:"5px"},modalBody:{padding:"25px"},infoCard:{padding:"20px",background:"#f8f9fa",borderRadius:"12px"},totalBig:{marginTop:"15px",fontSize:"18px",color:"#1a5d1a"},modalFooter:{display:"flex",justifyContent:"flex-end",gap:"12px",padding:"20px 25px",borderTop:"1px solid #e9ecef",background:"#f8f9fa"},modalCancelButton:{padding:"10px 20px",background:"white",border:"1px solid #e9ecef",borderRadius:"8px",fontSize:"14px",cursor:"pointer",color:"#6c757d"}};export{ce as default};
