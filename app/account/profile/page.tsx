"use client";

import { useState, useEffect } from "react";
import { getProfile, updateProfile, changePassword } from "@/lib/api/profile";
import type { WebUser } from "@/lib/api/auth";

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between py-3">
      <span className="text-sm text-ink-mute">{label}</span>
      <span className="text-right text-sm font-medium text-ink">{value || "Not set"}</span>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-6">
      <h2 className="font-semibold text-ink">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<WebUser | null>(null);
  const [editingWhatsapp, setEditingWhatsapp] = useState(false);
  const [whatsapp, setWhatsapp] = useState("");
  const [whatsappStatus, setWhatsappStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [whatsappMsg, setWhatsappMsg] = useState("");

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "" });
  const [showPwForm, setShowPwForm] = useState(false);
  const [pwStatus, setPwStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [pwMsg, setPwMsg] = useState("");

  useEffect(() => {
    getProfile().then((p) => {
      setProfile(p);
      setWhatsapp(p.whatsappNumber ?? "");
    });
  }, []);

  const handleWhatsappSave = async () => {
    setWhatsappStatus("loading");
    try {
      const updated = await updateProfile({ whatsappNumber: whatsapp || null });
      setProfile((p) => p ? { ...p, whatsappNumber: updated.whatsappNumber } : p);
      setWhatsappStatus("success");
      setWhatsappMsg("Saved.");
      setEditingWhatsapp(false);
      setTimeout(() => setWhatsappMsg(""), 2000);
    } catch (err: unknown) {
      setWhatsappStatus("error");
      setWhatsappMsg((err as { message?: string })?.message ?? "Failed to save.");
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwStatus("loading");
    setPwMsg("");
    try {
      const res = await changePassword(pwForm);
      setPwStatus("success");
      setPwMsg(res.message);
      setPwForm({ currentPassword: "", newPassword: "" });
      setTimeout(() => { setPwStatus("idle"); setPwMsg(""); setShowPwForm(false); }, 2500);
    } catch (err: unknown) {
      setPwStatus("error");
      setPwMsg((err as { message?: string })?.message ?? "Failed to update password.");
    }
  };

  if (!profile) return null;

  return (
    <div className="space-y-5">
      <h1 className="font-fraunces text-2xl font-bold text-ink">Profile</h1>

      {/* Account info */}
      <SectionCard title="Account">
        <div className="divide-y divide-ink/8">
          <FieldRow label="Email" value={profile.email} />
          <FieldRow label="Status" value={profile.emailVerified ? "Verified" : "Unverified"} />

          {/* WhatsApp — editable */}
          <div className="flex items-start justify-between py-3">
            <span className="text-sm text-ink-mute">WhatsApp</span>
            {editingWhatsapp ? (
              <div className="flex items-center gap-2">
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+263771234567"
                  className="w-44 rounded-lg border border-ink/15 px-3 py-1.5 text-sm text-ink outline-none focus:border-malachite"
                />
                <button
                  onClick={handleWhatsappSave}
                  disabled={whatsappStatus === "loading"}
                  className="cursor-pointer rounded-lg bg-malachite px-3 py-1.5 text-xs font-semibold text-ink transition-colors duration-200 hover:bg-malachite-deep disabled:opacity-60"
                >
                  {whatsappStatus === "loading" ? "Saving…" : "Save"}
                </button>
                <button
                  onClick={() => { setEditingWhatsapp(false); setWhatsapp(profile.whatsappNumber ?? ""); }}
                  className="cursor-pointer text-xs text-ink-mute hover:text-ink"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-ink">{profile.whatsappNumber || "Not set"}</span>
                <button
                  onClick={() => setEditingWhatsapp(true)}
                  className="cursor-pointer text-xs text-ink-mute underline-offset-2 transition-colors duration-200 hover:text-ink hover:underline"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
          {whatsappMsg && (
            <p className={`py-1 text-xs ${whatsappStatus === "error" ? "text-coral" : "text-malachite"}`}>
              {whatsappMsg}
            </p>
          )}
        </div>
      </SectionCard>

      {/* Security */}
      <SectionCard title="Security">
        {!showPwForm ? (
          <button
            onClick={() => setShowPwForm(true)}
            className="cursor-pointer text-sm font-medium text-ink underline-offset-2 transition-colors duration-200 hover:text-malachite hover:underline"
          >
            Change password
          </button>
        ) : (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-ink">Current password</label>
              <input
                id="currentPassword"
                type="password"
                required
                value={pwForm.currentPassword}
                onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))}
                className="mt-1.5 block w-full rounded-xl border border-ink/15 px-4 py-3 text-sm text-ink outline-none transition-colors duration-200 focus:border-malachite focus:ring-2 focus:ring-malachite/20"
              />
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-ink">New password</label>
              <input
                id="newPassword"
                type="password"
                required
                minLength={8}
                value={pwForm.newPassword}
                onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
                placeholder="Min. 8 characters"
                className="mt-1.5 block w-full rounded-xl border border-ink/15 px-4 py-3 text-sm text-ink outline-none transition-colors duration-200 focus:border-malachite focus:ring-2 focus:ring-malachite/20"
              />
            </div>
            {pwMsg && (
              <p className={`text-sm ${pwStatus === "error" ? "text-coral" : "text-malachite"}`}>{pwMsg}</p>
            )}
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={pwStatus === "loading"}
                className="flex h-10 cursor-pointer items-center rounded-full bg-malachite px-5 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-malachite-deep disabled:opacity-60"
              >
                {pwStatus === "loading" ? "Updating…" : "Update password"}
              </button>
              <button
                type="button"
                onClick={() => { setShowPwForm(false); setPwMsg(""); setPwStatus("idle"); }}
                className="cursor-pointer text-sm text-ink-mute hover:text-ink"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </SectionCard>

      <SectionCard title="Payment methods">
        <p className="text-sm text-ink-mute">
          You pay securely at checkout &mdash; EcoCash, OneMoney, or card via Payonify. We don&rsquo;t store any card details on your account.
        </p>
      </SectionCard>
    </div>
  );
}
