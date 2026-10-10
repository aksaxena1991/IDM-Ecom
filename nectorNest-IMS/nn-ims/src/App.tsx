import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ImsShell } from './pages/ImsShell';

export const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/ims/catalog" replace />} />
      <Route path="/ims" element={<Navigate to="/ims/catalog" replace />} />
      <Route path="/ims/:tab" element={<ImsShell />} />
      <Route path="*" element={<Navigate to="/ims/catalog" replace />} />
    </Routes>
  );
};

export default App;
