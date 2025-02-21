
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Welcome to the Invoice Management System</h1>
        <div className="grid gap-4">
          <Link 
            to="/mis" 
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 w-fit"
          >
            Go to MIS Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
