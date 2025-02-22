
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MIS from './pages/MIS';
import Invoices from './pages/Invoices';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MIS />} />
        <Route path="/mis" element={<MIS />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
