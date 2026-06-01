import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { NewNdaWizard } from '@/pages/NewNdaWizard';
import { ArchivePage } from '@/components/archive/ArchivePage';
import { AgreementDetail } from '@/components/archive/AgreementDetail';
import { ContactsPage } from '@/components/contacts/ContactsPage';
import { CounterSignPage } from '@/pages/CounterSignPage';

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to="/new" replace />} />
        <Route path="/new" element={<NewNdaWizard />} />
        <Route path="/archive" element={<ArchivePage />} />
        <Route path="/archive/:id" element={<AgreementDetail />} />
        <Route path="/contacts" element={<ContactsPage />} />
      </Route>
      <Route path="/sign/:encoded" element={<CounterSignPage />} />
    </Routes>
  );
}
