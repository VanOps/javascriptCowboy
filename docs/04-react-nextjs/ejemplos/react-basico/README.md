# Ejemplo React Básico

Este ejemplo demuestra los conceptos fundamentales de React: componentes, props, hooks (useState, useEffect).

## 🚀 Inicializar Proyecto

```bash
# Opción 1: Crear con Vite (recomendado - más rápido)
npm create vite@latest mi-app-react -- --template react

cd mi-app-react
npm install
npm run dev
```

```bash
# Opción 2: Create React App (tradicional)
npx create-react-app mi-app-react

cd mi-app-react
npm start
```

## 📁 Estructura de este Ejemplo

```
react-basico/
├── README.md (este archivo)
├── App.jsx                    # Componente principal
├── components/
│   ├── Contador.jsx           # useState hook
│   ├── ListaTareas.jsx        # map + props
│   ├── BuscadorIA.jsx         # useEffect + fetch
│   └── BotonPersonalizado.jsx # Props y eventos
└── package.json.example       # Dependencias necesarias
```

## 🎯 Conceptos Demostrados

- **Componentes funcionales** con arrow functions
- **Props** y comunicación padre-hijo
- **useState** para estado local
- **useEffect** para side effects (API calls)
- **Event handlers** (onClick, onChange)
- **Conditional rendering**
- **Lists y keys** con .map()
