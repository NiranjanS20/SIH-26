const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

let cachedToken: string | null = null;

export async function getDemoToken(): Promise<string> {
    if (cachedToken) return cachedToken;
    const response = await fetch(`${API_BASE_URL}/auth/demo-login`);
    if (!response.ok) {
        throw new Error("Failed to fetch demo token");
    }
    const data = await response.json();
    cachedToken = data.access_token;
    return cachedToken;
}

export async function fetchWorkspaceData(mineId: string) {
    const token = await getDemoToken();
    const response = await fetch(`${API_BASE_URL}/mines/${mineId}/workspace`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    const result = await response.json();
    if (!result.success) {
        throw new Error(result.error?.message || "Failed to fetch workspace data");
    }
    return result.data;
}

export async function simulateWhatIf(equipment: number, delay: number, rainfall: number) {
    const token = await getDemoToken();
    const response = await fetch(`${API_BASE_URL}/whatif/simulate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            equipment_availability_pct: equipment,
            blasting_delay_days: delay,
            precipitation_mm: rainfall
        })
    });
    const result = await response.json();
    if (!result.success) {
        throw new Error(result.error?.message || "Simulation failed");
    }
    return result.data;
}
