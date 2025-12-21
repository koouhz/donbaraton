import{c as T,r as s,s as A,j as e,b as k,P as z,X as R,m as _}from"./index-hR7h3xft.js";import{n as p,F as W,L as M}from"./index-BTmhdvE4.js";import{T as $}from"./trending-up-BgkhDZTu.js";import{F as O}from"./file-down-DifeVD_N.js";import{R as E}from"./refresh-cw-SHhOlYLT.js";import{A as V}from"./award-CY6C91vE.js";import{D as G}from"./dollar-sign-DePuN86F.js";import{S as N}from"./search-BOrDwhaZ.js";const U=[["path",{d:"M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z",key:"sc7q7i"}]],Y=T("funnel",U);function oe(){const[B,f]=s.useState([]),[I,m]=s.useState(!1),[c,b]=s.useState(""),[F,x]=s.useState("mes"),[g,y]=s.useState(""),[h,j]=s.useState(""),[v,L]=s.useState(50);s.useEffect(()=>{S("mes")},[]);const S=o=>{const r=new Date;let i,a;switch(o){case"dia":i=a=r.toISOString().split("T")[0];break;case"semana":const u=new Date(r);u.setDate(r.getDate()-7),i=u.toISOString().split("T")[0],a=r.toISOString().split("T")[0];break;case"mes":i=new Date(r.getFullYear(),r.getMonth(),1).toISOString().split("T")[0],a=r.toISOString().split("T")[0];break;case"año":i=new Date(r.getFullYear(),0,1).toISOString().split("T")[0],a=r.toISOString().split("T")[0];break;default:return}x(o),y(i),j(a),w(i,a)},w=async(o=g,r=h)=>{if(!o||!r){p.error("Seleccione un período");return}m(!0);try{const{data:i,error:a}=await A.rpc("fn_productos_mas_vendidos",{p_fecha_inicio:o,p_fecha_fin:r,p_limite:v});if(a)throw a;f(i||[]),i?.length===0&&p("No hay ventas en el período seleccionado",{icon:"📊"})}catch(i){console.error("Error:",i),p.error("Error al cargar datos"),f([])}finally{m(!1)}},n=B.filter(o=>o.nombre.toLowerCase().includes(c.toLowerCase())||o.codigo?.toLowerCase().includes(c.toLowerCase())||o.categoria?.toLowerCase().includes(c.toLowerCase())),d={totalProductos:n.length,totalUnidades:n.reduce((o,r)=>o+parseInt(r.cantidad_vendida||0),0),totalMonto:n.reduce((o,r)=>o+parseFloat(r.monto_generado||0),0)},l=o=>new Intl.NumberFormat("es-BO",{style:"currency",currency:"BOB"}).format(o||0),P=o=>o===1?{bg:"#FFD700",color:"#000"}:o===2?{bg:"#C0C0C0",color:"#000"}:o===3?{bg:"#CD7F32",color:"#fff"}:{bg:"#f5f5f5",color:"#666"},D=()=>{const o=window.open("","_blank"),r=new Date().toLocaleDateString("es-BO");let i=`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Productos Más Vendidos</title>
        <style>
          body { font-family: Arial, sans-serif; font-size: 12px; margin: 20px; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #1a5d1a; padding-bottom: 15px; }
          .header img { width: 60px; height: 60px; }
          .header h1 { color: #1a5d1a; margin: 10px 0 5px; font-size: 18px; }
          .periodo { text-align: center; margin-bottom: 15px; padding: 10px; background: #e8f5e9; border-radius: 5px; }
          .resumen { display: flex; justify-content: space-around; margin: 15px 0; padding: 15px; background: #f5f5f5; border-radius: 5px; }
          .resumen-item { text-align: center; }
          .resumen-valor { font-size: 20px; font-weight: bold; color: #1a5d1a; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th { background: #1a5d1a; color: white; padding: 10px; text-align: left; font-size: 11px; }
          td { padding: 10px; border-bottom: 1px solid #ddd; font-size: 11px; }
          tr:nth-child(even) { background: #f9f9f9; }
          .pos { font-weight: bold; text-align: center; }
          .top1 { background: #FFD700; }
          .top2 { background: #C0C0C0; }
          .top3 { background: #CD7F32; color: white; }
          .monto { color: #1a5d1a; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${_}" alt="Logo" />
          <h1>DON BARATÓN - Productos Más Vendidos</h1>
          <p>Generado: ${r}</p>
        </div>
        
        <div class="periodo">
          <strong>Período:</strong> ${g} al ${h}
        </div>
        
        <div class="resumen">
          <div class="resumen-item">
            <span class="resumen-valor">${d.totalProductos}</span><br>Productos
          </div>
          <div class="resumen-item">
            <span class="resumen-valor">${d.totalUnidades.toLocaleString()}</span><br>Unidades Vendidas
          </div>
          <div class="resumen-item">
            <span class="resumen-valor">${l(d.totalMonto)}</span><br>Monto Total
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th style="width:50px">Pos.</th>
              <th>Producto</th>
              <th>Código</th>
              <th>Categoría</th>
              <th>Cantidad</th>
              <th>Monto Generado</th>
              <th>Ticket Prom.</th>
            </tr>
          </thead>
          <tbody>
    `;n.forEach((a,u)=>{const C=a.posicion===1?"top1":a.posicion===2?"top2":a.posicion===3?"top3":"";i+=`
        <tr>
          <td class="pos ${C}">#${a.posicion}</td>
          <td><strong>${a.nombre}</strong></td>
          <td>${a.codigo||"-"}</td>
          <td>${a.categoria||"-"}</td>
          <td><strong>${parseInt(a.cantidad_vendida).toLocaleString()}</strong></td>
          <td class="monto">${l(a.monto_generado)}</td>
          <td>${l(a.ticket_promedio)}</td>
        </tr>
      `}),i+=`
          </tbody>
        </table>
        <script>window.onload = function() { window.print(); }<\/script>
      </body>
      </html>
    `,o.document.write(i),o.document.close(),p.success("Generando PDF...")};return e.jsxs("div",{style:t.container,children:[e.jsx(W,{position:"top-right"}),e.jsxs("header",{style:t.header,children:[e.jsxs("div",{children:[e.jsxs("h1",{style:t.title,children:[e.jsx($,{size:28,style:{marginRight:"12px"}}),"Productos Más Vendidos"]}),e.jsx("p",{style:t.subtitle,children:"REP-01 • Ranking de productos por cantidad vendida"})]}),e.jsxs("button",{style:t.exportButton,onClick:D,disabled:n.length===0,children:[e.jsx(O,{size:18})," Exportar PDF"]})]}),e.jsx("div",{style:t.filtrosRapidos,children:["dia","semana","mes","año"].map(o=>e.jsx("button",{style:{...t.filtroBtn,...F===o?t.filtroBtnActivo:{}},onClick:()=>S(o),children:o==="dia"?"Hoy":o==="semana"?"Última Semana":o==="mes"?"Este Mes":"Este Año"},o))}),e.jsxs("div",{style:t.filtrosContainer,children:[e.jsxs("div",{style:t.filtroGroup,children:[e.jsxs("label",{style:t.filtroLabel,children:[e.jsx(k,{size:14})," Fecha Inicio"]}),e.jsx("input",{type:"date",value:g,onChange:o=>{y(o.target.value),x("rango")},style:t.input})]}),e.jsxs("div",{style:t.filtroGroup,children:[e.jsxs("label",{style:t.filtroLabel,children:[e.jsx(k,{size:14})," Fecha Fin"]}),e.jsx("input",{type:"date",value:h,onChange:o=>{j(o.target.value),x("rango")},style:t.input})]}),e.jsxs("div",{style:t.filtroGroup,children:[e.jsxs("label",{style:t.filtroLabel,children:[e.jsx(Y,{size:14})," Límite"]}),e.jsxs("select",{value:v,onChange:o=>L(parseInt(o.target.value)),style:t.select,children:[e.jsx("option",{value:10,children:"Top 10"}),e.jsx("option",{value:20,children:"Top 20"}),e.jsx("option",{value:50,children:"Top 50"}),e.jsx("option",{value:100,children:"Top 100"})]})]}),e.jsxs("button",{style:t.buscarBtn,onClick:()=>w(),children:[e.jsx(E,{size:16})," Consultar"]})]}),e.jsxs("div",{style:t.statsCards,children:[e.jsxs("div",{style:t.statCard,children:[e.jsx(z,{size:24,style:{color:"#1a5d1a"}}),e.jsxs("div",{children:[e.jsx("span",{style:t.statValor,children:d.totalProductos}),e.jsx("span",{style:t.statLabel,children:"Productos"})]})]}),e.jsxs("div",{style:t.statCard,children:[e.jsx(V,{size:24,style:{color:"#e65100"}}),e.jsxs("div",{children:[e.jsx("span",{style:t.statValor,children:d.totalUnidades.toLocaleString()}),e.jsx("span",{style:t.statLabel,children:"Unidades Vendidas"})]})]}),e.jsxs("div",{style:t.statCard,children:[e.jsx(G,{size:24,style:{color:"#2e7d32"}}),e.jsxs("div",{children:[e.jsx("span",{style:t.statValor,children:l(d.totalMonto)}),e.jsx("span",{style:t.statLabel,children:"Monto Total Generado"})]})]})]}),e.jsx("div",{style:t.toolbar,children:e.jsxs("div",{style:t.searchBox,children:[e.jsx(N,{size:18,style:{color:"#6c757d"}}),e.jsx("input",{type:"text",placeholder:"Buscar producto...",value:c,onChange:o=>b(o.target.value),style:t.searchInput}),c&&e.jsx("button",{onClick:()=>b(""),style:t.clearButton,children:e.jsx(R,{size:16})})]})}),e.jsx("div",{style:t.tableContainer,children:I?e.jsxs("div",{style:t.loadingState,children:[e.jsx(M,{size:40,style:{animation:"spin 1s linear infinite",color:"#1a5d1a"}}),e.jsx("p",{children:"Cargando ranking..."})]}):n.length===0?e.jsxs("div",{style:t.emptyState,children:[e.jsx(z,{size:48,style:{color:"#ccc"}}),e.jsx("p",{children:"No hay datos para el período seleccionado"}),e.jsx("p",{style:{fontSize:"13px",color:"#999"},children:'Seleccione un período y presione "Consultar"'})]}):e.jsxs("table",{style:t.table,children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{style:{...t.th,width:"80px",textAlign:"center"},children:"Posición"}),e.jsx("th",{style:t.th,children:"Producto"}),e.jsx("th",{style:t.th,children:"Código"}),e.jsx("th",{style:t.th,children:"Categoría"}),e.jsx("th",{style:{...t.th,textAlign:"right"},children:"Cantidad"}),e.jsx("th",{style:{...t.th,textAlign:"right"},children:"Monto Generado"}),e.jsx("th",{style:{...t.th,textAlign:"right"},children:"Ticket Prom."})]})}),e.jsx("tbody",{children:n.map((o,r)=>{const i=P(o.posicion);return e.jsxs("tr",{style:t.tr,children:[e.jsx("td",{style:{...t.td,textAlign:"center"},children:e.jsxs("span",{style:{...t.posicionBadge,background:i.bg,color:i.color},children:["#",o.posicion]})}),e.jsx("td",{style:t.td,children:e.jsx("strong",{children:o.nombre})}),e.jsx("td",{style:t.td,children:o.codigo||"-"}),e.jsx("td",{style:t.td,children:e.jsx("span",{style:t.categoriaBadge,children:o.categoria})}),e.jsx("td",{style:{...t.td,textAlign:"right",fontWeight:"700",color:"#e65100"},children:parseInt(o.cantidad_vendida).toLocaleString()}),e.jsx("td",{style:{...t.td,textAlign:"right",fontWeight:"700",color:"#1a5d1a"},children:l(o.monto_generado)}),e.jsx("td",{style:{...t.td,textAlign:"right",color:"#6c757d"},children:l(o.ticket_promedio)})]},r)})})]})}),e.jsx("style",{children:"@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }"})]})}const t={container:{padding:"20px",maxWidth:"1400px",margin:"0 auto"},header:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px",flexWrap:"wrap",gap:"15px"},title:{margin:0,fontSize:"28px",fontWeight:"700",color:"#1a5d1a",display:"flex",alignItems:"center"},subtitle:{margin:"8px 0 0 0",color:"#6c757d",fontSize:"14px"},exportButton:{display:"flex",alignItems:"center",gap:"8px",padding:"12px 20px",background:"linear-gradient(135deg, #1a5d1a, #2e8b57)",color:"white",border:"none",borderRadius:"10px",fontSize:"14px",fontWeight:"600",cursor:"pointer"},filtrosRapidos:{display:"flex",gap:"10px",marginBottom:"15px",flexWrap:"wrap"},filtroBtn:{padding:"10px 18px",background:"white",border:"2px solid #e9ecef",borderRadius:"8px",fontSize:"13px",fontWeight:"500",cursor:"pointer",color:"#6c757d"},filtroBtnActivo:{background:"#e8f5e9",borderColor:"#1a5d1a",color:"#1a5d1a"},filtrosContainer:{display:"flex",gap:"15px",marginBottom:"20px",flexWrap:"wrap",alignItems:"flex-end",padding:"15px",background:"white",borderRadius:"12px",boxShadow:"0 2px 8px rgba(0,0,0,0.05)"},filtroGroup:{display:"flex",flexDirection:"column",gap:"5px"},filtroLabel:{display:"flex",alignItems:"center",gap:"5px",fontSize:"12px",color:"#6c757d",fontWeight:"500"},input:{padding:"10px 12px",border:"1px solid #ddd",borderRadius:"8px",fontSize:"14px",minWidth:"150px"},select:{padding:"10px 12px",border:"1px solid #ddd",borderRadius:"8px",fontSize:"14px",background:"white"},buscarBtn:{display:"flex",alignItems:"center",gap:"6px",padding:"10px 20px",background:"linear-gradient(135deg, #1a5d1a, #2e8b57)",color:"white",border:"none",borderRadius:"8px",fontSize:"14px",fontWeight:"500",cursor:"pointer"},statsCards:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))",gap:"15px",marginBottom:"20px"},statCard:{display:"flex",alignItems:"center",gap:"15px",padding:"20px",background:"white",borderRadius:"12px",boxShadow:"0 2px 8px rgba(0,0,0,0.05)"},statValor:{display:"block",fontSize:"24px",fontWeight:"700",color:"#1a5d1a"},statLabel:{fontSize:"13px",color:"#6c757d"},toolbar:{display:"flex",gap:"12px",marginBottom:"20px"},searchBox:{display:"flex",alignItems:"center",gap:"10px",padding:"10px 15px",background:"white",border:"1px solid #e9ecef",borderRadius:"10px",flex:1,maxWidth:"400px"},searchInput:{border:"none",outline:"none",fontSize:"14px",width:"100%",background:"transparent"},clearButton:{background:"none",border:"none",cursor:"pointer",color:"#999",padding:"2px"},tableContainer:{background:"white",borderRadius:"12px",boxShadow:"0 2px 8px rgba(0,0,0,0.05)",overflow:"auto"},table:{width:"100%",borderCollapse:"collapse",minWidth:"800px"},th:{padding:"15px",textAlign:"left",background:"#f8f9fa",color:"#1a5d1a",fontWeight:"600",fontSize:"13px",borderBottom:"2px solid #e9ecef"},tr:{borderBottom:"1px solid #e9ecef"},td:{padding:"12px 15px",fontSize:"13px",color:"#495057"},posicionBadge:{display:"inline-block",padding:"6px 12px",borderRadius:"20px",fontSize:"13px",fontWeight:"700"},categoriaBadge:{padding:"4px 10px",borderRadius:"6px",fontSize:"11px",background:"#e3f2fd",color:"#1565c0"},loadingState:{display:"flex",flexDirection:"column",alignItems:"center",padding:"60px",color:"#6c757d",gap:"15px"},emptyState:{display:"flex",flexDirection:"column",alignItems:"center",padding:"60px",color:"#6c757d",gap:"10px"}};export{oe as default};
