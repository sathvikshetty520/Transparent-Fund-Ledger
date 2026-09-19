import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Campaigns from './pages/Campaigns';
import CampaignDetail from './pages/CampaignDetail';
import PublicDashboard from './pages/PublicDashboard';
import AuditExplorer from './pages/AuditExplorer';
import VerifyLedger from './pages/VerifyLedger';
import Login from './pages/Login';
import Register from './pages/Register';
import Donate from './pages/Donate';
import MyDonations from './pages/MyDonations';
import DonationReceipt from './pages/DonationReceipt';
import MyCampaigns from './pages/MyCampaigns';
import CreateCampaign from './pages/CreateCampaign';
import EditCampaign from './pages/EditCampaign';
import ProposeAllocation from './pages/ProposeAllocation';
import SubmitExpense from './pages/SubmitExpense';
import AdminDashboard from './pages/AdminDashboard';
import CampaignApprovals from './pages/CampaignApprovals';
import AllocationApprovals from './pages/AllocationApprovals';
import ExpenseVerification from './pages/ExpenseVerification';
import NotFound from './pages/NotFound';

// Small helper so the routes below stay short
const only = (roles, page) => <ProtectedRoute roles={roles}>{page}</ProtectedRoute>;

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/campaigns/:id" element={<CampaignDetail />} />
          <Route path="/dashboard" element={<PublicDashboard />} />
          <Route path="/audit" element={<AuditExplorer />} />
          <Route path="/verify" element={<VerifyLedger />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Contributor */}
          <Route path="/campaigns/:campaignId/donate" element={only(['CONTRIBUTOR'], <Donate />)} />
          <Route path="/my-donations" element={only(['CONTRIBUTOR'], <MyDonations />)} />
          <Route path="/donations/:id/receipt" element={only(['CONTRIBUTOR', 'ADMIN'], <DonationReceipt />)} />

          {/* Organizer */}
          <Route path="/organizer/campaigns" element={only(['ORGANIZER'], <MyCampaigns />)} />
          <Route path="/organizer/campaigns/new" element={only(['ORGANIZER'], <CreateCampaign />)} />
          <Route path="/organizer/campaigns/:id/edit" element={only(['ORGANIZER'], <EditCampaign />)} />
          <Route path="/organizer/campaigns/:id/allocate" element={only(['ORGANIZER'], <ProposeAllocation />)} />
          <Route path="/organizer/allocations/:allocationId/expense" element={only(['ORGANIZER'], <SubmitExpense />)} />

          {/* Admin */}
          <Route path="/admin" element={only(['ADMIN'], <AdminDashboard />)} />
          <Route path="/admin/campaigns" element={only(['ADMIN'], <CampaignApprovals />)} />
          <Route path="/admin/allocations" element={only(['ADMIN'], <AllocationApprovals />)} />
          <Route path="/admin/expenses" element={only(['ADMIN'], <ExpenseVerification />)} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
