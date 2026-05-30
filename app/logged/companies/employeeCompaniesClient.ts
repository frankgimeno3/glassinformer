export type EmployeeCompaniesPayload = {
  companies: unknown[];
  adminCompanies: unknown[];
};

async function fetchEmployeeCompanies(): Promise<EmployeeCompaniesPayload> {
  const res = await fetch("/api/v1/users/me/employee-companies", { method: "GET" });
  if (!res.ok) throw new Error(`employee-companies ${res.status}`);
  const data = await res.json();

  return {
    companies: Array.isArray(data?.companies) ? data.companies : [],
    adminCompanies: Array.isArray(data?.adminCompanies) ? data.adminCompanies : [],
  };
}

let cachedPromise: Promise<EmployeeCompaniesPayload> | null = null;
let cachedValue: EmployeeCompaniesPayload | null = null;

export function prefetchEmployeeCompanies() {
  if (cachedValue || cachedPromise) return;

  cachedPromise = fetchEmployeeCompanies()
    .then((value) => {
      cachedValue = value;
      return value;
    })
    .catch((err) => {
      cachedPromise = null;
      cachedValue = null;
      throw err;
    });
}

export async function getEmployeeCompanies(): Promise<EmployeeCompaniesPayload> {
  if (cachedValue) return cachedValue;
  if (!cachedPromise) prefetchEmployeeCompanies();
  return cachedPromise!;
}

