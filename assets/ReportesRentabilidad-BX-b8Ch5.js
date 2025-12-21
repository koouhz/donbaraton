import{r as d,s as A,j as t,P as C,q as P,b as _,m as R}from"./index-hR7h3xft.js";import{n as g,F as $,L as b}from"./index-BTmhdvE4.js";import{T as S}from"./trending-up-BgkhDZTu.js";import{F as L}from"./file-down-DifeVD_N.js";import{D as O}from"./dollar-sign-DePuN86F.js";import{a as W,A as E}from"./arrow-up-DAII4d5u.js";function Y(){const[F,w]=d.useState([]),[f,m]=d.useState(!0),[j,u]=d.useState(!1),[c,z]=d.useState(!1),[r,h]=d.useState({periodo:"mes",fechaInicio:(()=>{const a=new Date;return a.setDate(1),a.toISOString().split("T")[0]})(),fechaFin:new Date().toISOString().split("T")[0]}),[s,T]=d.useState({totalProductos:0,gananciaTotal:0,unidadesVendidas:0});d.useEffect(()=>{y()},[]),d.useEffect(()=>{r.fechaInicio&&r.fechaFin&&y()},[r.fechaInicio,r.fechaFin]);const y=async()=>{m(!0);try{const{data:a,error:i}=await A.rpc("fn_reporte_rentabilidad_producto",{p_fecha_inicio:r.fechaInicio,p_fecha_fin:r.fechaFin});i?(console.error("Error:",i),g.error("Error al cargar datos de rentabilidad")):(w(a||[]),D(a||[]))}catch(a){console.error("Error:",a),g.error("Error al cargar datos")}finally{m(!1)}},D=a=>{const i=a.reduce((o,l)=>o+parseFloat(l.ganancia_total||0),0),n=a.reduce((o,l)=>o+parseInt(l.cantidad_vendida||0),0);T({totalProductos:a.length,gananciaTotal:i,unidadesVendidas:n})},B=a=>{const i=new Date;let n,o;switch(a){case"hoy":n=o=i.toISOString().split("T")[0];break;case"semana":const l=new Date(i);l.setDate(i.getDate()-i.getDay()),n=l.toISOString().split("T")[0],o=i.toISOString().split("T")[0];break;case"mes":n=new Date(i.getFullYear(),i.getMonth(),1).toISOString().split("T")[0],o=i.toISOString().split("T")[0];break;default:return}h({...r,periodo:a,fechaInicio:n,fechaFin:o})},v=()=>{const a={day:"2-digit",month:"long",year:"numeric"},i=new Date(r.fechaInicio+"T00:00:00").toLocaleDateString("es-BO",a),n=new Date(r.fechaFin+"T00:00:00").toLocaleDateString("es-BO",a);return r.fechaInicio===r.fechaFin?i:`${i} - ${n}`},p=[...F].sort((a,i)=>c?parseFloat(a.ganancia_total)-parseFloat(i.ganancia_total):parseFloat(i.ganancia_total)-parseFloat(a.ganancia_total)),k=()=>{const a=new Date,i=new Date(a.getFullYear(),a.getMonth(),1);h({periodo:"mes",fechaInicio:i.toISOString().split("T")[0],fechaFin:a.toISOString().split("T")[0]})},I=async()=>{u(!0);try{const a=v(),i=`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Reporte de Rentabilidad - Don Baraton</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; background: #fff; color: #333; }
            .header { display: flex; align-items: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #1a5d1a; }
            .logo { width: 80px; height: 80px; margin-right: 20px; border-radius: 10px; }
            .empresa h1 { color: #1a5d1a; font-size: 28px; margin-bottom: 5px; }
            .empresa p { color: #666; font-size: 14px; }
            .titulo-reporte { background: linear-gradient(135deg, #1a5d1a, #2e8b57); color: white; padding: 15px 25px; border-radius: 10px; margin-bottom: 25px; }
            .titulo-reporte h2 { font-size: 20px; margin-bottom: 5px; }
            .titulo-reporte p { font-size: 12px; opacity: 0.9; }
            .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 25px; }
            .stat { background: #f8f9fa; padding: 15px; border-radius: 10px; text-align: center; border-left: 4px solid #1a5d1a; }
            .stat-value { font-size: 20px; font-weight: bold; color: #1a5d1a; }
            .stat-label { font-size: 11px; color: #666; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #1a5d1a; color: white; padding: 12px 10px; text-align: left; font-size: 12px; }
            td { padding: 10px; border-bottom: 1px solid #e9ecef; font-size: 11px; }
            tr:nth-child(even) { background: #f8f9fa; }
            .positivo { color: #2e7d32; font-weight: bold; }
            .negativo { color: #c62828; font-weight: bold; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; font-size: 11px; color: #666; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${R}" class="logo" alt="Logo">
            <div class="empresa">
              <h1>Don Baraton</h1>
              <p>Supermercado - Sistema de Gestión</p>
            </div>
          </div>
          
          <div class="titulo-reporte">
            <h2>Reporte de Rentabilidad por Producto</h2>
            <p>Período: ${a} | Generado: ${new Date().toLocaleDateString("es-BO")} ${new Date().toLocaleTimeString("es-BO")}</p>
          </div>

          <div class="stats">
            <div class="stat">
              <div class="stat-value">${s.totalProductos}</div>
              <div class="stat-label">Productos Analizados</div>
            </div>
            <div class="stat">
              <div class="stat-value">${s.unidadesVendidas}</div>
              <div class="stat-label">Unidades Vendidas</div>
            </div>
            <div class="stat">
              <div class="stat-value" style="color:#2e7d32">Bs ${s.gananciaTotal.toFixed(2)}</div>
              <div class="stat-label">Ganancia Total</div>
            </div>
          </div>

          <h3 style="margin-bottom: 10px;">Detalle de Rentabilidad por Producto</h3>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Producto</th>
                <th style="text-align:right">Costo</th>
                <th style="text-align:right">Venta</th>
                <th style="text-align:right">Margen</th>
                <th style="text-align:center">Vendidos</th>
                <th style="text-align:right">Ganancia Total</th>
              </tr>
            </thead>
            <tbody>
              ${p.map((o,l)=>`
                <tr>
                  <td>${l+1}</td>
                  <td>${o.producto||"Sin nombre"}</td>
                  <td style="text-align:right">Bs ${parseFloat(o.precio_costo||0).toFixed(2)}</td>
                  <td style="text-align:right">Bs ${parseFloat(o.precio_venta||0).toFixed(2)}</td>
                  <td style="text-align:right" class="${parseFloat(o.margen_unitario)>=0?"positivo":"negativo"}">Bs ${parseFloat(o.margen_unitario||0).toFixed(2)}</td>
                  <td style="text-align:center">${o.cantidad_vendida||0}</td>
                  <td style="text-align:right" class="${parseFloat(o.ganancia_total)>=0?"positivo":"negativo"}">Bs ${parseFloat(o.ganancia_total||0).toFixed(2)}</td>
                </tr>
              `).join("")}
            </tbody>
            <tfoot>
              <tr style="background: #e8f5e9; font-weight: bold;">
                <td colspan="5" style="text-align: right;">TOTAL GANANCIA:</td>
                <td style="text-align:center">${s.unidadesVendidas}</td>
                <td style="text-align:right" class="positivo">Bs ${s.gananciaTotal.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          <div class="footer">
            <p>Don Baraton - Sistema de Gestión de Supermercado</p>
            <p>Reporte generado automáticamente el ${new Date().toLocaleDateString("es-BO")}</p>
          </div>
        </body>
        </html>
      `,n=window.open("","_blank");if(!n){g.error("Por favor permite las ventanas emergentes para generar el PDF"),u(!1);return}n.document.write(i),n.document.close(),setTimeout(()=>{n.print(),g.success("PDF listo para guardar")},500)}catch(a){console.error("Error:",a),g.error("Error al generar PDF")}finally{u(!1)}},x=a=>`Bs ${parseFloat(a||0).toFixed(2)}`;return t.jsxs("div",{style:e.container,children:[t.jsx($,{position:"top-right"}),t.jsxs("header",{style:e.header,children:[t.jsxs("div",{children:[t.jsxs("h1",{style:e.title,children:[t.jsx(S,{size:28,style:{marginRight:"12px"}}),"Reporte de Rentabilidad"]}),t.jsxs("p",{style:e.subtitle,children:["Análisis de margen de ganancia por producto • ",p.length," productos"]})]}),t.jsx("button",{style:e.exportButton,onClick:I,disabled:j||p.length===0,children:j?t.jsxs(t.Fragment,{children:[t.jsx(b,{size:18,style:{animation:"spin 1s linear infinite"}})," Generando..."]}):t.jsxs(t.Fragment,{children:[t.jsx(L,{size:18})," Exportar PDF"]})})]}),t.jsxs("div",{style:e.statsGrid,children:[t.jsxs("div",{style:{...e.statCard,borderTop:"4px solid #1a5d1a"},children:[t.jsx(C,{size:32,style:{color:"#1a5d1a"}}),t.jsxs("div",{children:[t.jsx("span",{style:e.statValue,children:s.totalProductos}),t.jsx("span",{style:e.statLabel,children:"Productos Analizados"})]})]}),t.jsxs("div",{style:{...e.statCard,borderTop:"4px solid #1565c0"},children:[t.jsx(P,{size:32,style:{color:"#1565c0"}}),t.jsxs("div",{children:[t.jsx("span",{style:{...e.statValue,color:"#1565c0"},children:s.unidadesVendidas}),t.jsx("span",{style:e.statLabel,children:"Unidades Vendidas"})]})]}),t.jsxs("div",{style:{...e.statCard,borderTop:"4px solid #2e7d32"},children:[t.jsx(O,{size:32,style:{color:"#2e7d32"}}),t.jsxs("div",{children:[t.jsx("span",{style:{...e.statValue,color:"#2e7d32"},children:x(s.gananciaTotal)}),t.jsx("span",{style:e.statLabel,children:"Ganancia Total"})]})]})]}),t.jsxs("div",{style:e.filtersCard,children:[t.jsxs("h3",{style:e.filtersTitle,children:[t.jsx(_,{size:18})," Filtros de Período"]}),t.jsxs("div",{style:e.filtersRow,children:[t.jsx("div",{style:e.periodButtons,children:[{key:"hoy",label:"Hoy"},{key:"semana",label:"Esta Semana"},{key:"mes",label:"Este Mes"}].map(a=>t.jsx("button",{style:{...e.periodButton,...r.periodo===a.key?e.periodButtonActive:{}},onClick:()=>B(a.key),children:a.label},a.key))}),t.jsxs("div",{style:e.filterGroup,children:[t.jsx("label",{style:e.filterLabel,children:"Desde:"}),t.jsx("input",{type:"date",value:r.fechaInicio,onChange:a=>h({...r,periodo:"personalizado",fechaInicio:a.target.value}),style:e.input})]}),t.jsxs("div",{style:e.filterGroup,children:[t.jsx("label",{style:e.filterLabel,children:"Hasta:"}),t.jsx("input",{type:"date",value:r.fechaFin,onChange:a=>h({...r,periodo:"personalizado",fechaFin:a.target.value}),style:e.input})]}),t.jsxs("button",{style:{...e.periodButton,background:c?"#fff3e0":"#e8f5e9",color:c?"#e65100":"#2e7d32"},onClick:()=>z(!c),children:[c?t.jsx(W,{size:14}):t.jsx(E,{size:14}),c?"Menor ganancia":"Mayor ganancia"]}),t.jsx("button",{style:e.clearButton,onClick:k,children:"Limpiar"})]}),t.jsxs("div",{style:{marginTop:"10px",fontSize:"13px",color:"#1a5d1a",fontWeight:"500"},children:["📅 Período: ",v()]})]}),t.jsxs("div",{style:e.tableContainer,children:[t.jsxs("div",{style:e.tableHeader,children:[t.jsxs("h3",{style:e.tableTitle,children:["Rentabilidad por Producto (",p.length," productos)"]}),t.jsxs("button",{style:e.refreshButton,onClick:y,disabled:f,children:[t.jsx(b,{size:16,style:{animation:f?"spin 1s linear infinite":"none"}}),"Actualizar"]})]}),f?t.jsxs("div",{style:e.loadingState,children:[t.jsx(b,{size:40,style:{animation:"spin 1s linear infinite",color:"#1a5d1a"}}),t.jsx("p",{children:"Cargando datos..."})]}):p.length===0?t.jsxs("div",{style:e.emptyState,children:[t.jsx(S,{size:48,style:{color:"#ccc"}}),t.jsx("p",{children:"No hay datos de rentabilidad para mostrar"})]}):t.jsxs("table",{style:e.table,children:[t.jsx("thead",{children:t.jsxs("tr",{children:[t.jsx("th",{style:e.th,children:"#"}),t.jsx("th",{style:e.th,children:"Producto"}),t.jsx("th",{style:{...e.th,textAlign:"right"},children:"Precio Costo"}),t.jsx("th",{style:{...e.th,textAlign:"right"},children:"Precio Venta"}),t.jsx("th",{style:{...e.th,textAlign:"right"},children:"Margen Unitario"}),t.jsx("th",{style:{...e.th,textAlign:"center"},children:"Vendidos"}),t.jsx("th",{style:{...e.th,textAlign:"right"},children:"Ganancia Total"})]})}),t.jsx("tbody",{children:p.map((a,i)=>t.jsxs("tr",{style:e.tr,children:[t.jsx("td",{style:e.td,children:i+1}),t.jsx("td",{style:e.td,children:t.jsx("strong",{children:a.producto||"Sin nombre"})}),t.jsx("td",{style:{...e.td,textAlign:"right"},children:x(a.precio_costo)}),t.jsx("td",{style:{...e.td,textAlign:"right"},children:x(a.precio_venta)}),t.jsx("td",{style:{...e.td,textAlign:"right",color:parseFloat(a.margen_unitario)>=0?"#2e7d32":"#c62828",fontWeight:"600"},children:x(a.margen_unitario)}),t.jsx("td",{style:{...e.td,textAlign:"center"},children:a.cantidad_vendida||0}),t.jsx("td",{style:{...e.td,textAlign:"right",color:parseFloat(a.ganancia_total)>=0?"#2e7d32":"#c62828",fontWeight:"700"},children:x(a.ganancia_total)})]},`prod-${i}`))}),t.jsx("tfoot",{children:t.jsxs("tr",{style:e.tfootRow,children:[t.jsx("td",{colSpan:"5",style:{...e.td,textAlign:"right",fontWeight:"600"},children:"TOTAL:"}),t.jsx("td",{style:{...e.td,textAlign:"center",fontWeight:"600"},children:s.unidadesVendidas}),t.jsx("td",{style:{...e.td,textAlign:"right",fontWeight:"700",color:"#2e7d32",fontSize:"16px"},children:x(s.gananciaTotal)})]})})]})]}),t.jsx("style",{children:"@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }"})]})}const e={container:{padding:"20px",maxWidth:"1400px",margin:"0 auto"},header:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"25px",flexWrap:"wrap",gap:"15px"},title:{margin:0,fontSize:"28px",fontWeight:"700",color:"#1a5d1a",display:"flex",alignItems:"center"},subtitle:{margin:"8px 0 0 0",color:"#6c757d",fontSize:"14px"},exportButton:{display:"flex",alignItems:"center",gap:"8px",padding:"12px 20px",background:"linear-gradient(135deg, #1a5d1a, #2e8b57)",color:"white",border:"none",borderRadius:"10px",fontSize:"14px",fontWeight:"600",cursor:"pointer",boxShadow:"0 4px 12px rgba(26, 93, 26, 0.3)"},statsGrid:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))",gap:"20px",marginBottom:"25px"},statCard:{display:"flex",alignItems:"center",gap:"20px",padding:"25px",background:"white",borderRadius:"16px",boxShadow:"0 2px 12px rgba(0,0,0,0.05)"},statValue:{display:"block",fontSize:"26px",fontWeight:"700",color:"#1a5d1a"},statLabel:{fontSize:"13px",color:"#6c757d"},filtersCard:{background:"white",borderRadius:"16px",padding:"20px",marginBottom:"25px",boxShadow:"0 2px 12px rgba(0,0,0,0.05)"},filtersTitle:{display:"flex",alignItems:"center",gap:"8px",margin:"0 0 15px 0",fontSize:"16px",fontWeight:"600",color:"#333"},filtersRow:{display:"flex",gap:"15px",flexWrap:"wrap",alignItems:"flex-end"},periodButtons:{display:"flex",gap:"5px",marginRight:"20px"},periodButton:{padding:"8px 16px",border:"2px solid #e9ecef",borderRadius:"8px",background:"white",cursor:"pointer",fontSize:"13px",fontWeight:"500",color:"#6c757d",transition:"all 0.2s",display:"flex",alignItems:"center",gap:"5px"},periodButtonActive:{background:"#1a5d1a",color:"white",borderColor:"#1a5d1a"},filterGroup:{display:"flex",flexDirection:"column",gap:"5px"},filterLabel:{fontSize:"13px",fontWeight:"500",color:"#6c757d"},input:{padding:"10px 15px",border:"2px solid #e9ecef",borderRadius:"10px",fontSize:"14px",outline:"none"},clearButton:{padding:"10px 20px",background:"#f8f9fa",border:"1px solid #e9ecef",borderRadius:"10px",fontSize:"14px",cursor:"pointer",color:"#6c757d"},tableContainer:{background:"white",borderRadius:"16px",boxShadow:"0 2px 12px rgba(0,0,0,0.05)",overflow:"hidden",marginBottom:"25px"},tableHeader:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px",borderBottom:"1px solid #e9ecef"},tableTitle:{margin:0,fontSize:"16px",fontWeight:"600",color:"#333"},refreshButton:{display:"flex",alignItems:"center",gap:"8px",padding:"10px 16px",background:"white",border:"1px solid #e9ecef",borderRadius:"10px",fontSize:"14px",color:"#495057",cursor:"pointer"},table:{width:"100%",borderCollapse:"collapse"},th:{padding:"15px 15px",textAlign:"left",background:"#f8f9fa",color:"#1a5d1a",fontWeight:"600",fontSize:"13px",borderBottom:"2px solid #e9ecef"},tr:{borderBottom:"1px solid #e9ecef"},td:{padding:"12px 15px",fontSize:"13px",color:"#495057"},tfootRow:{background:"#e8f5e9"},loadingState:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"60px 20px",color:"#6c757d",gap:"15px"},emptyState:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"60px 20px",color:"#6c757d",gap:"15px"}};export{Y as default};
