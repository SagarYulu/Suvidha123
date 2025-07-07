
import React from 'react';

interface EmptyDataStateProps {
  message: string;
  subMessage?: string;
}

export const EmptyDataState: React.FC<EmptyDataStateProps> = ({ message, subMessage }) => {
  return (
    <div className="text-center text-gray-500 py-8">
      <p>{message}</p>
      {subMessage && <p className="mt-2">{subMessage}</p>}
    </div>
  );
};

export default EmptyDataState;
