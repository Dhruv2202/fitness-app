import Link from "next/link";
import SubmitButton from "@/components/SubmitButton";
import { saveProfile } from "@/app/profile/actions";
import { GENDER_OPTIONS } from "@/lib/profile";

const inputClass =
  "mt-1 w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink outline-none placeholder:text-muted focus:border-brand";

export default function ProfileDetailsForm({ profile, email }) {
  return (
    <div className="px-4 pb-8 pt-6">
      <Link href="/profile" className="text-sm text-muted">
        ← Back to profile
      </Link>

      <h1 className="mt-2 text-xl font-bold text-ink">Your details</h1>
      <p className="mt-1 text-sm text-muted">
        Signed in as {email}
      </p>

      <form action={saveProfile} className="mt-5 flex flex-col gap-3">
        <input type="hidden" name="redirect_to_profile" value="1" />

        <label className="block">
          <span className="text-xs font-semibold text-ink">Full name</span>
          <input
            type="text"
            name="full_name"
            defaultValue={profile?.full_name ?? ""}
            placeholder="Your name"
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-ink">Date of birth</span>
          <input
            type="date"
            name="date_of_birth"
            defaultValue={profile?.date_of_birth ?? ""}
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-ink">Gender</span>
          <select
            name="gender"
            defaultValue={profile?.gender ?? "undisclosed"}
            className={inputClass}
          >
            {GENDER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-ink">Phone</span>
          <input
            type="tel"
            name="phone"
            defaultValue={profile?.phone ?? ""}
            placeholder="+91 98100 12345"
            className={inputClass}
          />
          <span className="mt-1 block text-xs text-muted">
            Stored for later. Logging in by SMS isn&apos;t switched on yet.
          </span>
        </label>

        <SubmitButton label="Save details" pendingLabel="Saving..." />
      </form>
    </div>
  );
}
