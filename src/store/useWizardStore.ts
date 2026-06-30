import { create } from "zustand"

type WizardState = {
  step: number
  businessDetails: any
  brandAssets: any
  socialAccounts: any[]
  competitors: any[]
  designPreferences: any
  contentRequirements: any
  questionnaireAnswers: any[]
  slaDetails: any
  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  updateData: (key: keyof Omit<WizardState, "step" | "setStep" | "nextStep" | "prevStep" | "updateData">, data: any) => void
}

export const useWizardStore = create<WizardState>((set) => ({
  step: 1,
  businessDetails: {},
  brandAssets: {},
  socialAccounts: [],
  competitors: [],
  designPreferences: {},
  contentRequirements: {},
  questionnaireAnswers: [],
  slaDetails: { slaAgreed: false, signature: "" },
  
  setStep: (step) => set({ step }),
  nextStep: () => set((state) => ({ step: state.step + 1 })),
  prevStep: () => set((state) => ({ step: Math.max(1, state.step - 1) })),
  updateData: (key, data) => set((state) => ({ [key]: { ...state[key], ...data } })),
}))
