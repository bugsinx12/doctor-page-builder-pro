
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import UpdatePracticeInfo from '@/components/website/UpdatePracticeInfo';

const NoPracticeInfo = () => {
  const [showForm, setShowForm] = useState(false);

  if (showForm) {
    return (
      <div>
        <h2 className="text-2xl font-semibold mb-6">Add Your Practice Information</h2>
        <p className="text-gray-600 mb-8">
          Please provide your practice details to create customized websites.
        </p>
        <UpdatePracticeInfo onComplete={() => setShowForm(false)} />
      </div>
    );
  }

  return (
    <Card className="bg-amber-50 border-amber-200">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="text-amber-500 h-5 w-5" />
          <CardTitle>Practice Information Needed</CardTitle>
        </div>
        <CardDescription>
          To create a website, you need to provide your practice information first.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-6">
          Adding your practice name, specialty, and contact information allows us to create
          customized websites that are ready to use with minimal setup.
        </p>
        <Button onClick={() => setShowForm(true)}>
          Add Practice Information
        </Button>
      </CardContent>
    </Card>
  );
};

export default NoPracticeInfo;
