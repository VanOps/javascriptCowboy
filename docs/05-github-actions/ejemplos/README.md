# Ejemplos GitHub Actions

Ejemplos listos para usar que demuestran JavaScript moderno en GitHub Actions.

## 📁 Estructura

```
ejemplos/
├── workflows/              # Workflows completos (.yml)
│   ├── ci-nextjs.yml      # CI para Next.js con Node.js
│   ├── docker-k8s.yml     # Build Docker + Deploy K8s
│   └── vault-deploy.yml   # Integración con Vault
│
├── custom-actions/        # Composite Actions personalizadas
│   └── deploy-k8s/        # Action reutilizable para K8s
│       ├── action.yml
│       └── deploy.js
│
└── scripts/               # Scripts Node.js para workflows
    ├── deploy-k8s.js      # Deploy automático a Kubernetes
    ├── vault-fetch.js     # Obtener secrets de Vault
    └── validate-logs.js   # Validar logs con patrones
```

## 🚀 Cómo Usar

### 1. Workflows

Copia los archivos `.yml` a tu repositorio en `.github/workflows/`:

```bash
mkdir -p .github/workflows
cp ejemplos/workflows/ci-nextjs.yml .github/workflows/
```

### 2. Custom Actions

Copia la carpeta completa a `.github/actions/`:

```bash
mkdir -p .github/actions
cp -r ejemplos/custom-actions/deploy-k8s .github/actions/
```

Luego úsala en tu workflow:

```yaml
- name: Deploy K8s
  uses: ./.github/actions/deploy-k8s
  with:
    cluster: production
    image-tag: ${{ github.sha }}
```

### 3. Scripts

Copia los scripts a tu proyecto y referéncialos en workflows:

```bash
mkdir -p scripts
cp ejemplos/scripts/*.js scripts/
```

En el workflow:

```yaml
- name: Deploy
  run: node scripts/deploy-k8s.js
  env:
    CLUSTER: production
```

## 🎯 Conceptos JavaScript Usados

Todos los ejemplos demuestran los conceptos aprendidos en los módulos anteriores:

- ✅ **Modules** (import/export)
- ✅ **Async/Await** (API calls, procesos)
- ✅ **Closures** (clientes reutilizables con estado)
- ✅ **Destructuring** (extraer env vars, GitHub context)
- ✅ **Template literals** (construir comandos dinámicos)
- ✅ **Array methods** (.map, .filter, .reduce)
- ✅ **Fetch API** (llamadas a K8s, Vault, APIs)
- ✅ **Error handling** (try/catch, validación)

## 📝 Notas Importantes

1. **Secrets**: Los workflows usan `${{ secrets.* }}` - debes configurarlos en:
   - Settings → Secrets and variables → Actions

2. **Permisos**: Algunos workflows necesitan permisos especiales:
   ```yaml
   permissions:
     contents: read
     packages: write
   ```

3. **Node.js**: Todos usan Node.js 20.x - asegúrate de incluir:
   ```yaml
   - uses: actions/setup-node@v4
     with:
       node-version: 20.x
   ```

4. **Testing local**: Usa [act](https://github.com/nektos/act) para probar workflows localmente:
   ```bash
   act -j build
   ```
