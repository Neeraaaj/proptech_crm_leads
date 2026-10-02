"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "../api/client";
import { useCreateLead } from "../hooks/useLeads";
import { leadFormSchema, type LeadFormValues } from "../lib/leadFormSchema";
import { LEAD_SOURCES, PROPERTY_TYPES, PROPERTY_TYPE_LABEL, SOURCE_LABEL } from "../types/lead";

export function LeadForm({ onSuccess }: { onSuccess?: () => void }) {
  const createLead = useCreateLead();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<LeadFormValues>({ resolver: zodResolver(leadFormSchema) });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createLead.mutateAsync(values);
      reset();
      onSuccess?.();
    } catch (err) {
      // Server-side validation errors → map back onto the matching fields.
      if (err instanceof ApiError && err.code === "VALIDATION_ERROR" && err.details) {
        for (const [field, msgs] of Object.entries(err.details)) {
          if (msgs?.[0]) setError(field as keyof LeadFormValues, { message: msgs[0] });
        }
      } else {
        setError("root", { message: err instanceof Error ? err.message : "Failed to save lead" });
      }
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
      <Field label="Name" error={errors.name?.message}>
        <input {...register("name")} className={inputCls(errors.name)} placeholder="Aarav Shah" />
      </Field>
      <Field label="Phone" error={errors.phone?.message}>
        <input {...register("phone")} className={inputCls(errors.phone)} placeholder="9876543210" inputMode="tel" />
      </Field>
      <Field label="Email" error={errors.email?.message}>
        <input {...register("email")} type="email" className={inputCls(errors.email)} placeholder="aarav@example.com" />
      </Field>
      <Field label="Budget (₹)" error={errors.budget?.message}>
        <input
          {...register("budget")}
          type="number"
          min={0}
          step={100000}
          className={inputCls(errors.budget)}
          placeholder="7500000"
        />
      </Field>
      <Field label="Location" error={errors.location?.message}>
        <input {...register("location")} className={inputCls(errors.location)} placeholder="Thane West" />
      </Field>
      <Field label="Property type" error={errors.propertyType?.message}>
        <select {...register("propertyType")} defaultValue="" className={inputCls(errors.propertyType)}>
          <option value="" disabled>
            Select…
          </option>
          {PROPERTY_TYPES.map((t) => (
            <option key={t} value={t}>
              {PROPERTY_TYPE_LABEL[t]}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Lead source" error={errors.source?.message}>
        <select {...register("source")} defaultValue="" className={inputCls(errors.source)}>
          <option value="" disabled>
            Select…
          </option>
          {LEAD_SOURCES.map((s) => (
            <option key={s} value={s}>
              {SOURCE_LABEL[s]}
            </option>
          ))}
        </select>
      </Field>

      <div className="flex items-end justify-end gap-2 sm:col-span-2">
        {errors.root && <p className="mr-auto text-sm text-red-600">{errors.root.message}</p>}
        <button type="button" className="btn-secondary" onClick={() => reset()}>
          Clear
        </button>
        <button type="submit" className="btn-primary" disabled={createLead.isPending}>
          {createLead.isPending ? "Saving…" : "Save Lead"}
        </button>
      </div>
    </form>
  );
}

const inputCls = (err?: unknown) => `input ${err ? "input-error" : ""}`;

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
