export default function AdminDashboard() {
  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border border-ink/10 rounded-lg p-5 bg-white/40">
          <p className="text-sm text-muted mb-1">Published products</p>
          <p className="text-3xl font-display">—</p>
        </div>
        <div className="border border-ink/10 rounded-lg p-5 bg-white/40">
          <p className="text-sm text-muted mb-1">Hero videos live</p>
          <p className="text-3xl font-display">—</p>
        </div>
        <div className="border border-ink/10 rounded-lg p-5 bg-white/40">
          <p className="text-sm text-muted mb-1">Pending orders</p>
          <p className="text-3xl font-display">—</p>
        </div>
      </div>
      <p className="text-sm text-muted mt-8">
        Counts will populate once Supabase read access is confirmed — see
        the note in the main chat about the pending connector approval.
      </p>
    </div>
  );
}
