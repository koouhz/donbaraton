import{r as c,s as S,j as e,b as k,C as u,X as L,P,m as R}from"./index-hR7h3xft.js";import{n as b,F as _,L as A}from"./index-BTmhdvE4.js";import{R as B}from"./refresh-cw-SHhOlYLT.js";import{F as I}from"./file-down-DifeVD_N.js";import{C as p}from"./clock-B7rEP_ha.js";import{T as y}from"./triangle-alert-B_IWcPwx.js";import{S as $}from"./search-BOrDwhaZ.js";function N(){const[d,h]=c.useState([]),[j,g]=c.useState(!0),[l,m]=c.useState(""),[a,C]=c.useState(30);c.useEffect(()=>{f()},[a]);const f=async()=>{g(!0);try{const{data:r,error:i}=await S.rpc("fn_listar_productos_por_vencer",{p_dias:a});if(i)throw i;h(r||[])}catch(r){console.error("Error:",r),b.error("Error al cargar productos"),h([])}finally{g(!1)}},x=d.filter(r=>r.nombre.toLowerCase().includes(l.toLowerCase())||r.codigo_barras?.toLowerCase().includes(l.toLowerCase())||r.categoria?.toLowerCase().includes(l.toLowerCase())),v=r=>{switch(r){case"CRITICO":return{bg:"#ffebee",color:"#c62828",icon:e.jsx(y,{size:14})};case"ALERTA":return{bg:"#fff3e0",color:"#e65100",icon:e.jsx(u,{size:14})};default:return{bg:"#e8f5e9",color:"#2e7d32",icon:e.jsx(p,{size:14})}}},n={criticos:d.filter(r=>r.estado_alerta==="CRITICO").length,alerta:d.filter(r=>r.estado_alerta==="ALERTA").length,proximos:d.filter(r=>r.estado_alerta==="PROXIMO").length},w=()=>{const r=window.open("","_blank"),i=new Date().toLocaleDateString("es-BO");let o=`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Productos por Vencer - ${a} días</title>
        <style>
          body { font-family: Arial, sans-serif; font-size: 12px; margin: 20px; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #1a5d1a; padding-bottom: 15px; }
          .header img { width: 60px; height: 60px; }
          .header h1 { color: #1a5d1a; margin: 10px 0 5px; font-size: 18px; }
          .info { display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 11px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th { background: #1a5d1a; color: white; padding: 8px; text-align: left; font-size: 11px; }
          td { padding: 8px; border-bottom: 1px solid #ddd; font-size: 11px; }
          tr:nth-child(even) { background: #f9f9f9; }
          .critico { background: #ffebee; color: #c62828; }
          .alerta { background: #fff3e0; color: #e65100; }
          .proximo { background: #e8f5e9; color: #2e7d32; }
          .resumen { display: flex; justify-content: space-around; margin: 15px 0; padding: 10px; background: #f5f5f5; border-radius: 5px; }
          .resumen-item { text-align: center; }
          .resumen-valor { font-size: 20px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${R}" alt="Logo" />
          <h1>DON BARATÓN - Productos por Vencer</h1>
          <p>Próximos ${a} días • Generado: ${i}</p>
        </div>
        
        <div class="resumen">
          <div class="resumen-item"><span class="resumen-valor" style="color:#c62828">${n.criticos}</span><br>Críticos (≤15d)</div>
          <div class="resumen-item"><span class="resumen-valor" style="color:#e65100">${n.alerta}</span><br>Alerta (≤20d)</div>
          <div class="resumen-item"><span class="resumen-valor" style="color:#2e7d32">${n.proximos}</span><br>Próximos (≤30d)</div>
          <div class="resumen-item"><span class="resumen-valor" style="color:#1a5d1a">${x.length}</span><br>Total</div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Código</th>
              <th>Categoría</th>
              <th>Lote</th>
              <th>Cantidad</th>
              <th>Vencimiento</th>
              <th>Días Rest.</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
    `;x.forEach(s=>{const z=s.estado_alerta==="CRITICO"?"critico":s.estado_alerta==="ALERTA"?"alerta":"proximo";o+=`
        <tr>
          <td>${s.nombre}</td>
          <td>${s.codigo_barras||"-"}</td>
          <td>${s.categoria||"-"}</td>
          <td>${s.lote||"-"}</td>
          <td>${s.cantidad}</td>
          <td>${new Date(s.fecha_vencimiento).toLocaleDateString("es-BO")}</td>
          <td><strong>${s.dias_restantes}</strong></td>
          <td class="${z}">${s.estado_alerta}</td>
        </tr>
      `}),o+=`
          </tbody>
        </table>
        <script>window.onload = function() { window.print(); }<\/script>
      </body>
      </html>
    `,r.document.write(o),r.document.close(),b.success("Generando PDF...")};return e.jsxs("div",{style:t.container,children:[e.jsx(_,{position:"top-right"}),e.jsxs("header",{style:t.header,children:[e.jsxs("div",{children:[e.jsxs("h1",{style:t.title,children:[e.jsx(k,{size:28,style:{marginRight:"12px"}}),"Productos por Vencer"]}),e.jsxs("p",{style:t.subtitle,children:["Control de vencimientos próximos • ",d.length," productos"]})]}),e.jsxs("div",{style:{display:"flex",gap:"10px"},children:[e.jsx("button",{style:t.refreshButton,onClick:f,title:"Actualizar",children:e.jsx(B,{size:18})}),e.jsxs("button",{style:t.exportButton,onClick:w,children:[e.jsx(I,{size:18})," Exportar PDF"]})]})]}),e.jsx("div",{style:t.tabsContainer,children:[30,20,15].map(r=>e.jsxs("button",{style:{...t.tab,...a===r?t.tabActivo:{}},onClick:()=>C(r),children:[e.jsx(p,{size:16}),"Próximos ",r," días"]},r))}),e.jsxs("div",{style:t.resumenCards,children:[e.jsxs("div",{style:{...t.resumenCard,borderLeft:"4px solid #c62828"},children:[e.jsx(y,{size:24,style:{color:"#c62828"}}),e.jsxs("div",{children:[e.jsx("span",{style:{...t.resumenValor,color:"#c62828"},children:n.criticos}),e.jsx("span",{style:t.resumenLabel,children:"Críticos (≤15 días)"})]})]}),e.jsxs("div",{style:{...t.resumenCard,borderLeft:"4px solid #e65100"},children:[e.jsx(u,{size:24,style:{color:"#e65100"}}),e.jsxs("div",{children:[e.jsx("span",{style:{...t.resumenValor,color:"#e65100"},children:n.alerta}),e.jsx("span",{style:t.resumenLabel,children:"En Alerta (≤20 días)"})]})]}),e.jsxs("div",{style:{...t.resumenCard,borderLeft:"4px solid #2e7d32"},children:[e.jsx(p,{size:24,style:{color:"#2e7d32"}}),e.jsxs("div",{children:[e.jsx("span",{style:{...t.resumenValor,color:"#2e7d32"},children:n.proximos}),e.jsx("span",{style:t.resumenLabel,children:"Próximos (≤30 días)"})]})]})]}),e.jsx("div",{style:t.toolbar,children:e.jsxs("div",{style:t.searchBox,children:[e.jsx($,{size:18,style:{color:"#6c757d"}}),e.jsx("input",{type:"text",placeholder:"Buscar por nombre, código o categoría...",value:l,onChange:r=>m(r.target.value),style:t.searchInput}),l&&e.jsx("button",{onClick:()=>m(""),style:t.clearButton,children:e.jsx(L,{size:16})})]})}),e.jsx("div",{style:t.tableContainer,children:j?e.jsxs("div",{style:t.loadingState,children:[e.jsx(A,{size:40,style:{animation:"spin 1s linear infinite",color:"#1a5d1a"}}),e.jsx("p",{children:"Cargando productos..."})]}):x.length===0?e.jsxs("div",{style:t.emptyState,children:[e.jsx(P,{size:48,style:{color:"#ccc"}}),e.jsxs("p",{children:["No hay productos por vencer en los próximos ",a," días"]})]}):e.jsxs("table",{style:t.table,children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{style:t.th,children:"Producto"}),e.jsx("th",{style:t.th,children:"Código"}),e.jsx("th",{style:t.th,children:"Categoría"}),e.jsx("th",{style:t.th,children:"Lote"}),e.jsx("th",{style:t.th,children:"Cantidad"}),e.jsx("th",{style:t.th,children:"Vencimiento"}),e.jsx("th",{style:t.th,children:"Días Rest."}),e.jsx("th",{style:t.th,children:"Estado"})]})}),e.jsx("tbody",{children:x.map((r,i)=>{const o=v(r.estado_alerta);return e.jsxs("tr",{style:t.tr,children:[e.jsx("td",{style:t.td,children:e.jsx("strong",{children:r.nombre})}),e.jsx("td",{style:t.td,children:r.codigo_barras||"-"}),e.jsx("td",{style:t.td,children:r.categoria||"-"}),e.jsx("td",{style:t.td,children:r.lote||"-"}),e.jsx("td",{style:t.td,children:e.jsx("strong",{children:r.cantidad})}),e.jsx("td",{style:t.td,children:new Date(r.fecha_vencimiento).toLocaleDateString("es-BO")}),e.jsxs("td",{style:{...t.td,fontWeight:"700",color:o.color},children:[r.dias_restantes," días"]}),e.jsx("td",{style:t.td,children:e.jsxs("span",{style:{...t.badge,background:o.bg,color:o.color},children:[o.icon,r.estado_alerta]})})]},i)})})]})}),e.jsx("style",{children:"@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }"})]})}const t={container:{padding:"20px",maxWidth:"1400px",margin:"0 auto"},header:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px",flexWrap:"wrap",gap:"15px"},title:{margin:0,fontSize:"28px",fontWeight:"700",color:"#1a5d1a",display:"flex",alignItems:"center"},subtitle:{margin:"8px 0 0 0",color:"#6c757d",fontSize:"14px"},refreshButton:{padding:"12px",background:"#f5f5f5",border:"1px solid #ddd",borderRadius:"10px",cursor:"pointer",color:"#666"},exportButton:{display:"flex",alignItems:"center",gap:"8px",padding:"12px 20px",background:"linear-gradient(135deg, #1a5d1a, #2e8b57)",color:"white",border:"none",borderRadius:"10px",fontSize:"14px",fontWeight:"600",cursor:"pointer"},tabsContainer:{display:"flex",gap:"10px",marginBottom:"20px",flexWrap:"wrap"},tab:{display:"flex",alignItems:"center",gap:"8px",padding:"12px 20px",background:"white",border:"2px solid #e9ecef",borderRadius:"10px",fontSize:"14px",fontWeight:"500",cursor:"pointer",color:"#6c757d",transition:"all 0.2s"},tabActivo:{background:"#e8f5e9",borderColor:"#1a5d1a",color:"#1a5d1a"},resumenCards:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))",gap:"15px",marginBottom:"20px"},resumenCard:{display:"flex",alignItems:"center",gap:"15px",padding:"20px",background:"white",borderRadius:"12px",boxShadow:"0 2px 8px rgba(0,0,0,0.05)"},resumenValor:{display:"block",fontSize:"28px",fontWeight:"700"},resumenLabel:{fontSize:"13px",color:"#6c757d"},toolbar:{display:"flex",gap:"12px",marginBottom:"20px"},searchBox:{display:"flex",alignItems:"center",gap:"10px",padding:"10px 15px",background:"white",border:"1px solid #e9ecef",borderRadius:"10px",flex:1,maxWidth:"400px"},searchInput:{border:"none",outline:"none",fontSize:"14px",width:"100%",background:"transparent"},clearButton:{background:"none",border:"none",cursor:"pointer",color:"#999",padding:"2px"},tableContainer:{background:"white",borderRadius:"12px",boxShadow:"0 2px 8px rgba(0,0,0,0.05)",overflow:"auto"},table:{width:"100%",borderCollapse:"collapse",minWidth:"900px"},th:{padding:"15px",textAlign:"left",background:"#f8f9fa",color:"#1a5d1a",fontWeight:"600",fontSize:"13px",borderBottom:"2px solid #e9ecef"},tr:{borderBottom:"1px solid #e9ecef"},td:{padding:"12px 15px",fontSize:"13px",color:"#495057"},badge:{display:"inline-flex",alignItems:"center",gap:"5px",padding:"5px 10px",borderRadius:"20px",fontSize:"11px",fontWeight:"600"},loadingState:{display:"flex",flexDirection:"column",alignItems:"center",padding:"60px",color:"#6c757d",gap:"15px"},emptyState:{display:"flex",flexDirection:"column",alignItems:"center",padding:"60px",color:"#6c757d",gap:"15px"}};export{N as default};
