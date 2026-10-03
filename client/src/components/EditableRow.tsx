"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Pencil, X } from "lucide-react";
import { ApiError } from "../api/client";
import { useUpdateLead } from "../hooks/useLeads";
import { leadFormSchema, type LeadFormValues } from "../lib/leadFormSchema";

type Field = keyof LeadFormValues;

type Props = {
  leadId: string;
  label: string;
  field: Field;
  /** Raw value used to pre-fill the input, e.g. "9876543210" or "7500000" */
  value: string;
  /** What to show when not editing, e.g. a formatted "₹75 L" or a link */
  display: React.ReactNode;
  /** Pass options to render a <select> instead of a text input */
  options?: Record<string, string>;
  inputType?: "text" | "email" | "tel" | "number";
};

/**
 * Row with a pencil button that turns the value into an input.
 * Enter = save, Escape = cancel. Validates with the same Zod rules as the create form.
 */
export function EditableRow({ leadId, label, field, value, display, options, inputType = "text" }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const updateLead = useUpdateLead(leadId);
  const inputRef = useRef<HTMLInputElement & HTMLSelectElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function startEdit() {
    setDraft(value); // always start from the latest saved value
    setError(null);
    setEditing(true);
  }

  function cancel() {
    setEditing(false);
    setError(null);
  }

  function save() {
    // 1) Validate just this field with the shared form schema
    const result = leadFormSchema.shape[field].safeParse(draft);
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Invalid value");
      return;
    }
    // 2) Nothing changed → just close
    if (String(result.data) === value) return cancel();

    // 3) Send only this field: PATCH { [field]: value }
    updateLead.mutate({ [field]: result.data } as Partial<LeadFormValues>, {
      onSuccess: () => setEditing(false),
      onError: (err) => {
        const fieldMsg = err instanceof ApiError ? err.details?.[field]?.[0] : undefined;
        setError(fieldMsg ?? err.message);
      },
    });
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") save();
    if (e.key === "Escape") cancel();
  };

  return (
    <div className="group grid grid-cols-[140px_1fr] items-start gap-4 text-sm">
      <span className="pt-1.5 text-right text-slate-500">{label}</span>

      {editing ? (
        <div>
          <div className="flex items-center gap-1.5">
            {options ? (
              <select
                ref={inputRef}
                className="input py-1"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKeyDown}
                disabled={updateLead.isPending}
              >
                {Object.entries(options).map(([val, text]) => (
                  <option key={val} value={val}>
                    {text}
                  </option>
                ))}
              </select>
            ) : (
              <input
                ref={inputRef}
                type={inputType}
                className={`input py-1 ${error ? "input-error" : ""}`}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKeyDown}
                disabled={updateLead.isPending}
              />
            )}
            <button className="btn-icon text-emerald-600" onClick={save} disabled={updateLead.isPending} title="Save">
              <Check size={16} />
            </button>
            <button className="btn-icon" onClick={cancel} disabled={updateLead.isPending} title="Cancel">
              <X size={16} />
            </button>
          </div>
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
      ) : (
        <div className="flex min-h-8 items-center gap-2">
          <span className="text-slate-900">{display}</span>
          <button
            onClick={startEdit}
            className="btn-icon h-7 w-7 opacity-0 transition group-hover:opacity-100 focus:opacity-100"
            title={`Edit ${label}`}
            aria-label={`Edit ${label}`}
          >
            <Pencil size={13} />
          </button>
        </div>
      )}
    </div>
  );
}