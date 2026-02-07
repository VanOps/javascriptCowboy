// =============================================
// BotonPersonalizado.jsx — Props
// Ejemplo de componente reutilizable
// =============================================

function BotonPersonalizado({ texto, onClick, activo = false }) {
  // 🎯 Props destructuring
  // texto: string
  // onClick: función callback
  // activo: boolean con valor por defecto

  return (
    <button
      onClick={onClick}
      className={`
        px-6 py-2 rounded-lg font-semibold transition-colors
        ${activo 
          ? 'bg-blue-600 text-white shadow-lg' 
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }
      `}
    >
      {texto}
    </button>
  );
}

export default BotonPersonalizado;

// 🔍 CONCEPTOS:
// 
// 1. Props Destructuring
//    function Componente({ prop1, prop2, prop3 = 'default' })
//
// 2. Default Props
//    activo = false → valor por defecto si no se pasa
//
// 3. Conditional className
//    ${condicion ? 'clase-a' : 'clase-b'}
//
// 4. Callback Props
//    onClick se pasa desde el padre y se ejecuta aquí
//
// USO:
// <BotonPersonalizado 
//   texto="Click me" 
//   onClick={() => alert('clicked')}
//   activo={true}
// />
