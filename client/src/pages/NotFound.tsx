
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">Page Not Found</h1>
        <p className="text-lg text-gray-600">
          The page you're looking for doesn't exist or has been removed.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button 
            variant="default" 
            asChild
            className="flex items-center gap-2"
          >
            <Link to="/">
              <Home size={18} />
              Go to Home
            </Link>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={18} />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
