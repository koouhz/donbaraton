import{c as A,r as l,s as u,j as t,P as y,m as P}from"./index-hR7h3xft.js";import{n as c,F as _,L as v}from"./index-BTmhdvE4.js";import{R as $}from"./refresh-cw-SHhOlYLT.js";import{F as I}from"./file-down-DifeVD_N.js";import{A as B}from"./archive-h_kyx3SE.js";import{D}from"./dollar-sign-DePuN86F.js";import{T as F}from"./triangle-alert-B_IWcPwx.js";const L=[["path",{d:"M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z",key:"zw3jo"}],["path",{d:"M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12",key:"1wduqc"}],["path",{d:"M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17",key:"kqbvx6"}]],j=A("layers",L);function H(){const[p,k]=l.useState([]),[i,S]=l.useState([]),[x,f]=l.useState(!0),[m,g]=l.useState(!1),[a,z]=l.useState({totalCategorias:0,totalProductos:0,stockTotal:0,valorTotal:0});l.useEffect(()=>{b()},[]);const b=async()=>{f(!0);try{const{data:o,error:s}=await u.rpc("fn_reporte_inventario_valorado");s?(console.error("Error:",s),c.error("Error al cargar inventario valorado")):(k(o||[]),C(o||[]));const r=await u.rpc("fn_alerta_stock_critico");r.error||S(r.data||[])}catch(o){console.error("Error:",o),c.error("Error al cargar datos")}finally{f(!1)}},C=o=>{const s=o.reduce((n,d)=>n+parseInt(d.cantidad_productos||0),0),r=o.reduce((n,d)=>n+parseInt(d.stock_total||0),0),w=o.reduce((n,d)=>n+parseFloat(d.valor_venta_potencial||0),0);z({totalCategorias:o.length,totalProductos:s,stockTotal:r,valorTotal:w})},T=async()=>{g(!0);try{const o=`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Reporte de Inventario - Don Baraton</title>
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
            .critico { background: #ffebee !important; color: #c62828; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; font-size: 11px; color: #666; text-align: center; }
            .section { margin-top: 30px; }
            .section h3 { margin-bottom: 15px; color: #1a5d1a; }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${P}" class="logo" alt="Logo">
            <div class="empresa">
              <h1>Don Baraton</h1>
              <p>Supermercado - Sistema de Gestión</p>
            </div>
          </div>
          
          <div class="titulo-reporte">
            <h2>Reporte de Inventario Valorado</h2>
            <p>Generado: ${new Date().toLocaleDateString("es-BO")} ${new Date().toLocaleTimeString("es-BO")}</p>
          </div>

          <div class="stats">
            <div class="stat">
              <div class="stat-value">${a.totalCategorias}</div>
              <div class="stat-label">Categorías</div>
            </div>
            <div class="stat">
              <div class="stat-value">${a.totalProductos}</div>
              <div class="stat-label">Productos</div>
            </div>
            <div class="stat">
              <div class="stat-value">${a.stockTotal}</div>
              <div class="stat-label">Unidades en Stock</div>
            </div>
            <div class="stat">
              <div class="stat-value">Bs ${a.valorTotal.toFixed(2)}</div>
              <div class="stat-label">Valor Total Inventario</div>
            </div>
          </div>

          <h3 style="margin-bottom: 10px;">Inventario por Categoría</h3>
          <table>
            <thead>
              <tr>
                <th>Categoría</th>
                <th style="text-align:center">Productos</th>
                <th style="text-align:center">Stock Total</th>
                <th style="text-align:right">Valor Potencial (Bs)</th>
              </tr>
            </thead>
            <tbody>
              ${p.map(r=>`
                <tr>
                  <td><strong>${r.categoria||"Sin categoría"}</strong></td>
                  <td style="text-align:center">${r.cantidad_productos||0}</td>
                  <td style="text-align:center">${r.stock_total||0}</td>
                  <td style="text-align:right">Bs ${parseFloat(r.valor_venta_potencial||0).toFixed(2)}</td>
                </tr>
              `).join("")}
            </tbody>
            <tfoot>
              <tr style="background: #e8f5e9; font-weight: bold;">
                <td>TOTAL</td>
                <td style="text-align:center">${a.totalProductos}</td>
                <td style="text-align:center">${a.stockTotal}</td>
                <td style="text-align:right">Bs ${a.valorTotal.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          ${i.length>0?`
          <div class="section">
            <h3 style="color: #c62828;">Productos con Stock Crítico (${i.length})</h3>
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th style="text-align:center">Stock Actual</th>
                  <th style="text-align:center">Stock Mínimo</th>
                </tr>
              </thead>
              <tbody>
                ${i.slice(0,20).map(r=>`
                  <tr class="critico">
                    <td><strong>${r.producto||r.nombre||"Sin nombre"}</strong></td>
                    <td style="text-align:center"><strong>${r.stock_actual||0}</strong></td>
                    <td style="text-align:center">${r.stock_minimo||0}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
          `:""}

          <div class="footer">
            <p>Don Baraton - Sistema de Gestión de Supermercado</p>
            <p>Reporte generado automáticamente el ${new Date().toLocaleDateString("es-BO")}</p>
          </div>
        </body>
        </html>
      `,s=window.open("","_blank");if(!s){c.error("Por favor permite las ventanas emergentes para generar el PDF"),g(!1);return}s.document.write(o),s.document.close(),setTimeout(()=>{s.print(),c.success("PDF listo para guardar")},500)}catch(o){console.error("Error:",o),c.error("Error al generar PDF")}finally{g(!1)}},h=o=>`Bs ${parseFloat(o||0).toFixed(2)}`;return t.jsxs("div",{style:e.container,children:[t.jsx(_,{position:"top-right"}),t.jsxs("header",{style:e.header,children:[t.jsxs("div",{children:[t.jsxs("h1",{style:e.title,children:[t.jsx(y,{size:28,style:{marginRight:"12px"}}),"Reporte de Inventario"]}),t.jsx("p",{style:e.subtitle,children:"Inventario valorado por categoría y stock crítico"})]}),t.jsxs("div",{style:{display:"flex",gap:"10px"},children:[t.jsxs("button",{style:e.refreshButton,onClick:b,disabled:x,children:[t.jsx($,{size:18,style:{animation:x?"spin 1s linear infinite":"none"}}),"Actualizar"]}),t.jsx("button",{style:e.exportButton,onClick:T,disabled:m||p.length===0,children:m?t.jsxs(t.Fragment,{children:[t.jsx(v,{size:18,style:{animation:"spin 1s linear infinite"}})," Generando..."]}):t.jsxs(t.Fragment,{children:[t.jsx(I,{size:18})," Exportar PDF"]})})]})]}),t.jsxs("div",{style:e.statsGrid,children:[t.jsxs("div",{style:{...e.statCard,borderTop:"4px solid #1a5d1a"},children:[t.jsx(j,{size:32,style:{color:"#1a5d1a"}}),t.jsxs("div",{children:[t.jsx("span",{style:e.statValue,children:a.totalCategorias}),t.jsx("span",{style:e.statLabel,children:"Categorías"})]})]}),t.jsxs("div",{style:{...e.statCard,borderTop:"4px solid #1565c0"},children:[t.jsx(y,{size:32,style:{color:"#1565c0"}}),t.jsxs("div",{children:[t.jsx("span",{style:{...e.statValue,color:"#1565c0"},children:a.totalProductos}),t.jsx("span",{style:e.statLabel,children:"Productos Activos"})]})]}),t.jsxs("div",{style:{...e.statCard,borderTop:"4px solid #e65100"},children:[t.jsx(B,{size:32,style:{color:"#e65100"}}),t.jsxs("div",{children:[t.jsx("span",{style:{...e.statValue,color:"#e65100"},children:a.stockTotal}),t.jsx("span",{style:e.statLabel,children:"Unidades en Stock"})]})]}),t.jsxs("div",{style:{...e.statCard,borderTop:"4px solid #2e7d32"},children:[t.jsx(D,{size:32,style:{color:"#2e7d32"}}),t.jsxs("div",{children:[t.jsx("span",{style:{...e.statValue,color:"#2e7d32"},children:h(a.valorTotal)}),t.jsx("span",{style:e.statLabel,children:"Valor Total Inventario"})]})]})]}),t.jsxs("div",{style:e.tableContainer,children:[t.jsx("div",{style:e.tableHeader,children:t.jsxs("h3",{style:e.tableTitle,children:[t.jsx(j,{size:18,style:{marginRight:"8px"}}),"Inventario por Categoría"]})}),x?t.jsxs("div",{style:e.loadingState,children:[t.jsx(v,{size:40,style:{animation:"spin 1s linear infinite",color:"#1a5d1a"}}),t.jsx("p",{children:"Cargando inventario..."})]}):p.length===0?t.jsxs("div",{style:e.emptyState,children:[t.jsx(y,{size:48,style:{color:"#ccc"}}),t.jsx("p",{children:"No hay datos de inventario"})]}):t.jsxs("table",{style:e.table,children:[t.jsx("thead",{children:t.jsxs("tr",{children:[t.jsx("th",{style:e.th,children:"Categoría"}),t.jsx("th",{style:{...e.th,textAlign:"center"},children:"Productos"}),t.jsx("th",{style:{...e.th,textAlign:"center"},children:"Stock Total"}),t.jsx("th",{style:{...e.th,textAlign:"right"},children:"Valor Potencial"})]})}),t.jsx("tbody",{children:p.map((o,s)=>t.jsxs("tr",{style:e.tr,children:[t.jsx("td",{style:e.td,children:t.jsx("strong",{children:o.categoria||"Sin categoría"})}),t.jsx("td",{style:{...e.td,textAlign:"center"},children:o.cantidad_productos||0}),t.jsx("td",{style:{...e.td,textAlign:"center"},children:o.stock_total||0}),t.jsx("td",{style:{...e.td,textAlign:"right",fontWeight:"600",color:"#2e7d32"},children:h(o.valor_venta_potencial)})]},`cat-${s}`))}),t.jsx("tfoot",{children:t.jsxs("tr",{style:e.tfootRow,children:[t.jsx("td",{style:{...e.td,fontWeight:"700"},children:"TOTAL"}),t.jsx("td",{style:{...e.td,textAlign:"center",fontWeight:"600"},children:a.totalProductos}),t.jsx("td",{style:{...e.td,textAlign:"center",fontWeight:"600"},children:a.stockTotal}),t.jsx("td",{style:{...e.td,textAlign:"right",fontWeight:"700",color:"#2e7d32",fontSize:"16px"},children:h(a.valorTotal)})]})})]})]}),i.length>0&&t.jsxs("div",{style:{...e.tableContainer,borderTop:"4px solid #c62828"},children:[t.jsx("div",{style:e.tableHeader,children:t.jsxs("h3",{style:{...e.tableTitle,color:"#c62828"},children:[t.jsx(F,{size:18,style:{marginRight:"8px"}}),"Productos con Stock Crítico (",i.length,")"]})}),t.jsxs("table",{style:e.table,children:[t.jsx("thead",{children:t.jsxs("tr",{children:[t.jsx("th",{style:{...e.th,background:"#c62828"},children:"Producto"}),t.jsx("th",{style:{...e.th,background:"#c62828",textAlign:"center"},children:"Stock Actual"}),t.jsx("th",{style:{...e.th,background:"#c62828",textAlign:"center"},children:"Stock Mínimo"})]})}),t.jsx("tbody",{children:i.map((o,s)=>t.jsxs("tr",{style:{...e.tr,background:"#ffebee"},children:[t.jsx("td",{style:e.td,children:t.jsx("strong",{children:o.producto||o.nombre||"Sin nombre"})}),t.jsx("td",{style:{...e.td,textAlign:"center",color:"#c62828",fontWeight:"700"},children:o.stock_actual||0}),t.jsx("td",{style:{...e.td,textAlign:"center"},children:o.stock_minimo||0})]},`critico-${s}`))})]})]}),t.jsx("style",{children:"@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }"})]})}const e={container:{padding:"20px",maxWidth:"1400px",margin:"0 auto"},header:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"25px",flexWrap:"wrap",gap:"15px"},title:{margin:0,fontSize:"28px",fontWeight:"700",color:"#1a5d1a",display:"flex",alignItems:"center"},subtitle:{margin:"8px 0 0 0",color:"#6c757d",fontSize:"14px"},exportButton:{display:"flex",alignItems:"center",gap:"8px",padding:"12px 20px",background:"linear-gradient(135deg, #1a5d1a, #2e8b57)",color:"white",border:"none",borderRadius:"10px",fontSize:"14px",fontWeight:"600",cursor:"pointer",boxShadow:"0 4px 12px rgba(26, 93, 26, 0.3)"},refreshButton:{display:"flex",alignItems:"center",gap:"8px",padding:"12px 20px",background:"white",border:"2px solid #e9ecef",borderRadius:"10px",fontSize:"14px",fontWeight:"600",cursor:"pointer",color:"#495057"},statsGrid:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))",gap:"20px",marginBottom:"25px"},statCard:{display:"flex",alignItems:"center",gap:"20px",padding:"25px",background:"white",borderRadius:"16px",boxShadow:"0 2px 12px rgba(0,0,0,0.05)"},statValue:{display:"block",fontSize:"26px",fontWeight:"700",color:"#1a5d1a"},statLabel:{fontSize:"13px",color:"#6c757d"},tableContainer:{background:"white",borderRadius:"16px",boxShadow:"0 2px 12px rgba(0,0,0,0.05)",overflow:"hidden",marginBottom:"25px"},tableHeader:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px",borderBottom:"1px solid #e9ecef"},tableTitle:{margin:0,fontSize:"16px",fontWeight:"600",color:"#333",display:"flex",alignItems:"center"},table:{width:"100%",borderCollapse:"collapse"},th:{padding:"15px 15px",textAlign:"left",background:"#f8f9fa",color:"#1a5d1a",fontWeight:"600",fontSize:"13px",borderBottom:"2px solid #e9ecef"},tr:{borderBottom:"1px solid #e9ecef"},td:{padding:"12px 15px",fontSize:"13px",color:"#495057"},tfootRow:{background:"#e8f5e9"},loadingState:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"60px 20px",color:"#6c757d",gap:"15px"},emptyState:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"60px 20px",color:"#6c757d",gap:"15px"}};export{H as default};
