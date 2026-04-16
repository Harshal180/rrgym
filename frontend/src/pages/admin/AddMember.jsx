import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import GYM_CONFIG from "../../config/gymConfig";
import AlertModal from "../../components/ui/AlertModal";
import { BASE_URL } from "../../services/api";
import useAlert from "../../hooks/useAlert";
import useBillGenerator from "../../hooks/useBillGenerator";
import { useMembers } from "../../context/MembersContext";

// ─── Bill Action Modal ─────────────────────────────────────────────────────────
const BillActionModal = ({ open, memberName, onDownload, onSendEmail, onClose, isSending }) => {
    if (!open) return null;

    return (
        <div style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
        }}>
            <div style={{
                background: "#fff", borderRadius: "16px", padding: "36px 32px",
                maxWidth: "440px", width: "90%",
                boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
                textAlign: "center", animation: "fadeInScale 0.25s ease",
            }}>
                {/* Success Icon */}
                <div style={{
                    width: "72px", height: "72px", borderRadius: "50%",
                    background: "#d4edda", display: "flex", alignItems: "center",
                    justifyContent: "center", margin: "0 auto 20px",
                }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                        stroke="#198754" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </div>

                <h5 style={{ fontWeight: 700, marginBottom: "6px", color: "#1a1a1a" }}>
                    Member Added Successfully!
                </h5>
                <p style={{ color: "#555", fontSize: "14px", marginBottom: "28px" }}>
                    <strong>{memberName}</strong> has been registered.<br />
                    What would you like to do with the bill?
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {/* Download Bill */}
                    <button onClick={onDownload} style={{
                        padding: "12px", borderRadius: "8px", border: "none",
                        background: "#212529", color: "#fff", fontWeight: 600,
                        fontSize: "14px", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Download Bill
                    </button>

                    {/* Send Bill to Email */}
                    <button onClick={onSendEmail} disabled={isSending} style={{
                        padding: "12px", borderRadius: "8px", border: "2px solid #212529",
                        background: "#fff", color: "#212529", fontWeight: 600,
                        fontSize: "14px", cursor: isSending ? "not-allowed" : "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                        opacity: isSending ? 0.7 : 1,
                    }}>
                        {isSending ? (
                            <>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                    <polyline points="22,6 12,13 2,6" />
                                </svg>
                                Send Bill to Email
                            </>
                        )}
                    </button>

                    {/* Close */}
                    <button onClick={onClose} style={{
                        padding: "12px", borderRadius: "8px", border: "none",
                        background: "#f8f9fa", color: "#555", fontWeight: 500,
                        fontSize: "14px", cursor: "pointer",
                    }}>
                        Close
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes fadeInScale {
                    from { opacity: 0; transform: scale(0.92); }
                    to   { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const AddMember = () => {
    const today = new Date().toISOString().split("T")[0];
    const navigate = useNavigate();
    const { alert, showAlert, closeAlert } = useAlert();
    const { refreshMembers } = useMembers();
    const { generateBill } = useBillGenerator();

    const membershipPlans = {
        "1 Month": 1,
        "3 Months": 3,
        "6 Months": 6,
        "1 Year": 12,
    };

    const [member, setMember] = useState({
        firstName: "",
        lastName: "",
        mobile: "",
        email: "",
        age: "",
        height: "",
        weight: "",
        memberType: "",
        membershipType: "",
        startDate: today,
        endDate: "",
        image: null,
    });

    const [paidAmount, setPaidAmount] = useState("");
    const [applyOffer, setApplyOffer] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState("Cash");

    const [plans, setPlans] = useState([]);
    const [billModal, setBillModal] = useState({ open: false, memberName: "" });
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [pendingNavigate, setPendingNavigate] = useState(null);

    // ── Holds full member + plan data fetched from DB ────────────────
    const billDataRef = useRef(null);

    useEffect(() => {
        axios.get(`${BASE_URL}/api/plans`).then((res) => setPlans(res.data));
    }, []);

    // Reset offer toggle and paid amount whenever the selected plan changes
    useEffect(() => {
        setApplyOffer(true);
        setPaidAmount("");
    }, [member.membershipType]);

    const getSelectedPlan = () =>
        plans.find((p) => p.plan_name === member.membershipType) || null;

    // Returns the price that should actually be charged (respects offer toggle)
    const getEffectivePrice = (plan) => {
        if (!plan) return 0;
        if (applyOffer && plan.offer_price != null && plan.offer_price !== "") {
            return Math.round(Number(plan.offer_price));
        }
        return Math.round(Number(plan.price));
    };

    // ─── Helpers ──────────────────────────────────────────────────────
    const capitalize = (str) =>
        str.trim().replace(/\b\w/g, (c) => c.toUpperCase());

    const isAlphaOnly = (str) => /^[a-zA-Z\s]+$/.test(str.trim());
    const isValidIndianMobile = (num) => /^[6-9]\d{9}$/.test(num.trim());
    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

    // ─── Validation ───────────────────────────────────────────────────
    const validate = () => {
        const { firstName, lastName, mobile, email, age, height, weight, memberType, membershipType, image } = member;

        if (!image) { showAlert("warning", "Image Required", "Please upload a profile image."); return false; }
        if (!firstName.trim()) { showAlert("warning", "First Name Required", "Please enter the first name."); return false; }
        if (!isAlphaOnly(firstName)) { showAlert("warning", "Invalid First Name", "First name should contain only letters."); return false; }
        if (!lastName.trim()) { showAlert("warning", "Last Name Required", "Please enter the last name."); return false; }
        if (!isAlphaOnly(lastName)) { showAlert("warning", "Invalid Last Name", "Last name should contain only letters."); return false; }
        if (!mobile.trim()) { showAlert("warning", "Mobile Required", "Please enter a mobile number."); return false; }
        if (!isValidIndianMobile(mobile)) { showAlert("warning", "Invalid Mobile Number", "Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9."); return false; }
        if (!email.trim()) { showAlert("warning", "Email Required", "Please enter an email address."); return false; }
        if (!isValidEmail(email)) { showAlert("warning", "Invalid Email", "Please enter a valid email address."); return false; }
        if (!age || isNaN(age) || age < 10 || age > 100) { showAlert("warning", "Invalid Age", "Please enter a valid age between 10 and 100."); return false; }
        if (!height || isNaN(height) || height < 50 || height > 250) { showAlert("warning", "Invalid Height", "Please enter a valid height between 50 and 250 cm."); return false; }
        if (!weight || isNaN(weight) || weight < 20 || weight > 300) { showAlert("warning", "Invalid Weight", "Please enter a valid weight between 20 and 300 kg."); return false; }
        if (!memberType) { showAlert("warning", "Member Type Required", "Please select a member type."); return false; }
        if (memberType === "Member" && !membershipType) { showAlert("warning", "Plan Required", "Please select a membership plan."); return false; }

        return true;
    };

    // ─── Handlers ─────────────────────────────────────────────────────
    const handleChange = (e) => {
        const { name, value } = e.target;
        setMember((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        setMember((prev) => ({ ...prev, image: e.target.files[0] || null }));
    };

    useEffect(() => {
        if (member.memberType === "Member" && member.membershipType && member.startDate) {
            const months = membershipPlans[member.membershipType];
            const start = new Date(member.startDate);
            const end = new Date(start);
            end.setMonth(start.getMonth() + months);
            setMember((prev) => ({ ...prev, endDate: end.toISOString().split("T")[0] }));
        }
        if (member.memberType === "Trainer") {
            setMember((prev) => ({ ...prev, membershipType: "Trainer", endDate: null }));
        }
    }, [member.memberType, member.membershipType, member.startDate]);

    const handleAlertClose = () => {
        closeAlert();
        if (pendingNavigate) {
            navigate("/admin/renew", { state: pendingNavigate });
            setPendingNavigate(null);
        }
    };

    // ── Download Bill — uses data fetched from DB via ref ─────────────
    const handleDownloadBill = () => {
        const data = billDataRef.current;
        if (!data) {
            showAlert("error", "Bill Error", "Bill data not found. Please try again.");
            return;
        }

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
        showAlert("success", "Bill Downloaded!", "The bill has been downloaded successfully.");
    };

    // ── Send Bill to Email ─────────────────────────────────────────────
    const handleSendEmail = async () => {
        const data = billDataRef.current;
        if (!data) {
            showAlert("error", "Bill Error", "Bill data not found.");
            return;
        }

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
            showAlert("success", "Bill Sent!", `The bill has been sent to ${data.email}.`);
        } catch (err) {
            showAlert("error", "Email Failed",
                err.response?.data?.message || "Could not send the bill. Please try again.");
        } finally {
            setIsSendingEmail(false);
        }
    };

    const handleBillModalClose = () => {
        setBillModal({ open: false, memberName: "" });
        billDataRef.current = null;
    };

    // ─── Submit ───────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        const formData = new FormData();
        const sanitized = {
            ...member,
            firstName: capitalize(member.firstName),
            lastName: capitalize(member.lastName),
        };
        Object.keys(sanitized).forEach((key) => {
            if (sanitized[key] !== null && sanitized[key] !== undefined) {
                formData.append(key, sanitized[key]);
            }
        });

        try {
            // Step 1 — Add member, get back the new DB id
            const res = await axios.post(`${BASE_URL}/api/members/add`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            // ✅ Backend now returns memberId from insertResult.insertId
            const newMemberId = res.data.memberId;
            const isMember = member.memberType === "Member";

            refreshMembers();

            if (isMember && newMemberId) {
                // Step 2 — Fetch full member row + all plans fresh from DB
                const [memberRes, plansRes] = await Promise.all([
                    axios.get(`${BASE_URL}/api/members/${newMemberId}`),
                    axios.get(`${BASE_URL}/api/plans`),
                ]);

                const dbMember = memberRes.data;
                const dbPlans = plansRes.data;

                // DB column names: first_name, last_name, membership_type, start_date, end_date
                const matchedPlan = dbPlans.find(
                    (p) => p.plan_name === dbMember.membership_type
                ) || null;

                const memberName = `${dbMember.first_name} ${dbMember.last_name}`;

                // ── Save to ref — all data from DB, including real id ─
                const _totalAmt2 = matchedPlan ? (applyOffer && matchedPlan.offer_price != null && matchedPlan.offer_price !== '' ? Math.round(Number(matchedPlan.offer_price)) : Math.round(Number(matchedPlan.price))) : 0;
                const _paidAmt2 = paidAmount !== "" ? Math.round(Number(paidAmount)) : _totalAmt2;
                const _balance2 = Math.max(0, _totalAmt2 - _paidAmt2);
                billDataRef.current = {
                    memberId: dbMember.id,                        // ✅ real DB id
                    memberName,
                    email: dbMember.email,
                    planName: matchedPlan?.plan_name ?? dbMember.membership_type,
                    durationMonths: matchedPlan?.duration_months ?? null,
                    price: matchedPlan ? Number(matchedPlan.price) : 0,
                    offerPrice: (applyOffer && matchedPlan?.offer_price) ? Number(matchedPlan.offer_price) : null,
                    paymentDate: new Date(dbMember.start_date).toLocaleDateString("en-IN"),
                    expiryDate: new Date(dbMember.end_date).toLocaleDateString("en-IN"),
                    paidAmountOverride: _paidAmt2,
                    balanceDue: _balance2,
                };

                // Reset form then open bill modal
                setMember({
                    firstName: "", lastName: "", mobile: "", email: "",
                    age: "", height: "", weight: "", memberType: "",
                    membershipType: "", startDate: today, endDate: "", image: null,
                });

                // Record payment
                const totalAmt = matchedPlan
                    ? (applyOffer && matchedPlan.offer_price != null && matchedPlan.offer_price !== '' ? Math.round(Number(matchedPlan.offer_price)) : Math.round(Number(matchedPlan.price)))
                    : 0;
                const paidAmt = paidAmount !== "" ? Math.round(Number(paidAmount)) : totalAmt;
                const payType = paidAmt < totalAmt ? "partial" : "new";

                try {
                    await axios.post(`${BASE_URL}/api/payments`, {
                        member_id: dbMember.id,
                        plan_id: matchedPlan?.id || null,
                        plan_name: matchedPlan?.plan_name ?? dbMember.membership_type,
                        total_amount: totalAmt,
                        paid_amount: paidAmt,
                        payment_date: dbMember.start_date,
                        payment_method: paymentMethod,
                        payment_type: payType,
                    });
                } catch (payErr) {
                    console.error("Payment record failed:", payErr);
                }

                setBillModal({ open: true, memberName });

            } else {
                // Trainer — just show success, no bill
                const memberName = `${capitalize(member.firstName)} ${capitalize(member.lastName)}`;
                setMember({
                    firstName: "", lastName: "", mobile: "", email: "",
                    age: "", height: "", weight: "", memberType: "",
                    membershipType: "", startDate: today, endDate: "", image: null,
                });
                showAlert("success", "Trainer Added!", `${memberName} has been added successfully.`);
            }

        } catch (error) {
            if (error.response?.status === 409 && error.response?.data?.redirectToRenew) {
                setPendingNavigate({
                    id: error.response.data.memberId,
                    mobile: error.response.data.mobile,
                });
                showAlert("warning", "Member Already Exists",
                    `${error.response.data.message}. You will be redirected to renew their membership.`);
            } else {
                showAlert("error", "Failed to Add Member",
                    error.response?.data?.message || "Something went wrong. Please try again.");
            }
        }
    };

    return (
        <>
            <div className="container mt-5">
                <h3 className="fw-bold mb-4">Add New Member</h3>

                <div className="card shadow-sm">
                    <div className="card-body">
                        <form onSubmit={handleSubmit} encType="multipart/form-data">

                            {/* Image Upload */}
                            <div className="mb-4 text-center">
                                <label className="form-label fw-bold">Profile Image</label>
                                <input type="file" className="form-control" accept="image/*"
                                    name="image" onChange={handleImageChange} />
                                {member.image && (
                                    <img src={URL.createObjectURL(member.image)} alt="Preview"
                                        className="mt-3 rounded"
                                        style={{ width: "120px", height: "120px", objectFit: "cover" }} />
                                )}
                            </div>

                            {/* Row 1 */}
                            <div className="row g-3 mb-3">
                                <div className="col-md-4">
                                    <label className="form-label">First Name</label>
                                    <input type="text" name="firstName" className="form-control"
                                        value={member.firstName} onChange={handleChange} placeholder="e.g. Rahul" />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Last Name</label>
                                    <input type="text" name="lastName" className="form-control"
                                        value={member.lastName} onChange={handleChange} placeholder="e.g. Sharma" />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Mobile Number</label>
                                    <div className="input-group">
                                        <span className="input-group-text">🇮🇳 +91</span>
                                        <input type="text" name="mobile" className="form-control"
                                            value={member.mobile}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                                                setMember((prev) => ({ ...prev, mobile: val }));
                                            }}
                                            placeholder="9XXXXXXXXX" maxLength={10} />
                                    </div>
                                </div>
                            </div>

                            <div className="row g-3 mb-3">
                                <div className="col-md-12">
                                    <label className="form-label">Email</label>
                                    <input type="email" name="email" className="form-control"
                                        value={member.email} onChange={handleChange}
                                        placeholder="e.g. rahul@gmail.com" />
                                </div>
                            </div>

                            {/* Row 2 */}
                            <div className="row g-3 mb-3">
                                <div className="col-md-4">
                                    <label className="form-label">Age</label>
                                    <input type="number" name="age" className="form-control"
                                        value={member.age} onChange={handleChange}
                                        placeholder="e.g. 25" min={10} max={100} />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Height (cm)</label>
                                    <input type="number" name="height" className="form-control"
                                        value={member.height} onChange={handleChange}
                                        placeholder="e.g. 175" min={50} max={250} />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Weight (kg)</label>
                                    <input type="number" name="weight" className="form-control"
                                        value={member.weight} onChange={handleChange}
                                        placeholder="e.g. 70" min={20} max={300} />
                                </div>
                            </div>

                            {/* Row 3 */}
                            <div className="row g-3 mb-4">
                                <div className="col-md-4">
                                    <label className="form-label">Member Type</label>
                                    <select name="memberType" className="form-select"
                                        value={member.memberType} onChange={handleChange}>
                                        <option value="">Select Type</option>
                                        <option value="Member">Member</option>
                                        <option value="Trainer">Trainer</option>
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Membership Plan</label>
                                    <select name="membershipType" className="form-select"
                                        value={member.membershipType} onChange={handleChange}
                                        disabled={member.memberType !== "Member"}>
                                        <option value="">Select Plan</option>
                                        {plans.map((p) => (
                                            <option key={p.id} value={p.plan_name}>
                                                {p.plan_name} — Rs. {Number(p.price).toLocaleString("en-IN")}
                                                {p.offer_price ? ` (Offer: Rs. ${Number(p.offer_price).toLocaleString("en-IN")})` : ""}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Start Date</label>
                                    <input type="date" name="startDate" className="form-control"
                                        value={member.startDate} onChange={handleChange}
                                        min={today} disabled={member.memberType !== "Member"} />
                                </div>
                            </div>

                            <div className="row g-3 mb-4">
                                <div className="col-md-4">
                                    <label className="form-label">End Date</label>
                                    <input type="date" className="form-control"
                                        value={member.endDate || ""} disabled />
                                </div>
                                {member.membershipType && getSelectedPlan() && (
                                    <div className="col-md-4">
                                        <label className="form-label">Amount to Pay</label>
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
                                                    id="applyOfferAdd"
                                                    checked={applyOffer}
                                                    onChange={e => { setApplyOffer(e.target.checked); setPaidAmount(""); }}
                                                />
                                                <label className="form-check-label small" htmlFor="applyOfferAdd">
                                                    Apply offer price (Rs. {Number(getSelectedPlan().offer_price).toLocaleString("en-IN")})
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Payment Fields */}
                            {member.memberType === "Member" && member.membershipType && getSelectedPlan() && (
                                <div className="row g-3 mb-4">
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
                                        <div className="form-text">Leave blank to mark as fully paid. Enter partial amount to track balance.</div>
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
                                    Add Member
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>

            {/* Bill Action Modal */}
            <BillActionModal
                open={billModal.open}
                memberName={billModal.memberName}
                onDownload={handleDownloadBill}
                onSendEmail={handleSendEmail}
                onClose={handleBillModalClose}
                isSending={isSendingEmail}
            />

            {/* Standard Alert Modal */}
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

export default AddMember;
