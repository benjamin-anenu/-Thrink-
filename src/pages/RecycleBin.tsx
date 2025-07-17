
import React from 'react';
import Header from '@/components/Header';
import TinkAssistant from '@/components/TinkAssistant';
import RecycleBin from '@/components/RecycleBin';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RecycleBinPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/projects')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Recycle Bin</h1>
            <p className="text-muted-foreground">
              Manage deleted projects - items will be permanently removed after 48 hours
            </p>
          </div>
        </div>

        <RecycleBin />
      </main>
      <TinkAssistant />
    </div>
  );
};

export default RecycleBinPage;
