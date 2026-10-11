const API_BASE = '/api/v1';

export async function fetchDashboardSummary() {
  try {
    const res = await fetch(`${API_BASE}/metrics/summary`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Could not fetch summary, falling back to mock state:', err);
    return null;
  }
}

export async function fetchInitialData() {
  try {
    const res = await fetch(`${API_BASE}/dashboard/bootstrap`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Bootstrap API offline, using local simulator state:', err);
    return null;
  }
}

export async function triggerSimulationEvent(eventType, payload = {}) {
  try {
    const res = await fetch(`${API_BASE}/simulation/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: eventType, ...payload }),
    });
    return await res.json();
  } catch (err) {
    console.error('Simulation trigger failed:', err);
    return { success: false, error: err.message };
  }
}

export async function resolveIncident(incidentId) {
  try {
    const res = await fetch(`${API_BASE}/incidents/${incidentId}/resolve`, {
      method: 'POST',
    });
    return await res.json();
  } catch (err) {
    console.error('Failed to resolve incident:', err);
    return { success: false };
  }
}
