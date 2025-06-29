import React from "react";
import { type Lecture } from "../hooks/useApi";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface LectureListProps {
  lectures: Lecture[];
  loading?: boolean;
  selectedLecture: Lecture | null;
  onLectureSelect: (lecture: Lecture | null) => void;
  editingLecture: Lecture | null;
  editName: string;
  onEditNameChange: (name: string) => void;
  onStartEdit: (lecture: Lecture) => void;
  onCancelEdit: () => void;
  onUpdate: (e: React.FormEvent) => Promise<void>;
  onDelete: (id: number, name: string) => Promise<void>;
  updateMutation: { isPending: boolean };
  deleteMutation: { isPending: boolean };
}

export function LectureList({
  lectures,
  loading,
  selectedLecture,
  onLectureSelect,
  editingLecture,
  editName,
  onEditNameChange,
  onStartEdit,
  onCancelEdit,
  onUpdate,
  onDelete,
  updateMutation,
  deleteMutation,
}: LectureListProps) {
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">All Lectures</h3>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 rounded-lg bg-gray-200"></div>
          ))}
        </div>
      ) : lectures.length === 0 ? (
        <div className="py-8 text-center text-gray-500">
          <p>No lectures found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {lectures.map((lecture) => (
            <div
              key={lecture.id}
              className={`cursor-pointer rounded-lg border-2 bg-white p-4 transition-all hover:shadow-md ${
                selectedLecture?.id === lecture.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200"
              }`}
              onClick={() => onLectureSelect(lecture)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {editingLecture?.id === lecture.id ? (
                    <form
                      onSubmit={onUpdate}
                      onClick={(e) => e.stopPropagation()}
                      className="space-y-2"
                    >
                      <Input
                        type="text"
                        value={editName}
                        onChange={(e) => onEditNameChange(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                        required
                      />
                      <div className="flex space-x-2">
                        <Button
                          type="submit"
                          disabled={updateMutation.isPending}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                          {updateMutation.isPending ? "⏳" : "✓"} Save
                        </Button>
                        <Button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCancelEdit();
                          }}
                          className="rounded bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <Label className="text-lg font-medium text-gray-900">
                        {lecture.name}
                      </Label>
                      <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                        <span>👤 {lecture.createdBy}</span>
                        <span>📅 {formatDate(lecture.createdAt)}</span>
                      </div>
                    </>
                  )}
                </div>
                {editingLecture?.id !== lecture.id && (
                  <div className="ml-4 flex items-center space-x-2">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartEdit(lecture);
                      }}
                      className="rounded bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100"
                    >
                      ✏️ Edit
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(lecture.id, lecture.name);
                      }}
                      disabled={deleteMutation.isPending}
                      className="rounded bg-red-50 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
                    >
                      {deleteMutation.isPending ? "⏳" : "🗑️"} Delete
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
