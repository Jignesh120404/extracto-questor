
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  BarChart,
  Calendar,
  ClipboardList,
} from "lucide-react";

const Sidebar = () => {
  return (
    <div className="w-64 bg-sidebar min-h-screen border-r border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-8">
        <LayoutDashboard className="h-6 w-6" />
        <h1 className="text-xl font-bold">Invoice System</h1>
      </div>
      
      <nav className="space-y-2">
        <Link
          to="/mis"
          className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg bg-accent/50 text-accent-foreground"
        >
          <BarChart className="h-4 w-4" />
          Dashboard
        </Link>
        <Link
          to="#"
          className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-accent/50 text-muted-foreground hover:text-accent-foreground transition-colors"
        >
          <FileText className="h-4 w-4" />
          Invoices
        </Link>
        <Link
          to="#"
          className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-accent/50 text-muted-foreground hover:text-accent-foreground transition-colors"
        >
          <Users className="h-4 w-4" />
          Suppliers
        </Link>
        <Link
          to="#"
          className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-accent/50 text-muted-foreground hover:text-accent-foreground transition-colors"
        >
          <Calendar className="h-4 w-4" />
          Schedule
        </Link>
        <Link
          to="#"
          className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-accent/50 text-muted-foreground hover:text-accent-foreground transition-colors"
        >
          <ClipboardList className="h-4 w-4" />
          Reports
        </Link>
        <Link
          to="#"
          className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-accent/50 text-muted-foreground hover:text-accent-foreground transition-colors"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;
