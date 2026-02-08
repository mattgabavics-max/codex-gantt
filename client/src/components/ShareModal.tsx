import { useMemo, useState } from "react";
import type { ShareLink } from "@codex/shared";

type AccessType = "readonly" | "editable";

type ShareModalProps = {
  isOpen: boolean;
  projectId: string;
  links: ShareLink[];
  onClose: () => void;
  onCreateLink: (payload: { accessType: AccessType; expiresIn?: number }) => Promise<void>;
  onRevokeLink: (linkId: string) => Promise<void>;
};

const expiryOptions = [
  { label: "24 hours", value: 24 * 60 * 60 },
  { label: "7 days", value: 7 * 24 * 60 * 60 },
  { label: "30 days", value: 30 * 24 * 60 * 60 },
  { label: "Never", value: undefined }
];

function formatExpiry(date?: string | null) {
  if (!date) return "Never";
  return new Date(date).toLocaleString();
}

/**
 * Modal UI for creating, listing, copying, and revoking share links.
 */
export default function ShareModal({
  isOpen,
  projectId,
  links,
  onClose,
  onCreateLink,
  onRevokeLink
}: ShareModalProps) {
  const [accessType, setAccessType] = useState<AccessType>("readonly");
  const [expiresIn, setExpiresIn] = useState<number | undefined>(
    expiryOptions[1].value
  );
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const baseUrl = useMemo(() => window.location.origin, []);

  if (!isOpen) return null;

  async function handleCreate() {
    setBusy(true);
    await onCreateLink({ accessType, expiresIn });
    setBusy(false);
  }

  async function handleCopy(token: string) {
    const url = `${baseUrl}/share/${token}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopyStatus("Copied!");
    } catch {
      setCopyStatus("Copy failed");
    }
    window.setTimeout(() => setCopyStatus(null), 2000);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40"
      role="dialog"
      aria-modal="true"
      aria-label="Share project"
    >
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Share project
            </p>
            <h2 className="text-xl font-semibold text-slate-900">
              Generate shareable link
            </h2>
          </div>
          <button
            className="rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            onClick={onClose}
            type="button"
            aria-label="Close share modal"
          >
            Close
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Access
            </label>
            <div className="flex rounded-full border border-slate-200 bg-white p-1">
              {(["readonly", "editable"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setAccessType(value)}
                  className={`flex-1 rounded-full px-3 py-2 text-xs font-semibold ${
                    accessType === value ? "bg-ink text-white" : "text-slate-500"
                  }`}
                  aria-label={`Set access to ${value}`}
                >
                  {value === "readonly" ? "Readonly" : "Editable"}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Expiration
            </label>
            <select
              className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
              value={expiresIn ?? "never"}
              onChange={(event) => {
                const value = event.target.value;
                setExpiresIn(value === "never" ? undefined : Number(value));
              }}
              aria-label="Expiration"
            >
              {expiryOptions.map((option) => (
                <option key={option.label} value={option.value ?? "never"}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              className="w-full rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              onClick={handleCreate}
              disabled={busy}
              type="button"
              aria-label="Generate share link"
            >
              {busy ? "Generating..." : "Generate link"}
            </button>
          </div>
        </div>

        {copyStatus && (
          <p className="mt-4 text-sm text-emerald-600">{copyStatus}</p>
        )}

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-slate-700">Existing links</h3>
          <div className="mt-3 space-y-2">
            {links.length === 0 && (
              <p className="text-xs text-slate-500">
                No share links created yet.
              </p>
            )}
            {links.map((link) => (
              <div
                key={link.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-700">
                    {link.accessType === "editable" ? "Editable" : "Readonly"} link
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Expires: {formatExpiry(link.expiresAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                    onClick={() => handleCopy(link.token)}
                    aria-label="Copy share link"
                  >
                    Copy link
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-rose-200 px-3 py-1 text-xs text-rose-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400"
                    onClick={() => onRevokeLink(link.id)}
                    aria-label="Revoke share link"
                  >
                    Revoke
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-slate-400">
            Project ID: {projectId}
          </p>
        </div>
      </div>
    </div>
  );
}
