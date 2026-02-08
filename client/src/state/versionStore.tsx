import { createContext, useContext, useMemo, useState } from "react";
import type { Task } from "@codex/shared";

export type VersionSnapshot = {
  id: string;
  versionNumber: number;
  createdAt: string;
  createdBy: { id: string; email: string };
  snapshot: {
    tasks: Task[];
  };
};

type VersionStoreState = {
  versions: VersionSnapshot[];
  selectedVersionId?: string;
  autoVersionEnabled: boolean;
  addVersion: (snapshot: VersionSnapshot) => void;
  selectVersion: (id?: string) => void;
  toggleAutoVersion: () => void;
  restoreVersion: (id: string) => void;
  createManualVersion: () => void;
};

const VersionStoreContext = createContext<VersionStoreState | undefined>(undefined);

export function VersionStoreProvider({
  children,
  initialVersions = [],
  onRestore,
  onCreateManual
}: {
  children: React.ReactNode;
  initialVersions?: VersionSnapshot[];
  onRestore?: (id: string) => void;
  onCreateManual?: () => void;
}) {
  const [versions, setVersions] = useState<VersionSnapshot[]>(initialVersions);
  const [selectedVersionId, setSelectedVersionId] = useState<string | undefined>(
    initialVersions[0]?.id
  );
  const [autoVersionEnabled, setAutoVersionEnabled] = useState(true);

  const value = useMemo<VersionStoreState>(
    () => ({
      versions,
      selectedVersionId,
      autoVersionEnabled,
      addVersion: (snapshot) => setVersions((prev) => [snapshot, ...prev]),
      selectVersion: (id) => setSelectedVersionId(id),
      toggleAutoVersion: () => setAutoVersionEnabled((prev) => !prev),
      restoreVersion: (id) => onRestore?.(id),
      createManualVersion: () => onCreateManual?.()
    }),
    [versions, selectedVersionId, autoVersionEnabled, onRestore, onCreateManual]
  );

  return (
    <VersionStoreContext.Provider value={value}>
      {children}
    </VersionStoreContext.Provider>
  );
}

export function useVersionStore() {
  const ctx = useContext(VersionStoreContext);
  if (!ctx) {
    throw new Error("useVersionStore must be used within VersionStoreProvider");
  }
  return ctx;
}
