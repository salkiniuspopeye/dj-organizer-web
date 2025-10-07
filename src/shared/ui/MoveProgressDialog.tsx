import React from 'react';
import { type MovePlanItem } from '../../core/fs/moveEngine';

interface MoveProgressDialogProps {
  progress: number;
  total: number;
  currentItem: MovePlanItem | null;
  onCancel: () => void;
  isOpen: boolean;
}

export const MoveProgressDialog: React.FC<MoveProgressDialogProps> = ({
  progress,
  total,
  currentItem,
  onCancel,
  isOpen,
}) => {
  if (!isOpen) return null;

  const percentage = total > 0 ? Math.round((progress / total) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-96">
        <h2 className="text-white text-lg font-semibold mb-4">Moving Files...</h2>
        <div className="w-full bg-gray-700 rounded-full h-4 mb-4">
          <div
            className="bg-blue-500 h-4 rounded-full"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <p className="text-white text-sm mb-2">
          {progress} of {total} items processed ({percentage}%)
        </p>
        {currentItem && (
          <p className="text-gray-400 text-xs truncate">
            Moving: {currentItem.track.name} to {currentItem.targetPath}
          </p>
        )}
        <button
          onClick={onCancel}
          className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
