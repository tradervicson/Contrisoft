import { create } from 'zustand';

interface CostSummary {
  low_cost_per_key: number;
  mid_cost_per_key: number;
  high_cost_per_key: number;
  regional_multiplier: number;
  brand_tier: string;
  created_at: string;
}

interface ProjectState {
  status: string;
  costSummary: CostSummary | null;
  setStatus: (status: string) => void;
  setCostSummary: (cs: CostSummary) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  status: 'draft',
  costSummary: null,
  setStatus: (status) => set({ status }),
  setCostSummary: (costSummary) => set({ costSummary }),
})); 