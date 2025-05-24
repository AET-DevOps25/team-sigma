import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { data: hello, isLoading } = useQuery({
    queryKey: ["hello"],
    queryFn: async () => {
      const response = await fetch("/api/hello");
      return response.text();
    },
  });

  const [count, setCount] = useState(0);

  return (
    <div className="p-5 font-sans">
      <h1 className="mb-6 text-3xl font-bold">React Counter App</h1>

      {/* Display the message from API */}
      <div className="mb-5">
        <h2 className="mb-2 text-2xl font-semibold">Message from Server:</h2>
        <p className="text-lg text-gray-600">
          {isLoading ? "Loading..." : hello}
        </p>
      </div>

      {/* Counter section */}
      <div className="mb-5">
        <h2 className="mb-2 text-2xl font-semibold">Counter: {count}</h2>
        <div className="mt-2.5 flex gap-2.5">
          <button
            onClick={() => setCount((prev) => prev - 1)}
            className="cursor-pointer rounded bg-red-500 px-5 py-2.5 text-base text-white transition-colors hover:bg-red-600"
          >
            Decrease
          </button>
          <button
            onClick={() => setCount((prev) => prev + 1)}
            className="cursor-pointer rounded bg-green-500 px-5 py-2.5 text-base text-white transition-colors hover:bg-green-600"
          >
            Increase
          </button>
          <button
            onClick={() => setCount(0)}
            className="cursor-pointer rounded bg-blue-500 px-5 py-2.5 text-base text-white transition-colors hover:bg-blue-600"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
