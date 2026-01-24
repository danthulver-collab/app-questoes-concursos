import { Metadata } from "./metadata";

interface ProviderProps {
  children: React.ReactNode;
}

export function Provider({ children }: ProviderProps) {
  return (
    <>
      <Metadata />
      {children}
    </>
  );
}