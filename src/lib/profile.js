export const GENDER_OPTIONS = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "other", label: "Other" },
  { value: "undisclosed", label: "Prefer not to say" },
];

export function genderLabel(value) {
  return GENDER_OPTIONS.find((option) => option.value === value)?.label ?? null;
}

export function ageFromDateOfBirth(dateOfBirth) {
  if (!dateOfBirth) return null;

  const born = new Date(dateOfBirth);
  if (Number.isNaN(born.getTime())) return null;

  const now = new Date();
  let age = now.getFullYear() - born.getFullYear();

  const hadBirthdayThisYear =
    now.getMonth() > born.getMonth() ||
    (now.getMonth() === born.getMonth() && now.getDate() >= born.getDate());
  if (!hadBirthdayThisYear) age -= 1;

  return age >= 0 && age < 120 ? age : null;
}
