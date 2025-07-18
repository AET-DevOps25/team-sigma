import React from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

interface DocumentEditFormProps {
  editName: string;
  editDescription: string;
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
  onSave: (e: React.FormEvent) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function DocumentEditForm({
  editName,
  editDescription,
  onNameChange,
  onDescriptionChange,
  onSave,
  onCancel,
  isLoading = false,
}: DocumentEditFormProps) {
  return (
    <form
      onSubmit={onSave}
      onClick={(e) => e.stopPropagation()}
      className="space-y-3"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Document Name *
        </label>
        <Input
          type="text"
          value={editName}
          onChange={(e) => onNameChange(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className={`block w-full ${
            editName.length > 100 
              ? 'border-red-500 focus:ring-red-500' 
              : ''
          }`}
          autoFocus
          required
          maxLength={120}
        />
        <div className="flex justify-between mt-1">
          <p className={`text-xs ${
            editName.length > 100 
              ? 'text-red-500' 
              : editName.length > 90 
                ? 'text-yellow-600' 
                : 'text-gray-500'
          }`}>
            {editName.length}/100 characters
          </p>
          {editName.length > 100 && (
            <p className="text-xs text-red-500">Too long!</p>
          )}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <Textarea
          value={editDescription}
          onChange={(e) => onDescriptionChange(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className={`block w-full ${
            editDescription.length > 255 
              ? 'border-red-500 focus:ring-red-500' 
              : ''
          }`}
          rows={2}
          placeholder="Optional description..."
          maxLength={300}
        />
        <div className="flex justify-between mt-1">
          <p className={`text-xs ${
            editDescription.length > 255 
              ? 'text-red-500' 
              : editDescription.length > 230 
                ? 'text-yellow-600' 
                : 'text-gray-500'
          }`}>
            {editDescription.length}/255 characters
          </p>
          {editDescription.length > 255 && (
            <p className="text-xs text-red-500">Too long!</p>
          )}
        </div>
      </div>
      <div className="flex space-x-2">
        <Button
          type="submit"
          disabled={isLoading || !editName.trim() || editName.length > 100 || editDescription.length > 255}
          onClick={(e) => e.stopPropagation()}
          className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? '⏳' : '✓'} Save
        </Button>
        <Button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onCancel();
          }}
          className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
} 