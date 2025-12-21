import{c as L,r as l,s as T,j as e,P as I,p as R}from"./index-DyRGlXyn.js";import{n as f,F as V,L as F}from"./index-Bk6qzOxF.js";import{S as A}from"./scale-DDJZ_LfE.js";import{R as W}from"./refresh-cw-VSjeutiz.js";import{F as G}from"./file-down-B7taR7BA.js";import{T as _}from"./trending-up-CNeeSLoG.js";import{D as O}from"./dollar-sign-BJpoOmkd.js";import{W as E}from"./wallet-CwCQ69cU.js";const M=[["path",{d:"M16 17h6v-6",key:"t6n2it"}],["path",{d:"m22 17-8.5-8.5-5 5L2 7",key:"x473p"}]],X=L("trending-down",M);function Z(){const[m,j]=l.useState(!0),[S,u]=l.useState(!1),[c,D]=l.useState([]),[s,B]=l.useState([]),[r,b]=l.useState({periodo:"mes",fechaInicio:(()=>{const i=new Date;return i.setDate(1),i.toISOString().split("T")[0]})(),fechaFin:new Date().toISOString().split("T")[0]});l.useEffect(()=>{v()},[]),l.useEffect(()=>{r.fechaInicio&&r.fechaFin&&v()},[r.fechaInicio,r.fechaFin]);const v=async()=>{j(!0);try{const[i,a]=await Promise.all([T.rpc("fn_reporte_rentabilidad_producto",{p_fecha_inicio:r.fechaInicio,p_fecha_fin:r.fechaFin}),T.rpc("fn_reporte_inventario_valorado")]);i.error&&console.error(i.error),a.error&&console.error(a.error),D(i.data||[]),B(a.data||[])}catch(i){console.error(i),f.error("Error al cargar datos")}finally{j(!1)}},C=i=>{const a=new Date;let o,d;switch(i){case"hoy":o=d=a.toISOString().split("T")[0];break;case"semana":const z=new Date(a);z.setDate(a.getDate()-a.getDay()),o=z.toISOString().split("T")[0],d=a.toISOString().split("T")[0];break;case"mes":o=new Date(a.getFullYear(),a.getMonth(),1).toISOString().split("T")[0],d=a.toISOString().split("T")[0];break;case"anio":o=new Date(a.getFullYear(),0,1).toISOString().split("T")[0],d=a.toISOString().split("T")[0];break;case"todos":o="2024-01-01",d=a.toISOString().split("T")[0];break;default:return}b({...r,periodo:i,fechaInicio:o,fechaFin:d})},n=i=>`Bs ${parseFloat(i||0).toFixed(2)}`,p=c.reduce((i,a)=>i+parseFloat(a.cantidad_vendida||0)*parseFloat(a.precio_venta||0),0),k=c.reduce((i,a)=>i+parseFloat(a.cantidad_vendida||0)*parseFloat(a.precio_costo||0),0),y=c.reduce((i,a)=>i+parseFloat(a.ganancia_total||0),0),w=p>0?(y/p*100).toFixed(1):0;s.reduce((i,a)=>i+parseFloat(a.valor_venta_potencial||0)*.7,0);const x=s.reduce((i,a)=>i+parseFloat(a.valor_venta_potencial||0),0),g=s.reduce((i,a)=>i+parseInt(a.stock_total||0),0),h=s.reduce((i,a)=>i+parseInt(a.cantidad_productos||0),0),$={todos:"Todas las fechas",hoy:"Hoy",semana:"Esta semana",mes:"Este mes",anio:"Este año"}[r.periodo]||`${r.fechaInicio} - ${r.fechaFin}`,P=async()=>{u(!0);try{const i=`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Balance General - Don Baraton</title>
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
            
            /* Resumen Financiero Principal */
            .resumen-principal {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 15px;
              margin-bottom: 25px;
            }
            .resumen-card {
              background: linear-gradient(145deg, #f8f9fa, #ffffff);
              border-radius: 12px;
              padding: 20px;
              text-align: center;
              border: 1px solid #e9ecef;
              box-shadow: 0 2px 8px rgba(0,0,0,0.04);
            }
            .resumen-card.ingresos { border-left: 4px solid #2e7d32; }
            .resumen-card.costos { border-left: 4px solid #c62828; }
            .resumen-card.ganancia { border-left: 4px solid #1a5d1a; background: linear-gradient(145deg, #e8f5e9, #ffffff); }
            .resumen-valor { font-size: 22px; font-weight: 700; margin-bottom: 5px; }
            .resumen-label { font-size: 10px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
            .margen-tag { 
              display: inline-block; 
              margin-top: 8px; 
              padding: 4px 12px; 
              background: #2e7d32; 
              color: white; 
              border-radius: 20px; 
              font-size: 10px; 
              font-weight: 600; 
            }
            
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
            
            /* Grid de Inventario */
            .inv-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 12px;
              margin-bottom: 20px;
            }
            .inv-item {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 10px;
              text-align: center;
            }
            .inv-valor { font-size: 18px; font-weight: 700; color: #1a5d1a; }
            .inv-label { font-size: 10px; color: #666; margin-top: 3px; }
            
            /* Tablas */
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
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
                <img src="${R}" class="logo" alt="Logo">
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
              <h2>Balance General</h2>
              <p>Período: ${$} • Generado: ${new Date().toLocaleDateString("es-BO")} ${new Date().toLocaleTimeString("es-BO")}</p>
            </div>

            <div class="resumen-principal">
              <div class="resumen-card ingresos">
                <div class="resumen-valor positive">${n(p)}</div>
                <div class="resumen-label">Ingresos por Ventas</div>
              </div>
              <div class="resumen-card costos">
                <div class="resumen-valor negative">${n(k)}</div>
                <div class="resumen-label">Costos de Venta</div>
              </div>
              <div class="resumen-card ganancia">
                <div class="resumen-valor positive">${n(y)}</div>
                <div class="resumen-label">Ganancia Bruta</div>
                <div class="margen-tag">${w}% Margen</div>
              </div>
            </div>

            <div class="seccion">
              <div class="seccion-titulo">Valoración del Inventario</div>
              <div class="inv-grid">
                <div class="inv-item">
                  <div class="inv-valor">${h}</div>
                  <div class="inv-label">Productos Activos</div>
                </div>
                <div class="inv-item">
                  <div class="inv-valor">${g}</div>
                  <div class="inv-label">Unidades en Stock</div>
                </div>
                <div class="inv-item">
                  <div class="inv-valor">${n(x)}</div>
                  <div class="inv-label">Valor de Venta Potencial</div>
                </div>
              </div>
            </div>

            ${s.length>0?`
            <div class="seccion">
              <div class="seccion-titulo">Inventario por Categoría</div>
              <table>
                <thead>
                  <tr>
                    <th>Categoría</th>
                    <th style="text-align:center">Productos</th>
                    <th style="text-align:center">Stock</th>
                    <th style="text-align:right">Valor Venta</th>
                  </tr>
                </thead>
                <tbody>
                  ${s.map(o=>`
                    <tr>
                      <td><strong>${o.categoria||"Sin categoría"}</strong></td>
                      <td style="text-align:center">${o.cantidad_productos||0}</td>
                      <td style="text-align:center">${o.stock_total||0}</td>
                      <td style="text-align:right" class="currency positive">${n(o.valor_venta_potencial)}</td>
                    </tr>
                  `).join("")}
                </tbody>
                <tfoot>
                  <tr>
                    <td><strong>TOTAL</strong></td>
                    <td style="text-align:center"><strong>${h}</strong></td>
                    <td style="text-align:center"><strong>${g}</strong></td>
                    <td style="text-align:right" class="currency positive"><strong>${n(x)}</strong></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            `:""}

            ${c.length>0?`
            <div class="seccion">
              <div class="seccion-titulo">Productos Más Rentables (Top 10)</div>
              <table>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th style="text-align:center">Vendidos</th>
                    <th style="text-align:right">Margen Unit.</th>
                    <th style="text-align:right">Ganancia Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${c.slice(0,10).map(o=>`
                    <tr>
                      <td><strong>${o.producto||"Sin nombre"}</strong></td>
                      <td style="text-align:center">${o.cantidad_vendida||0}</td>
                      <td style="text-align:right" class="currency">${n(o.margen_unitario)}</td>
                      <td style="text-align:right" class="currency positive">${n(o.ganancia_total)}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
            `:""}

            <div class="footer">
              <p class="brand">Don Baraton - Sistema de Gestión de Supermercado</p>
              <p>Reporte generado automáticamente • ${new Date().toLocaleDateString("es-BO")} ${new Date().toLocaleTimeString("es-BO")}</p>
              <p>Este documento es un resumen financiero para uso interno</p>
            </div>
          </div>
        </body>
        </html>
      `,a=window.open("","_blank");if(!a){f.error("Por favor permite las ventanas emergentes para generar el PDF"),u(!1);return}a.document.write(i),a.document.close(),setTimeout(()=>{a.print(),f.success("PDF listo para guardar")},500)}catch(i){console.error("Error:",i),f.error("Error al generar PDF")}finally{u(!1)}};return e.jsxs("div",{style:t.container,children:[e.jsx(V,{position:"top-right"}),e.jsxs("header",{style:t.header,children:[e.jsxs("div",{children:[e.jsxs("h1",{style:t.title,children:[e.jsx(A,{size:28,style:{marginRight:"12px"}}),"Balance General"]}),e.jsx("p",{style:t.subtitle,children:"Resumen financiero del período seleccionado"})]}),e.jsxs("div",{style:{display:"flex",gap:"10px"},children:[e.jsxs("button",{style:t.refreshButton,onClick:v,disabled:m,children:[e.jsx(W,{size:18,style:{animation:m?"spin 1s linear infinite":"none"}}),"Actualizar"]}),e.jsx("button",{style:t.exportButton,onClick:P,disabled:S,children:S?e.jsxs(e.Fragment,{children:[e.jsx(F,{size:18,style:{animation:"spin 1s linear infinite"}})," Generando..."]}):e.jsxs(e.Fragment,{children:[e.jsx(G,{size:18})," Exportar PDF"]})})]})]}),e.jsx("div",{style:t.filtersCard,children:e.jsxs("div",{style:t.filtersRow,children:[e.jsx("div",{style:t.periodButtons,children:[{key:"hoy",label:"Hoy"},{key:"semana",label:"Semana"},{key:"mes",label:"Este Mes"},{key:"anio",label:"Este Año"},{key:"todos",label:"Todos"}].map(i=>e.jsx("button",{style:{...t.periodButton,...r.periodo===i.key?t.periodButtonActive:{}},onClick:()=>C(i.key),children:i.label},i.key))}),e.jsxs("div",{style:t.filterGroup,children:[e.jsx("label",{style:t.filterLabel,children:"Desde:"}),e.jsx("input",{type:"date",value:r.fechaInicio,onChange:i=>b({...r,periodo:"personalizado",fechaInicio:i.target.value}),style:t.input})]}),e.jsxs("div",{style:t.filterGroup,children:[e.jsx("label",{style:t.filterLabel,children:"Hasta:"}),e.jsx("input",{type:"date",value:r.fechaFin,onChange:i=>b({...r,periodo:"personalizado",fechaFin:i.target.value}),style:t.input})]})]})}),m?e.jsxs("div",{style:t.loadingState,children:[e.jsx(F,{size:40,style:{animation:"spin 1s linear infinite",color:"#1a5d1a"}}),e.jsx("p",{children:"Cargando balance..."})]}):e.jsxs(e.Fragment,{children:[e.jsxs("div",{style:t.mainGrid,children:[e.jsxs("div",{style:{...t.bigCard,borderTop:"4px solid #2e7d32"},children:[e.jsx(_,{size:36,style:{color:"#2e7d32"}}),e.jsxs("div",{children:[e.jsx("span",{style:t.bigLabel,children:"Ingresos del Período"}),e.jsx("span",{style:{...t.bigValue,color:"#2e7d32"},children:n(p)})]})]}),e.jsxs("div",{style:{...t.bigCard,borderTop:"4px solid #c62828"},children:[e.jsx(X,{size:36,style:{color:"#c62828"}}),e.jsxs("div",{children:[e.jsx("span",{style:t.bigLabel,children:"Costos del Período"}),e.jsx("span",{style:{...t.bigValue,color:"#c62828"},children:n(k)})]})]}),e.jsxs("div",{style:{...t.bigCard,borderTop:"4px solid #1a5d1a"},children:[e.jsx(O,{size:36,style:{color:"#1a5d1a"}}),e.jsxs("div",{children:[e.jsx("span",{style:t.bigLabel,children:"Ganancia Bruta"}),e.jsx("span",{style:{...t.bigValue,color:"#1a5d1a"},children:n(y)}),e.jsxs("span",{style:t.margenTag,children:[w,"% margen"]})]})]})]}),e.jsxs("div",{style:t.section,children:[e.jsxs("h2",{style:t.sectionTitle,children:[e.jsx(I,{size:20}),"Valoración del Inventario"]}),e.jsxs("div",{style:t.invGrid,children:[e.jsxs("div",{style:t.invCard,children:[e.jsx(I,{size:24,style:{color:"#1565c0"}}),e.jsxs("div",{children:[e.jsx("span",{style:t.invLabel,children:"Productos Activos"}),e.jsx("span",{style:t.invValue,children:h})]})]}),e.jsxs("div",{style:t.invCard,children:[e.jsx(E,{size:24,style:{color:"#e65100"}}),e.jsxs("div",{children:[e.jsx("span",{style:t.invLabel,children:"Unidades en Stock"}),e.jsx("span",{style:{...t.invValue,color:"#e65100"},children:g})]})]}),e.jsxs("div",{style:t.invCard,children:[e.jsx(_,{size:24,style:{color:"#2e7d32"}}),e.jsxs("div",{children:[e.jsx("span",{style:t.invLabel,children:"Valor Potencial de Venta"}),e.jsx("span",{style:{...t.invValue,color:"#2e7d32"},children:n(x)})]})]})]})]}),s.length>0&&e.jsxs("div",{style:t.section,children:[e.jsx("h3",{style:t.sectionTitle,children:"Inventario por Categoría"}),e.jsxs("table",{style:t.table,children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{style:t.th,children:"Categoría"}),e.jsx("th",{style:{...t.th,textAlign:"center"},children:"Productos"}),e.jsx("th",{style:{...t.th,textAlign:"center"},children:"Stock Total"}),e.jsx("th",{style:{...t.th,textAlign:"right"},children:"Valor Venta"})]})}),e.jsx("tbody",{children:s.map((i,a)=>e.jsxs("tr",{style:t.tr,children:[e.jsx("td",{style:t.td,children:e.jsx("strong",{children:i.categoria||"Sin categoría"})}),e.jsx("td",{style:{...t.td,textAlign:"center"},children:i.cantidad_productos}),e.jsx("td",{style:{...t.td,textAlign:"center"},children:i.stock_total}),e.jsx("td",{style:{...t.td,textAlign:"right",color:"#2e7d32",fontWeight:"600"},children:n(i.valor_venta_potencial)})]},a))}),e.jsx("tfoot",{children:e.jsxs("tr",{style:t.tfootRow,children:[e.jsx("td",{style:{...t.td,fontWeight:"700"},children:"TOTAL"}),e.jsx("td",{style:{...t.td,textAlign:"center",fontWeight:"600"},children:h}),e.jsx("td",{style:{...t.td,textAlign:"center",fontWeight:"600"},children:g}),e.jsx("td",{style:{...t.td,textAlign:"right",fontWeight:"700",color:"#2e7d32",fontSize:"16px"},children:n(x)})]})})]})]})]}),e.jsx("style",{children:"@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }"})]})}const t={container:{padding:"20px",maxWidth:"1200px",margin:"0 auto"},header:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"25px",flexWrap:"wrap",gap:"15px"},title:{margin:0,fontSize:"28px",fontWeight:"700",color:"#1a5d1a",display:"flex",alignItems:"center"},subtitle:{margin:"8px 0 0 0",color:"#6c757d",fontSize:"14px"},exportButton:{display:"flex",alignItems:"center",gap:"8px",padding:"12px 20px",background:"linear-gradient(135deg, #1a5d1a, #2e8b57)",color:"white",border:"none",borderRadius:"10px",fontSize:"14px",fontWeight:"600",cursor:"pointer",boxShadow:"0 4px 12px rgba(26, 93, 26, 0.3)"},refreshButton:{display:"flex",alignItems:"center",gap:"8px",padding:"12px 20px",background:"white",border:"2px solid #e9ecef",borderRadius:"10px",fontSize:"14px",fontWeight:"600",cursor:"pointer",color:"#495057"},filtersCard:{background:"white",borderRadius:"16px",padding:"20px",marginBottom:"25px",boxShadow:"0 2px 12px rgba(0,0,0,0.05)"},filtersRow:{display:"flex",gap:"15px",flexWrap:"wrap",alignItems:"flex-end"},periodButtons:{display:"flex",gap:"5px",marginRight:"20px"},periodButton:{padding:"10px 16px",border:"2px solid #e9ecef",borderRadius:"8px",background:"white",cursor:"pointer",fontSize:"13px",fontWeight:"500",color:"#6c757d",transition:"all 0.2s"},periodButtonActive:{background:"#1a5d1a",color:"white",borderColor:"#1a5d1a"},filterGroup:{display:"flex",flexDirection:"column",gap:"5px"},filterLabel:{fontSize:"13px",fontWeight:"500",color:"#6c757d"},input:{padding:"10px 15px",border:"2px solid #e9ecef",borderRadius:"10px",fontSize:"14px",outline:"none"},mainGrid:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))",gap:"20px",marginBottom:"25px"},bigCard:{padding:"30px",background:"white",borderRadius:"16px",display:"flex",alignItems:"center",gap:"20px",boxShadow:"0 2px 12px rgba(0,0,0,0.05)"},bigLabel:{display:"block",fontSize:"14px",color:"#6c757d",marginBottom:"5px"},bigValue:{display:"block",fontSize:"32px",fontWeight:"700"},margenTag:{display:"inline-block",marginTop:"8px",padding:"4px 10px",background:"#e8f5e9",borderRadius:"20px",fontSize:"12px",color:"#2e7d32",fontWeight:"600"},section:{background:"white",borderRadius:"16px",padding:"25px",marginBottom:"20px",boxShadow:"0 2px 12px rgba(0,0,0,0.05)"},sectionTitle:{display:"flex",alignItems:"center",gap:"10px",margin:"0 0 20px 0",fontSize:"18px",fontWeight:"600",color:"#333"},invGrid:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))",gap:"15px"},invCard:{display:"flex",alignItems:"center",gap:"15px",padding:"20px",background:"#f8f9fa",borderRadius:"12px"},invLabel:{display:"block",fontSize:"13px",color:"#6c757d"},invValue:{display:"block",fontSize:"22px",fontWeight:"700",color:"#333"},table:{width:"100%",borderCollapse:"collapse"},th:{padding:"12px 15px",textAlign:"left",background:"#f8f9fa",color:"#1a5d1a",fontWeight:"600",fontSize:"13px",borderBottom:"2px solid #e9ecef"},tr:{borderBottom:"1px solid #e9ecef"},td:{padding:"12px 15px",fontSize:"14px",color:"#495057"},tfootRow:{background:"#e8f5e9"},loadingState:{display:"flex",flexDirection:"column",alignItems:"center",padding:"80px",color:"#6c757d",gap:"15px"}};export{Z as default};
