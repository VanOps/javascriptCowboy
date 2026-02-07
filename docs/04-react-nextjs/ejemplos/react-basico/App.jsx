// =============================================
// App.jsx — Componente Principal React
// Ejecutar: npm run dev (Vite) o npm start (CRA)
// =============================================

import { useState } from 'react';
import Contador from './components/Contador';
import ListaTareas from './components/ListaTareas';
import BuscadorIA from './components/BuscadorIA';
import BotonPersonalizado from './components/BotonPersonalizado';

function App() {
  const [vistaActual, setVistaActual] = useState('contador');

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">
          🚀 React - Ejemplos Fundamentales
        </h1>
        
        {/* Navegación entre ejemplos */}
        <nav className="flex gap-4">
          <BotonPersonalizado 
            texto="📊 Contador" 
            onClick={() => setVistaActual('contador')}
            activo={vistaActual === 'contador'}
          />
          <BotonPersonalizado 
            texto="✅ Tareas" 
            onClick={() => setVistaActual('tareas')}
            activo={vistaActual === 'tareas'}
          />
          <BotonPersonalizado 
            texto="🤖 IA" 
            onClick={() => setVistaActual('ia')}
            activo={vistaActual === 'ia'}
          />
        </nav>
      </header>

      <main>
        {/* Conditional Rendering */}
        {vistaActual === 'contador' && <Contador />}
        {vistaActual === 'tareas' && <ListaTareas />}
        {vistaActual === 'ia' && <BuscadorIA />}
      </main>

      <footer className="mt-16 text-center text-gray-500">
        <p>💡 Abre DevTools → Components para ver el árbol de React</p>
      </footer>
    </div>
  );
}

export default App;
