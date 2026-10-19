import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { RequireAuth } from './components/RequireAuth';
import Checklist from './pages/Checklist';
import Funding from './pages/Funding';
import Home from './pages/Home';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Onboarding from './pages/Onboarding';
import Pathways from './pages/Pathways';
import Resources from './pages/Resources';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="resources" element={<Resources />} />
        <Route path="onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />
        <Route path="pathways" element={<RequireAuth><Pathways /></RequireAuth>} />
        <Route path="funding" element={<RequireAuth><Funding /></RequireAuth>} />
        <Route path="checklist" element={<RequireAuth><Checklist /></RequireAuth>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
