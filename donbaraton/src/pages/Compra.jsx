// src/pages/Compra.jsx
import { 
  ShoppingBag, ArrowRight, FileText, Package, Truck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Compra() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>
            <ShoppingBag size={28} style={{ marginRight: '12px' }} />
            Compras
          </h1>
          <p style={styles.subtitle}>
            Centro de gestión de compras y proveedores
          </p>
        </div>
      </header>

      <div style={styles.grid}>
        <button style={styles.card} onClick={() => navigate('/ordenes-compra')}>
          <div style={styles.cardIcon}>
            <FileText size={32} style={{ color: '#1a5d1a' }} />
          </div>
          <div style={styles.cardContent}>
            <h3>Órdenes de Compra</h3>
            <p>Crear y gestionar pedidos a proveedores</p>
          </div>
          <ArrowRight size={20} style={{ color: '#ccc' }} />
        </button>

        <button style={styles.card} onClick={() => navigate('/proveedores')}>
          <div style={styles.cardIcon}>
            <Truck size={32} style={{ color: '#2e7d32' }} />
          </div>
          <div style={styles.cardContent}>
            <h3>Proveedores</h3>
            <p>Administrar proveedores y contactos</p>
          </div>
          <ArrowRight size={20} style={{ color: '#ccc' }} />
        </button>

        <button style={styles.card} onClick={() => navigate('/devoluciones')}>
          <div style={styles.cardIcon}>
            <Package size={32} style={{ color: '#e65100' }} />
          </div>
          <div style={styles.cardContent}>
            <h3>Devoluciones</h3>
            <p>Devoluciones de mercadería a proveedores</p>
          </div>
          <ArrowRight size={20} style={{ color: '#ccc' }} />
        </button>

        <button style={styles.card} onClick={() => navigate('/reportes-compras')}>
          <div style={styles.cardIcon}>
            <ShoppingBag size={32} style={{ color: '#1565c0' }} />
          </div>
          <div style={styles.cardContent}>
            <h3>Reportes de Compras</h3>
            <p>Análisis de compras por período</p>
          </div>
          <ArrowRight size={20} style={{ color: '#ccc' }} />
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '20px', maxWidth: '1000px', margin: '0 auto' },
  header: { marginBottom: '30px' },
  title: { margin: 0, fontSize: '28px', fontWeight: '700', color: '#1a5d1a', display: 'flex', alignItems: 'center' },
  subtitle: { margin: '8px 0 0 0', color: '#6c757d', fontSize: '14px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' },
  card: { display: 'flex', alignItems: 'center', gap: '20px', padding: '25px', background: 'white', border: '1px solid #e9ecef', borderRadius: '16px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', width: '100%' },
  cardIcon: { width: '60px', height: '60px', borderRadius: '12px', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cardContent: { flex: 1 },
};
