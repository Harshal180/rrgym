import axios from "axios";
import { useEffect, useState } from "react";
import AlertModal from "../../components/ui/AlertModal";
import { BASE_URL } from "../../services/api";
import useAlert from "../../hooks/useAlert";

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = ["Pending Balances", "Collect Balance", "All Payments", "Stats"];

// ─── Format currency ──────────────────────────────────────────────────────────
const rs = (n) => `Rs. ${Number(n || 0).toLocaleString("en-IN")}`;

// ─── Badge ────────────────────────────────────────────────────────────────────
const Badge = ({ type }) => {
    const map = {
        new:     { label: "New",     bg: "#198754" },
        renewal: { label: "Renewal", bg: "#0d6efd" },
        partial: { label: "Partial", bg: "#fd7e14" },
        balance: { label: "Balance", bg: "#6f42c1" },
    };
    const s = map[type] || { label: type, bg: "#6c757d" };
    return (
        <span style={{ background: s.bg, color: "#fff", borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>
            {s.label}
        </span>
    );
};

export default function Payments() {
    const [tab, setTab] = useState(0);
    const { alert, showAlert, closeAlert } = useAlert();

    // ── Pending tab ──────────────────────────────────────────────────
    const [pending, setPending] = useState([]);
    const [pendingLoading, setPendingLoading] = useState(true);

    // ── Collect balance tab ──────────────────────────────────────────
    const [collectForm, setCollectForm] = useState({ member_id: "", amount: "", payment_method: "Cash", notes: "" });
    const [collectLoading, setCollectLoading] = useState(false);
    const [memberPayments, setMemberPayments] = useState([]);
    const [memberPaymentsLoading, setMemberPaymentsLoading] = useState(false);

    // ── All payments tab ─────────────────────────────────────────────
    const [allPayments, setAllPayments] = useState([]);
    const [allLoading, setAllLoading] = useState(false);
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    // ── Stats tab ────────────────────────────────────────────────────
    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(false);

    // ── Fetch pending on mount ────────────────────────────────────────
    useEffect(() => {
        fetchPending();
    }, []);

    useEffect(() => {
        if (tab === 2) fetchAllPayments();
        if (tab === 3) fetchStats();
    }, [tab]);

    const fetchPending = async () => {
        setPendingLoading(true);
        try {
            const res = await axios.get(`${BASE_URL}/api/payments/pending`, { withCredentials: true });
            setPending(res.data);
        } catch (err) {
            console.error("fetchPending error:", err);
        } finally {
            setPendingLoading(false);
        }
    };

    // FIX: was missing withCredentials — auth cookie not sent → 401/empty response
    const fetchAllPayments = async (from = dateFrom, to = dateTo) => {
        setAllLoading(true);
        try {
            const params = {};
            if (from) params.from = from;
            if (to) params.to = to;
            const res = await axios.get(`${BASE_URL}/api/payments`, { params, withCredentials: true });
            setAllPayments(res.data);
        } catch (err) {
            console.error("fetchAllPayments error:", err);
        } finally {
            setAllLoading(false);
        }
    };

    const fetchStats = async () => {
        setStatsLoading(true);
        try {
            const res = await axios.get(`${BASE_URL}/api/payments/stats`, { withCredentials: true });
            setStats(res.data);
        } catch (err) {
            console.error("fetchStats error:", err);
        } finally {
            setStatsLoading(false);
        }
    };

    // ── Fetch member payments when member_id changes ──────────────────
    const handleMemberIdBlur = async () => {
        if (!collectForm.member_id) return;
        setMemberPaymentsLoading(true);
        try {
            const res = await axios.get(`${BASE_URL}/api/payments/member/${collectForm.member_id}`, { withCredentials: true });
            setMemberPayments(res.data);
            // Pre-fill amount from latest balance
            const latest = res.data.find(p => p.balance_due > 0);
            if (latest) setCollectForm(f => ({ ...f, amount: latest.balance_due }));
        } catch (err) {
            console.error("memberPayments fetch error:", err);
            setMemberPayments([]);
        } finally {
            setMemberPaymentsLoading(false);
        }
    };

    // ── Collect balance ────────────────────────────────────────────────
    const handleCollect = async (e) => {
        e.preventDefault();
        if (!collectForm.member_id || !collectForm.amount) return showAlert("warning", "Required", "Enter member ID and amount.");
        setCollectLoading(true);
        try {
            const res = await axios.post(`${BASE_URL}/api/payments/collect-balance`, collectForm, { withCredentials: true });
            showAlert("success", "Balance Collected!", `Remaining balance: ${rs(res.data.remaining_balance)}`);
            setCollectForm({ member_id: "", amount: "", payment_method: "Cash", notes: "" });
            setMemberPayments([]);
            fetchPending();
        } catch (err) {
            showAlert("error", "Failed", err.response?.data?.message || "Error collecting balance");
        } finally {
            setCollectLoading(false);
        }
    };

    return (
        <>
            <div className="container-fluid mt-4">
                <h3 className="fw-bold mb-4">💳 Payments & Balance Tracking</h3>

                {/* Tabs */}
                <ul className="nav nav-tabs mb-4">
                    {TABS.map((t, i) => (
                        <li className="nav-item" key={i}>
                            <button className={`nav-link ${tab === i ? "active fw-semibold" : ""}`} onClick={() => setTab(i)}>
                                {t}
                                {i === 0 && pending.length > 0 && (
                                    <span className="badge bg-danger ms-2">{pending.length}</span>
                                )}
                            </button>
                        </li>
                    ))}
                </ul>

                {/* ── TAB 0: Pending Balances ───────────────────────────── */}
                {tab === 0 && (
                    <div>
                        {pendingLoading ? <p>Loading...</p> : pending.length === 0 ? (
                            <div className="alert alert-success">✅ No pending balances — all members are paid up!</div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-bordered table-hover align-middle">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>ID</th><th>Name</th><th>Mobile</th>
                                            <th>Plan</th><th>Status</th>
                                            <th>Last Payment</th><th className="text-danger">Balance Due</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pending.map((p) => (
                                            <tr key={p.member_id}>
                                                <td>{p.member_id}</td>
                                                <td className="fw-semibold">{p.first_name} {p.last_name}</td>
                                                <td>{p.mobile}</td>
                                                <td>{p.membership_type}</td>
                                                <td>
                                                    <span className={`badge bg-${p.status === "Active" ? "success" : "danger"}`}>
                                                        {p.status}
                                                    </span>
                                                </td>
                                                <td>{p.last_payment_date ? new Date(p.last_payment_date).toLocaleDateString("en-IN") : "—"}</td>
                                                {/* FIX: balance_due now exists in DB — shows correctly */}
                                                <td className="fw-bold text-danger">{rs(p.total_balance_due)}</td>
                                                <td>
                                                    <button className="btn btn-sm btn-outline-dark"
                                                        onClick={() => {
                                                            setCollectForm(f => ({ ...f, member_id: p.member_id, amount: p.total_balance_due }));
                                                            setTab(1);
                                                        }}>
                                                        Collect
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="table-warning fw-bold">
                                            <td colSpan={6} className="text-end">Total Pending:</td>
                                            <td className="text-danger">{rs(pending.reduce((s, p) => s + Number(p.total_balance_due), 0))}</td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* ── TAB 1: Collect Balance ────────────────────────────── */}
                {tab === 1 && (
                    <div className="row">
                        <div className="col-md-6">
                            <div className="card shadow-sm">
                                <div className="card-body">
                                    <h5 className="card-title fw-bold mb-4">Collect Balance Payment</h5>
                                    <form onSubmit={handleCollect}>
                                        <div className="mb-3">
                                            <label className="form-label">Member ID</label>
                                            <input type="number" className="form-control"
                                                value={collectForm.member_id}
                                                onChange={e => setCollectForm(f => ({ ...f, member_id: e.target.value }))}
                                                onBlur={handleMemberIdBlur}
                                                placeholder="Enter member ID and tab out"
                                            />
                                        </div>

                                        {memberPaymentsLoading && <p className="text-muted small">Loading member payments...</p>}

                                        {memberPayments.length > 0 && (
                                            <div className="mb-3 p-3 bg-light rounded border">
                                                <p className="mb-1 fw-semibold">{memberPayments[0].first_name} {memberPayments[0].last_name}</p>
                                                {memberPayments.filter(p => p.balance_due > 0).map(p => (
                                                    <div key={p.id} className="d-flex justify-content-between small">
                                                        <span>{p.plan_name} ({new Date(p.payment_date).toLocaleDateString("en-IN")})</span>
                                                        <span className="text-danger fw-bold">{rs(p.balance_due)} due</span>
                                                    </div>
                                                ))}
                                                {memberPayments.filter(p => p.balance_due > 0).length === 0 && (
                                                    <p className="text-success mb-0 small">✅ No pending balance</p>
                                                )}
                                            </div>
                                        )}

                                        <div className="mb-3">
                                            <label className="form-label">Amount to Collect (Rs.)</label>
                                            <input type="number" className="form-control"
                                                value={collectForm.amount}
                                                onChange={e => setCollectForm(f => ({ ...f, amount: e.target.value }))}
                                                min={1} placeholder="Enter amount"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Payment Method</label>
                                            <select className="form-select"
                                                value={collectForm.payment_method}
                                                onChange={e => setCollectForm(f => ({ ...f, payment_method: e.target.value }))}>
                                                <option>Cash</option>
                                                <option>UPI</option>
                                                <option>Card</option>
                                                <option>Bank Transfer</option>
                                            </select>
                                        </div>
                                        <div className="mb-4">
                                            <label className="form-label">Notes (optional)</label>
                                            <input type="text" className="form-control"
                                                value={collectForm.notes}
                                                onChange={e => setCollectForm(f => ({ ...f, notes: e.target.value }))}
                                                placeholder="e.g. Paid remaining via UPI"
                                            />
                                        </div>
                                        <button type="submit" className="btn btn-dark w-100" disabled={collectLoading}>
                                            {collectLoading ? "Processing..." : "Collect Payment"}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* Recent payments for this member */}
                        {memberPayments.length > 0 && (
                            <div className="col-md-6">
                                <div className="card shadow-sm">
                                    <div className="card-body">
                                        <h6 className="fw-bold mb-3">Payment History</h6>
                                        {memberPayments.map(p => (
                                            <div key={p.id} className="d-flex justify-content-between align-items-center border-bottom py-2">
                                                <div>
                                                    <Badge type={p.payment_type} />
                                                    <span className="ms-2 small">{p.plan_name}</span>
                                                    <div className="text-muted" style={{ fontSize: 11 }}>
                                                        {new Date(p.payment_date).toLocaleDateString("en-IN")} · {p.payment_method}
                                                    </div>
                                                </div>
                                                <div className="text-end">
                                                    <div className="text-success fw-bold small">{rs(p.paid_amount)} paid</div>
                                                    {/* FIX: balance_due column now exists — shows due amount correctly */}
                                                    {p.balance_due > 0 && <div className="text-danger small fw-semibold">{rs(p.balance_due)} due</div>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── TAB 2: All Payments ───────────────────────────────── */}
                {tab === 2 && (
                    <div>
                        <div className="row g-2 mb-3">
                            <div className="col-auto">
                                <input type="date" className="form-control" value={dateFrom}
                                    onChange={e => setDateFrom(e.target.value)} />
                            </div>
                            <div className="col-auto">
                                <input type="date" className="form-control" value={dateTo}
                                    onChange={e => setDateTo(e.target.value)} />
                            </div>
                            <div className="col-auto">
                                <button className="btn btn-dark" onClick={() => fetchAllPayments(dateFrom, dateTo)}>Filter</button>
                            </div>
                            <div className="col-auto">
                                <button className="btn btn-outline-secondary" onClick={() => { setDateFrom(""); setDateTo(""); fetchAllPayments("", ""); }}>Clear</button>
                            </div>
                        </div>

                        {allLoading ? <p>Loading...</p> : (
                            <div className="table-responsive">
                                <table className="table table-bordered table-hover align-middle">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>#</th><th>Member</th><th>Plan</th><th>Type</th>
                                            <th>Total</th><th>Paid</th>
                                            {/* FIX: "Due" column now shows data — balance_due exists in DB */}
                                            <th>Due</th>
                                            <th>Method</th><th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allPayments.length === 0 ? (
                                            <tr><td colSpan={9} className="text-center text-muted">No payments found</td></tr>
                                        ) : allPayments.map((p) => (
                                            <tr key={p.id}>
                                                <td>{p.id}</td>
                                                <td>
                                                    <div className="fw-semibold">{p.first_name} {p.last_name}</div>
                                                    <div className="text-muted small">{p.mobile}</div>
                                                </td>
                                                <td>{p.plan_name}</td>
                                                <td><Badge type={p.payment_type} /></td>
                                                <td>{rs(p.total_amount)}</td>
                                                <td className="text-success fw-semibold">{rs(p.paid_amount)}</td>
                                                <td>
                                                    {p.balance_due > 0
                                                        ? <span style={{ background: "#dc3545", color: "#fff", borderRadius: 4, padding: "2px 8px", fontSize: 12, fontWeight: 700 }}>
                                                            ⚠️ {rs(p.balance_due)}
                                                          </span>
                                                        : <span className="text-success fw-semibold">✅ Paid</span>
                                                    }
                                                </td>
                                                <td>{p.payment_method}</td>
                                                <td>{new Date(p.payment_date).toLocaleDateString("en-IN")}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    {allPayments.length > 0 && (
                                        <tfoot className="table-light fw-bold">
                                            <tr>
                                                <td colSpan={4} className="text-end">Totals:</td>
                                                <td>{rs(allPayments.reduce((s, p) => s + Number(p.total_amount), 0))}</td>
                                                <td className="text-success">{rs(allPayments.reduce((s, p) => s + Number(p.paid_amount), 0))}</td>
                                                <td className="text-danger">{rs(allPayments.reduce((s, p) => s + Number(p.balance_due), 0))}</td>
                                                <td colSpan={2}></td>
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* ── TAB 3: Stats ─────────────────────────────────────── */}
                {tab === 3 && (
                    <div>
                        {statsLoading || !stats ? <p>Loading...</p> : (
                            <>
                                <div className="row g-3 mb-4">
                                    {[
                                        { label: "Total Billed",    value: rs(stats.summary.total_billed),    color: "#0d6efd" },
                                        { label: "Total Collected", value: rs(stats.summary.total_collected), color: "#198754" },
                                        { label: "Total Pending",   value: rs(stats.summary.total_pending),   color: "#dc3545" },
                                        { label: "Members Billed",  value: stats.summary.members_with_payments, color: "#6f42c1" },
                                    ].map((s, i) => (
                                        <div className="col-md-3" key={i}>
                                            <div className="card text-center shadow-sm" style={{ borderTop: `4px solid ${s.color}` }}>
                                                <div className="card-body">
                                                    <div className="fw-bold fs-4" style={{ color: s.color }}>{s.value}</div>
                                                    <div className="text-muted small mt-1">{s.label}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <h6 className="fw-bold mb-3">Last 6 Months</h6>
                                <div className="table-responsive">
                                    <table className="table table-bordered">
                                        <thead className="table-dark">
                                            <tr><th>Month</th><th>Collected</th><th>Pending</th></tr>
                                        </thead>
                                        <tbody>
                                            {stats.monthly.map((m) => (
                                                <tr key={m.month}>
                                                    <td>{m.month}</td>
                                                    <td className="text-success fw-semibold">{rs(m.collected)}</td>
                                                    <td className={m.pending > 0 ? "text-danger fw-semibold" : "text-muted"}>{rs(m.pending)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            <AlertModal open={alert.open} type={alert.type} title={alert.title} message={alert.message} onClose={closeAlert} />
        </>
    );
}
