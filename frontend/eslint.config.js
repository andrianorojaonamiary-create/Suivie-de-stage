import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist/**', 'suivi_de_stage_backend/dist/**', '**/node_modules/**']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Chaque page charge ses données dans un useEffect au montage
      // (useEffect(() => { fetchX().then(setState) }, [])). C'est le seul
      // point d'entrée vers l'API aujourd'hui : le projet n'a pas de couche
      // de data fetching (React Query / SWR). La règle est pertinente en
      // soi — un rendu en cascade est à éviter — mais la corriger ici
      // demanderait de réécrire les 26 pages ou d'introduire une dépendance.
      // On la laisse en avertissement pour qu'elle reste visible.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
])
