
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const NoPracticeInfo = () => {
  return (
    <div className="text-center py-12 bg-gray-50 rounded-lg">
      <h3 className="text-xl font-semibold mb-2">Set up your practice info</h3>
      <p className="text-gray-600 mb-6">
        Please complete your practice information before creating a website.
      </p>
      <Button asChild>
        <Link to="/dashboard">Update Profile</Link>
      </Button>
    </div>
  );
};

export default NoPracticeInfo;
