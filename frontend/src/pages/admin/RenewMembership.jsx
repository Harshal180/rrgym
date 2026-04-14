import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import GYM_CONFIG from "../../config/gymConfig";
import AlertModal from "../../components/ui/AlertModal";
import { BASE_URL } from "../../services/api";
import useAlert from "../../hooks/useAlert";
import useBillGenerator from "../../hooks/useBillGenerator";
import { useMembers } from "../../context/MembersContext";
const EXPIRY_THRESHOLD_DAYS = 30;

// ─── Bill Action Modal ────────────────────────────────────────────────
const BillActionModal = ({ open, memberName, onDownload, onSendEmail, onClose, isSending }) => {
    if (!open) return null;
    return (
        <div style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
        }}>
            <div style={{
                background: "#fff", borderRadius: "16px", padding: "36px",
                maxWidth: "420px", width: "90%", textAlign: "center",
                boxShadow: "0 20px 60px rgba(0,0,0,0.2)"
            }}>
                <h5 className="fw-bold mb-2">Membership Renewed!</h5>
                <p className="text-muted mb-4">
                    <strong>{memberName}</strong> has been renewed.<br />
                    What would you like to do?
                </p>
                <div className="d-flex flex-column gap-2">
                    <button className="btn btn-dark" onClick={onDownload}>Download Bill</button>
                    <button className="btn btn-outline-dark" onClick={onSendEmail} disabled={isSending}>
                        {isSending ? "Sending..." : "Send Bill to Email"}
                    </button>
                    <button className="btn btn-light" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

// ─── Member Info Card ─────────────────────────────────────────────────
const MemberInfoCard = ({ member }) => {
    if (!member) return null;

    const statusColor = member.isExpired
        ? "danger"
        : member.isExpiringSoon
            ? "warning"
            : "success";

    const statusLabel = member.isExpired
        ? "Expired"
        : member.isExpiringSoon
            ? `Expiring in ${member.daysLeft} day${member.daysLeft === 1 ? "" : "s"}`
            : "Active";

    return (
        <div className="border rounded-3 p-3 mb-3 bg-light d-flex align-items-center gap-3">
            {/* Photo */}
            <div style={{ flexShrink: 0 }}>
                {member.photo ? (
                    <img
                        src={`${BASE_URL}${member.photo}`}
                        alt={member.name}
                        style={{
                            width: 72, height: 72,
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: "2px solid #dee2e6",
                        }}
                        onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                        }}
                    />
                ) : null}
                {/* Fallback avatar */}
                <div style={{
                    width: 72, height: 72,
                    borderRadius: "50%",
                    background: "#343a40",
                    color: "#fff",
                    fontSize: 28,
                    display: member.photo ? "none" : "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    border: "2px solid #dee2e6",
                }}>
                    {member.name?.charAt(0).toUpperCase()}
                </div>
            </div>

            {/* Info */}
            <div className="flex-grow-1">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                    <span className="fw-bold fs-6">{member.name}</span>
                    <span className={`badge bg-${statusColor} text-${statusColor === "warning" ? "dark" : "white"}`}>
                        {statusLabel}
                    </span>
                </div>
                <div className="text-muted small mt-1">
                    📱 {member.mobile} &nbsp;·&nbsp; ✉️ {member.email}
                </div>
                <div className="small mt-1">
                    <span className="text-muted">Current Plan:</span>{" "}
                    <span className="fw-semibold">{member.currentPlan || "—"}</span>
                    <span className="text-muted ms-2">Expires:</span>{" "}
                    <span className={`fw-semibold text-${statusColor === "warning" ? "danger" : statusColor}`}>
                        {member.expiryDateFormatted}
                    </span>
                </div>
                {(member.isExpiringSoon || member.isExpired) && (
                    <div className={`small mt-1 fw-semibold text-${member.isExpired ? "danger" : "warning"}`}>
                        {member.isExpired
                            ? "⚠️ Membership expired — renewal starts from today."
                            : `⏳ Expiring soon — renewal will start from ${member.expiryDateFormatted}.`}
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────
const RenewMembership = () => {
    const navigate = useNavigate();
    const today = new Date().toISOString().split("T")[0];

    const { alert, showAlert, closeAlert } = useAlert();
    const { refreshMembers } = useMembers();
    const { generateBill } = useBillGenerator();

    const [form, setForm] = useState({
        id: "",
        mobile: "",
        membershipType: "",
        startDate: today,
    });

    const [paidAmount, setPaidAmount] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("Cash");

    const [plans, setPlans] = useState([]);
    const [pendingNavigate, setPendingNavigate] = useState(null);
    const [fetchedMember, setFetchedMember] = useState(null);
    const [isFetchingMember, setIsFetchingMember] = useState(false);

    const [billModal, setBillModal] = useState({ open: false, memberName: "" });
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const billDataRef = useRef(null);

    useEffect(() => {
        axios.get(`${BASE_URL}/api/plans`).then((res) => setPlans(res.data));
    }, []);

    // ─── FETCH MEMBER BY ID (on blur) ─────────────────────────────────
    const handleIdBlur = async () => {
        if (!form.id) return;

        setIsFetchingMember(true);
        setFetchedMember(null);

        try {
            const res = await axios.get(`${BASE_URL}/api/members/${form.id}`);
            const m = res.data;

            const todayDate = new Date();
            todayDate.setHours(0, 0, 0, 0);

            const expiryDate = m.end_date ? new Date(m.end_date) : null;
            if (expiryDate) expiryDate.setHours(0, 0, 0, 0);

            const daysLeft = expiryDate
                ? Math.ceil((expiryDate - todayDate) / (1000 * 60 * 60 * 24))
                : null;

            const isExpired = daysLeft !== null && daysLeft < 0;

            // Only auto-set start date if expiring within 10 days (and not yet expired)
            const isExpiringSoon =
                daysLeft !== null && daysLeft >= 0 && daysLeft <= EXPIRY_THRESHOLD_DAYS;

            // Smart start date:
            // - Within 10 days → start from expiry date (seamless, no gap)
            // - Expired or > 10 days left → start from today
            const smartStartDate =
                isExpiringSoon && expiryDate
                    ? expiryDate.toISOString().split("T")[0]
                    : today;

            const expiryDateFormatted = expiryDate
                ? expiryDate.toLocaleDateString("en-IN")
                : "N/A";

            // ✅ Combine first_name + last_name
            // ✅ Prefix image filename with / for correct URL path
            setFetchedMember({
                name: `${m.first_name} ${m.last_name}`,
                mobile: m.mobile,
                email: m.email,
                photo: m.image ? `/uploads/${m.image}` : null,
                currentPlan: m.membership_type,
                expiryDateFormatted,
                daysLeft,
                isExpired,
                isExpiringSoon,
            });

            // Pre-fill mobile + smart start date
            setForm((prev) => ({
                ...prev,
                mobile: m.mobile || prev.mobile,
                startDate: smartStartDate,
            }));

        } catch (err) {
            if (err.response?.status === 404) {
                showAlert("error", "Member Not Found", "No member found with this ID.");
            } else {
                showAlert("error", "Fetch Failed", "Could not load member details.");
            }
        } finally {
            setIsFetchingMember(false);
        }
    };

    const getSelectedPlan = () =>
        plans.find((p) => p.plan_name === form.membershipType) || null;

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleAlertClose = () => {
        closeAlert();
        if (pendingNavigate) {
            navigate(pendingNavigate);
            setPendingNavigate(null);
        }
    };

    // ─── SUBMIT ───────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post(`${BASE_URL}/api/members/renew`, form);
            const data = res.data;

            const selectedPlan = plans.find((p) => p.plan_name === form.membershipType);

            // ✅ fetchedMember.name is now "Sai Patil" not "Member #6"
            const memberName = fetchedMember?.name || data.memberName || `Member #${form.id}`;
            const memberEmail = fetchedMember?.email || data.email;

            const _totalAmtR = selectedPlan ? (selectedPlan.offer_price != null && selectedPlan.offer_price !== '' ? Math.round(Number(selectedPlan.offer_price)) : Math.round(Number(selectedPlan.price))) : 0;
            const _paidAmtR = paidAmount !== "" ? Math.round(Number(paidAmount)) : _totalAmtR;
            const _balanceR = Math.max(0, _totalAmtR - _paidAmtR);
            billDataRef.current = {
                memberId: data.id || form.id,
                memberName,
                email: memberEmail,
                planName: selectedPlan?.plan_name,
                durationMonths: selectedPlan?.duration_months,
                price: Number(selectedPlan?.price || 0),
                offerPrice: selectedPlan?.offer_price
                    ? Number(selectedPlan.offer_price)
                    : null,
                paymentDate: new Date(form.startDate).toLocaleDateString("en-IN"),
                expiryDate: new Date(data.newEndDate).toLocaleDateString("en-IN"),
                paidAmountOverride: _paidAmtR,
                balanceDue: _balanceR,
            };

            // Record payment
            const totalAmt = selectedPlan ? (selectedPlan.offer_price != null && selectedPlan.offer_price !== '' ? Math.round(Number(selectedPlan.offer_price)) : Math.round(Number(selectedPlan.price))) : 0;
            const paidAmt = paidAmount !== "" ? Math.round(Number(paidAmount)) : totalAmt;
            const payType = paidAmt < totalAmt ? "partial" : "renewal";

            try {
                await axios.post(`${BASE_URL}/api/payments`, {
                    member_id: form.id,
                    plan_id: selectedPlan?.id || null,
                    plan_name: selectedPlan?.plan_name || form.membershipType,
                    total_amount: totalAmt,
                    paid_amount: paidAmt,
                    payment_date: form.startDate,
                    payment_method: paymentMethod,
                    payment_type: payType,
                });
            } catch (payErr) {
                console.error("Payment record failed:", payErr);
            }

            refreshMembers();

            setForm({ id: "", mobile: "", membershipType: "", startDate: today });
            setFetchedMember(null);
            setPaidAmount("");

            setBillModal({ open: true, memberName });

        } catch (err) {
            const message = err.response?.data?.message || "Something went wrong";
            if (err.response?.status === 404) {
                setPendingNavigate("/admin/add-member");
                showAlert("error", "Member Not Found", `${message}. Redirecting...`);
            } else {
                showAlert("error", "Renewal Failed", message);
            }
        }
    };

    // ─── DOWNLOAD BILL ────────────────────────────────────────────────
    const handleDownloadBill = () => {
        const data = billDataRef.current;
        if (!data) return;

        generateBill({
            memberId: data.memberId,
            memberName: data.memberName,
            planName: data.planName,
            durationMonths: data.durationMonths,
            price: data.price,
            offerPrice: data.offerPrice,
            paymentDate: data.paymentDate,
            expiryDate: data.expiryDate,
            paidAmountOverride: data.paidAmountOverride,
            balanceDue: data.balanceDue,
            logo: GYM_CONFIG.logoBlack,
        });

        setBillModal({ open: false, memberName: "" });
        showAlert("success", "Bill Downloaded!", "The bill has been downloaded.");
    };

    // ─── SEND EMAIL ───────────────────────────────────────────────────
    const handleSendEmail = async () => {
        const data = billDataRef.current;
        if (!data) return;

        setIsSendingEmail(true);
        try {
            await axios.post(`${BASE_URL}/api/members/${data.memberId}/send-bill`, {
                memberName: data.memberName,
                email: data.email,
                planName: data.planName,
                price: data.offerPrice ?? data.price,
                startDate: data.paymentDate,
                endDate: data.expiryDate,
            });
            setBillModal({ open: false, memberName: "" });
            showAlert("success", "Bill Sent!", `Sent to ${data.email}`);
        } catch {
            showAlert("error", "Email Failed", "Could not send email");
        } finally {
            setIsSendingEmail(false);
        }
    };

    return (
        <>
            <div className="container mt-5">
                <h3 className="fw-bold mb-4">Renew Membership</h3>

                <div className="card shadow-sm">
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>

                            <div className="row g-3 mb-3">
                                <div className="col-md-6">
                                    <label className="form-label">Member ID</label>
                                    <div className="input-group">
                                        <input
                                            type="number"
                                            name="id"
                                            className="form-control"
                                            value={form.id}
                                            onChange={(e) => {
                                                handleChange(e);
                                                setFetchedMember(null);
                                            }}
                                            onBlur={handleIdBlur}
                                            required
                                        />
                                        {isFetchingMember && (
                                            <span className="input-group-text bg-white">
                                                <span className="spinner-border spinner-border-sm text-secondary" />
                                            </span>
                                        )}
                                    </div>
                                    <div className="form-text text-muted small">
                                        Tab out after entering ID to auto-fill member details
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Mobile</label>
                                    <input
                                        type="text"
                                        name="mobile"
                                        className="form-control"
                                        value={form.mobile}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            {/* ✅ Member Info Card */}
                            <MemberInfoCard member={fetchedMember} />

                            <div className="row g-3 mb-3">
                                <div className="col-md-6">
                                    <label className="form-label">Membership Plan</label>
                                    <select
                                        name="membershipType"
                                        className="form-select"
                                        value={form.membershipType}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Plan</option>
                                        {plans.map((p) => (
                                            <option key={p.id} value={p.plan_name}>
                                                {p.plan_name} — Rs.{" "}
                                                {Number(p.price).toLocaleString("en-IN")}{p.offer_price ? ` (Offer: Rs. ${Number(p.offer_price).toLocaleString("en-IN")})` : ""}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label d-flex align-items-center gap-2">
                                        Start Date
                                        {fetchedMember?.isExpiringSoon && (
                                            <span className="badge bg-warning text-dark fw-normal"
                                                style={{ fontSize: "0.7rem" }}>
                                                Auto-set to expiry date
                                            </span>
                                        )}
                                    </label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        className="form-control"
                                        value={form.startDate}
                                        min={today}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            {form.membershipType && getSelectedPlan() && (
                                <div className="mb-3">
                                    <label className="form-label">Amount</label>
                                    <input
                                        type="text"
                                        className="form-control fw-bold text-success"
                                        value={`Rs. ${getEffectivePrice(getSelectedPlan()).toLocaleString("en-IN")}`}
                                        disabled
                                    />
                                    {getSelectedPlan().offer_price != null && getSelectedPlan().offer_price !== "" && (
                                        <div className="form-check mt-2">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id="applyOfferRenew"
                                                checked={applyOffer}
                                                onChange={e => { setApplyOffer(e.target.checked); setPaidAmount(""); }}
                                            />
                                            <label className="form-check-label small" htmlFor="applyOfferRenew">
                                                Apply offer price (Rs. {Number(getSelectedPlan().offer_price).toLocaleString("en-IN")})
                                            </label>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Payment Fields */}
                            {form.membershipType && getSelectedPlan() && (
                                <div className="row g-3 mb-3">
                                    <div className="col-md-6">
                                        <label className="form-label">Amount Paid Now (Rs.)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            placeholder={`Full: Rs. ${getEffectivePrice(getSelectedPlan()).toLocaleString("en-IN")}`}
                                            value={paidAmount}
                                            min={0}
                                            max={getEffectivePrice(getSelectedPlan())}
                                            onChange={e => setPaidAmount(e.target.value === "" ? "" : String(parseInt(e.target.value, 10) || 0))}
                                        />
                                        <div className="form-text">Leave blank for full payment. Enter partial to track balance.</div>
                                        {paidAmount !== "" && Math.round(Number(paidAmount)) < getEffectivePrice(getSelectedPlan()) && (
                                            <div className="text-danger small mt-1 fw-semibold">
                                                ⚠️ Balance due: Rs. {(getEffectivePrice(getSelectedPlan()) - Math.round(Number(paidAmount))).toLocaleString("en-IN")}
                                            </div>
                                        )}
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Payment Method</label>
                                        <select className="form-select" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                                            <option>Cash</option>
                                            <option>UPI</option>
                                            <option>Card</option>
                                            <option>Bank Transfer</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            <div className="text-center">
                                <button type="submit" className="btn btn-dark px-5">
                                    Renew
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>

            <BillActionModal
                open={billModal.open}
                memberName={billModal.memberName}
                onDownload={handleDownloadBill}
                onSendEmail={handleSendEmail}
                onClose={() => setBillModal({ open: false, memberName: "" })}
                isSending={isSendingEmail}
            />

            <AlertModal
                open={alert.open}
                type={alert.type}
                title={alert.title}
                message={alert.message}
                onClose={handleAlertClose}
            />
        </>
    );
};

export default RenewMembership;