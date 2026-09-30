## 2024-10-01 - React Lazy Loading in Vite
**Learning:** Using `React.lazy` with Vite for route-level code splitting significantly improves initial bundle size. However, lazy-loading deeply nested components or components within large monolithic files like `MineWorkspace` can be tricky due to how dependencies are structured and typing issues with generic parameter inference. Route-level splitting in `App.tsx` is safer and gives the best bang-for-buck.
**Action:** Implemented route-level lazy loading in `App.tsx`.
