
import React from 'react';
import MobileLayout from '@/components/MobileLayout';
import MobileSentimentForm from '@/components/mobile/sentiment/MobileSentimentForm';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X } from 'lucide-react';

interface MobileSentimentProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const MobileSentiment: React.FC<MobileSentimentProps> = ({ isOpen = false, onClose }) => {
  // Updated to use dashboard blue colors for the gradient
  const bgGradient = "linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)";
  
  // When used as a standalone page
  if (!isOpen && !onClose) {
    return (
      <MobileLayout 
        title="Feedback Matters" 
        bgColor="bg-[#1E40AF]"
      >
        <div 
          className="min-h-screen -mt-16 pt-16" 
          style={{ background: bgGradient }}
        >
          <MobileSentimentForm />
        </div>
      </MobileLayout>
    );
  }
  
  // When used as a dialog - removed duplicate close button
  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose && onClose()}>
      <DialogContent 
        className="sm:max-w-md p-0 border-0 overflow-hidden h-[90vh] max-h-[90vh]" 
        style={{ background: bgGradient }}
      >
        <div className="relative h-full">
          {/* Only one close button */}
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 text-white bg-white/20 hover:bg-white/30 rounded-full p-1 transition-colors z-10"
          >
            <X className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-semibold text-center text-white pt-4">Feedback Matters</h2>
          <div className="h-[calc(100%-40px)] overflow-hidden">
            <MobileSentimentForm />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MobileSentiment;
