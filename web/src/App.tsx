import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { RequireAuth } from './components/RequireAuth';
import ApplicationsPage from './features/applications/ApplicationsPage';
import { ProfilePage } from './features/profile/ProfilePage';
import ApsCalculator from './pages/ApsCalculator';
import Funding from './pages/Funding';
import Home from './pages/Home';
import Institutions from './pages/Institutions';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Onboarding from './pages/Onboarding';
import Pathways from './pages/Pathways';
import Resources, { SubjectResources } from './pages/Resources';
import Coach from './pages/Coach';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="resources" element={<Resources />} />
        <Route path="resources/:subjectSlug" element={<SubjectResources />} />
        <Route path="institutions" element={<RequireAuth><Institutions /></RequireAuth>} />
        <Route path="aps-calculator" element={<RequireAuth><ApsCalculator /></RequireAuth>} />
        <Route path="applications" element={<RequireAuth><ApplicationsPage /></RequireAuth>} />
        <Route path="profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
        <Route path="onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />
        <Route path="pathways" element={<RequireAuth><Pathways /></RequireAuth>} />
        <Route path="funding" element={<RequireAuth><Funding /></RequireAuth>} />
        <Route path="coach" element={<RequireAuth><Coach /></RequireAuth>} />
        <Route path="checklist" element={<Navigate to="/coach" replace />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
