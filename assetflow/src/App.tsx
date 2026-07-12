/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layouts/Layout';
import Dashboard from './pages/Dashboard';
import Organization from './pages/Organization';
import Assets from './pages/Assets';
import Bookings from './pages/Bookings';
import Maintenance from './pages/Maintenance';
import Audit from './pages/Audit';
import Reports from './pages/Reports';
import Activity from './pages/Activity';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="organization" element={<Organization />} />
          <Route path="assets" element={<Assets />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="audit" element={<Audit />} />
          <Route path="reports" element={<Reports />} />
          <Route path="activity" element={<Activity />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
