import React, { useState } from "react";
import { useUser, SignOutButton } from "@clerk/clerk-react";
import { useNavigate } from "@tanstack/react-router";
import {
  useLecturesByUser,
  useCreateLecture,
  useDeleteLecture,
  useUpdateLecture,
  type Lecture,
  type LectureRequest,
} from "../hooks/useApi";
import { LectureList } from "./LectureList";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface LectureManagerProps {}

export function LectureManager({}: LectureManagerProps) {
  const [lectureName, setLectureName] = useState("");
  const [activeTab, setActiveTab] = useState<"list" | "create">("list");
  const [editingLecture, setEditingLecture] = useState<Lecture | null>(null);
  const [editName, setEditName] = useState("");

  const { isSignedIn, user, isLoaded } = useUser();
  const navigate = useNavigate();

  const { data: lectures, isLoading: lecturesLoading } = useLecturesByUser(user?.id);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 py-8">
        <div>Loading...</div>
      </div>
    );
  }

  if (!isSignedIn || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 py-8">
        <div>Sign in to view this page</div>
      </div>
    );
  }

  const createMutation = useCreateLecture();
  const updateMutation = useUpdateLecture();
  const deleteMutation = useDeleteLecture();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!lectureName.trim()) {
      alert("Please provide a lecture name");
      return;
    }

    const request: LectureRequest = {
      name: lectureName.trim(),
      userId: user.id,
    };

    try {
      await createMutation.mutateAsync(request);

      setLectureName("");
      setActiveTab("list");

      alert("Lecture created successfully!");
    } catch (error) {
      console.error("Create failed:", error);
      alert("Create failed. Please try again.");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!editingLecture || !editName.trim()) {
      return;
    }

    const request: LectureRequest = {
      name: editName.trim(),
      userId: user.id,
    };

    try {
      await updateMutation.mutateAsync({ id: editingLecture.id, request });

      setEditingLecture(null);
      setEditName("");

      alert("Lecture updated successfully!");
    } catch (error) {
      console.error("Update failed:", error);
      alert("Update failed. Please try again.");
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await deleteMutation.mutateAsync(id);

      alert("Lecture deleted successfully!");
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Delete failed. Please try again.");
    }
  };

  const startEdit = (lecture: Lecture) => {
    setEditingLecture(lecture);
    setEditName(lecture.name);
  };

  const cancelEdit = () => {
    setEditingLecture(null);
    setEditName("");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-6xl space-y-8 px-4">
        <div className="mb-4 flex items-center justify-start">
          <div className="flex items-center space-x-4">
            <SignOutButton>
              <Button variant="outline" size="sm">
                Sign Out
              </Button>
            </SignOutButton>
            <span className="text-sm text-gray-600">
              Hello, {user.firstName || user.emailAddresses[0]?.emailAddress}
            </span>
          </div>
        </div>

        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">
            📚 Welcome to Nemo!
          </h1>
          <p className="text-xl text-gray-600">
            Create lectures and upload course materials
          </p>
        </div>

        <div className="overflow-hidden rounded-xl bg-white shadow-lg">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                {
                  key: "list",
                  label: "📋 All Lectures",
                  count: lectures?.length,
                },
                { key: "create", label: "➕ Create" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as "list" | "create")}
                  className={`border-b-2 px-2 py-4 text-sm font-medium ${
                    activeTab === tab.key
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "list" && (
              <LectureList
                lectures={lectures || []}
                loading={lecturesLoading}
                selectedLecture={null}
                onLectureSelect={(lecture) => {
                  if (lecture) {
                    navigate({
                      to: "/documents/$lectureId",
                      params: { lectureId: lecture.id.toString() },
                    });
                  }
                }}
                editingLecture={editingLecture}
                editName={editName}
                onEditNameChange={setEditName}
                onStartEdit={startEdit}
                onCancelEdit={cancelEdit}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                updateMutation={updateMutation}
                deleteMutation={deleteMutation}
              />
            )}

            {activeTab === "create" && (
              <form onSubmit={handleCreate} className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800">
                  Create New Lecture
                </h3>

                <div>
                  <Label className="mb-2 block text-sm font-medium text-gray-700">
                    Lecture Name *
                  </Label>
                  <Input
                    type="text"
                    value={lectureName}
                    onChange={(e) => setLectureName(e.target.value)}
                    placeholder="Enter lecture name..."
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={createMutation.isPending || !lectureName.trim()}
                  className="flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {createMutation.isPending ? (
                    <>
                      <span className="mr-2 animate-spin">⏳</span>
                      Creating...
                    </>
                  ) : (
                    <>➕ Create Lecture</>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
