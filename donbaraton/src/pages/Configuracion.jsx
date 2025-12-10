// src/pages/Configuracion.jsx
import { useState } from 'react';
import { 
  Settings, Building, DollarSign, Bell,
  Shield, Save, Loader2, CheckCircle
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

export default function Configuracion() {
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    nombreEmpresa: 'Don Baratón',
    nit: '123456789',
    direccion: 'Cochabamba, Bolivia',
    telefono: '',
    moneda: 'BOB',
    iva: 13,
    stockMinimo: 10,
    alertaVencimiento: 30,
    notificacionesEmail: false
  });

  const handleSave = async () => {
    setSaving(true);
    // Simulación de guardado
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Configuración guardada');
    setSaving(false);
  };

  return (
    <div style={styles.container}>
      <Toaster position="top-right" />
      
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>
            <Settings size={28} style={{ marginRight: '12px' }} />
            Configuración
          </h1>
          <p style={styles.subtitle}>
            Ajustes generales del sistema
          </p>
        </div>
        <button style={styles.saveButton} onClick={handleSave} disabled={saving}>
          {saving ? (
            <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Guardando...</>
          ) : (
            <><Save size={18} /> Guardar Cambios</>
          )}
        </button>
      </header>

      <div style={styles.sections}>
        {/* Empresa */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <Building size={20} />
            Datos de la Empresa
          </h2>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label>Nombre de la Empresa</label>
              <input 
                type="text" 
                value={config.nombreEmpresa}
                onChange={e => setConfig({...config, nombreEmpresa: e.target.value})}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label>NIT</label>
              <input 
                type="text" 
                value={config.nit}
                onChange={e => setConfig({...config, nit: e.target.value})}
                style={styles.input}
              />
            </div>
            <div style={{...styles.formGroup, gridColumn: 'span 2'}}>
              <label>Dirección</label>
              <input 
                type="text" 
                value={config.direccion}
                onChange={e => setConfig({...config, direccion: e.target.value})}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label>Teléfono</label>
              <input 
                type="tel" 
                value={config.telefono}
                onChange={e => setConfig({...config, telefono: e.target.value})}
                style={styles.input}
                placeholder="4-1234567"
              />
            </div>
          </div>
        </div>

        {/* Financiero */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <DollarSign size={20} />
            Configuración Financiera
          </h2>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label>Moneda</label>
              <select 
                value={config.moneda}
                onChange={e => setConfig({...config, moneda: e.target.value})}
                style={styles.input}
              >
                <option value="BOB">Bolivianos (Bs)</option>
                <option value="USD">Dólares (US$)</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label>IVA (%)</label>
              <input 
                type="number" 
                value={config.iva}
                onChange={e => setConfig({...config, iva: e.target.value})}
                style={styles.input}
                min="0"
                max="100"
              />
            </div>
          </div>
        </div>

        {/* Inventario */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <Bell size={20} />
            Alertas de Inventario
          </h2>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label>Stock Mínimo por Defecto</label>
              <input 
                type="number" 
                value={config.stockMinimo}
                onChange={e => setConfig({...config, stockMinimo: e.target.value})}
                style={styles.input}
                min="1"
              />
            </div>
            <div style={styles.formGroup}>
              <label>Días de Anticipación para Vencimientos</label>
              <input 
                type="number" 
                value={config.alertaVencimiento}
                onChange={e => setConfig({...config, alertaVencimiento: e.target.value})}
                style={styles.input}
                min="1"
              />
            </div>
          </div>
        </div>

        {/* Seguridad */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <Shield size={20} />
            Seguridad
          </h2>
          <div style={styles.infoBox}>
            <CheckCircle size={20} style={{ color: '#2e7d32' }} />
            <p>Las contraseñas están protegidas con hash SHA-256. Los permisos se gestionan desde el módulo de Roles y Cargos.</p>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const styles = {
  container: { padding: '20px', maxWidth: '900px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' },
  title: { margin: 0, fontSize: '28px', fontWeight: '700', color: '#1a5d1a', display: 'flex', alignItems: 'center' },
  subtitle: { margin: '8px 0 0 0', color: '#6c757d', fontSize: '14px' },
  saveButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'linear-gradient(135deg, #1a5d1a, #2e8b57)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  sections: { display: 'flex', flexDirection: 'column', gap: '25px' },
  section: { background: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' },
  sectionTitle: { display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600', color: '#1a5d1a' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  input: { padding: '12px 15px', border: '2px solid #e9ecef', borderRadius: '10px', fontSize: '14px', outline: 'none' },
  infoBox: { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px 20px', background: '#e8f5e9', borderRadius: '10px', color: '#2e7d32', fontSize: '14px' },
};
