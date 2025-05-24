import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

type CounterState = {
  count: number;
};

type CounterActions = {
  increase: () => void;
  decrease: () => void;
  reset: () => void;
};

export const useCounterStore = create<CounterState & CounterActions>()(
  devtools(
    persist(
      immer((set) => ({
        count: 0,
        increase: () =>
          set((state) => {
            state.count += 1;
          }),
        decrease: () =>
          set((state) => {
            state.count -= 1;
          }),
        reset: () =>
          set((state) => {
            state.count = 0;
          }),
      })),
      { name: "counter-storage" }
    )
  )
);
