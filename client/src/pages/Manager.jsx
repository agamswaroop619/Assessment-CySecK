import { useEffect, useState } from "react";
import { FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { AppShell, Avatar, Card, CommonEditableGrid, CommonGrid, Input, PageHeader, PageWrap, SoftButton } from "../components/ui";
import { toTitleCaseName } from "../utils/formatName";

const BASE = "http://localhost:7250";
const SCORE_PARAMS = [
    { key: "technicalSkills", label: "Technical Skills" },
    { key: "communication", label: "Communication" },
    { key: "teamwork", label: "Teamwork" },
    { key: "leadership", label: "Leadership" },
    { key: "problemSolving", label: "Problem Solving" },
    { key: "ownership", label: "Ownership" },
    { key: "adaptability", label: "Adaptability" },
    { key: "deliveryQuality", label: "Delivery Quality" }
];

function clampScore(value) {
    const num = Number(value);
    if (!Number.isFinite(num)) return 1;
    const rounded = Math.round(num);
    return Math.min(5, Math.max(1, rounded));
}

function normalizeFormScores(form) {
    const next = { ...form };
    SCORE_PARAMS.forEach((param) => {
        next[param.key] = clampScore(next[param.key]);
    });
    return next;
}

function Manager({ setUser }) {
    const navigate = useNavigate();
    let user = null;
    try {
        const data = localStorage.getItem("user");
        if (data) user = JSON.parse(data);
    } catch {
        user = null;
    }

    const [reviews, setReviews] = useState([]);
    const [emps, setEmps] = useState([]);
    const [scorecards, setScorecards] = useState({});
    const [loading, setLoading] = useState(true);
    const [expandedRevId, setExpandedRevId] = useState(null);
    const [formState, setFormState] = useState({});
    const [isEditing, setIsEditing] = useState({});
    const [submittingByReview, setSubmittingByReview] = useState({});
    const [savedByReview, setSavedByReview] = useState({});
    const [peerFeedbackOpen, setPeerFeedbackOpen] = useState({});
    const [peerFeedbackByReview, setPeerFeedbackByReview] = useState({});
    const [peerFeedbackLoading, setPeerFeedbackLoading] = useState({});

    const logout = () => {
        localStorage.removeItem("user");
        if (setUser) setUser(null);
        navigate("/");
    };

    useEffect(() => {
        const load = async () => {
            if (!user?.id) {
                setLoading(false);
                return;
            }

            setLoading(true);
            const headers = { "x-user": user.id };

            const [reviewsRes, empsRes] = await Promise.all([
                fetch(`${BASE}/revs`, { headers }),
                fetch(`${BASE}/emps`, { headers })
            ]);

            const [reviewsData, empsData] = await Promise.all([
                reviewsRes.json(),
                empsRes.json()
            ]);

            setReviews(reviewsData);
            setEmps(empsData);

            const scorecardEntries = await Promise.all(
                reviewsData.map(async (review) => {
                    const employeeId = review.employee_id ?? review.empId ?? review.emp_id;
                    if (!employeeId) return null;

                    const response = await fetch(`${BASE}/scorecard/${employeeId}`, { headers });
                    const data = await response.json();
                    return [employeeId, data];
                })
            );

            const scorecardMap = {};
            scorecardEntries.forEach((entry) => {
                if (!entry) return;
                const [employeeId, data] = entry;
                scorecardMap[employeeId] = data;
            });
            setScorecards(scorecardMap);
            setLoading(false);
        };

        load();
    }, []);

    const hasManagerRating = (employeeId) => {
        return !!getManagerScorecard(employeeId);
    };

    const getDefaultForm = () => ({
        technicalSkills: 3,
        communication: 3,
        teamwork: 3,
        leadership: 3,
        problemSolving: 3,
        ownership: 3,
        adaptability: 3,
        deliveryQuality: 3,
        comment: ""
    });

    const ensureFormState = (reviewId) => {
        if (formState[reviewId]) return;
        setFormState((prev) => ({ ...prev, [reviewId]: getDefaultForm() }));
    };

    const updateFormField = (reviewId, key, value) => {
        setFormState((prev) => ({
            ...prev,
            [reviewId]: {
                ...(prev[reviewId] ?? getDefaultForm()),
                [key]: value
            }
        }));
    };

    const mapScorecardToForm = (scorecard) => ({
        technicalSkills: scorecard.technical_skills ?? scorecard.technicalSkills ?? 3,
        communication: scorecard.communication ?? 3,
        teamwork: scorecard.teamwork ?? 3,
        leadership: scorecard.leadership ?? 3,
        problemSolving: scorecard.problem_solving ?? scorecard.problemSolving ?? 3,
        ownership: scorecard.ownership ?? 3,
        adaptability: scorecard.adaptability ?? 3,
        deliveryQuality: scorecard.delivery_quality ?? scorecard.deliveryQuality ?? 3,
        comment: scorecard.comment ?? ""
    });

    const getManagerScorecard = (employeeId) => {
        const entry = scorecards[employeeId];
        if (!entry) return null;

        if (Array.isArray(entry)) {
            return entry.find((item) => (item.reviewer_id ?? item.reviewerId) === user?.id) ?? null;
        }

        return (entry.reviewer_id ?? entry.reviewerId) === user?.id ? entry : null;
    };

    const submitRating = async (rev) => {
        if (!user?.id) return;
        const reviewId = rev.id;
        const employeeId = rev.employee_id ?? rev.empId ?? rev.emp_id;
        const reviewForm = normalizeFormScores(formState[reviewId] ?? getDefaultForm());
        const existing = getManagerScorecard(employeeId);
        const editingMode = !!isEditing[reviewId] && !!existing?.id;

        setSubmittingByReview((prev) => ({ ...prev, [reviewId]: true }));
        try {
            const response = await fetch(
                editingMode ? `${BASE}/scorecard/${existing.id}` : `${BASE}/scorecard`,
                {
                    method: editingMode ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-user": user.id
                    },
                    body: JSON.stringify({
                        review_id: reviewId,
                        employee_id: employeeId,
                        reviewer_id: user.id,
                        technical_skills: reviewForm.technicalSkills,
                        communication: reviewForm.communication,
                        teamwork: reviewForm.teamwork,
                        leadership: reviewForm.leadership,
                        problem_solving: reviewForm.problemSolving,
                        ownership: reviewForm.ownership,
                        adaptability: reviewForm.adaptability,
                        delivery_quality: reviewForm.deliveryQuality,
                        comment: reviewForm.comment
                    })
                }
            );
            const created = await response.json();

            setScorecards((prev) => {
                const existingEntries = prev[employeeId];
                if (Array.isArray(existingEntries)) {
                    if (editingMode) {
                        return {
                            ...prev,
                            [employeeId]: existingEntries.map((entry) =>
                                entry.id === created.id ? created : entry
                            )
                        };
                    }
                    const filtered = existingEntries.filter(
                        (entry) => (entry.reviewer_id ?? entry.reviewerId) !== user.id
                    );
                    return { ...prev, [employeeId]: [...filtered, created] };
                }

                return { ...prev, [employeeId]: created };
            });

            setIsEditing((prev) => ({ ...prev, [reviewId]: false }));
            setSavedByReview((prev) => ({ ...prev, [reviewId]: true }));
            setTimeout(() => {
                setSavedByReview((prev) => ({ ...prev, [reviewId]: false }));
            }, 2000);
        } finally {
            setSubmittingByReview((prev) => ({ ...prev, [reviewId]: false }));
        }
    };

    const openReviewForm = (rev, isExpanded) => {
        const nextId = isExpanded ? null : rev.id;
        if (!nextId) {
            setExpandedRevId(null);
            return;
        }

        const employeeId = rev.employee_id ?? rev.empId ?? rev.emp_id;
        const existing = getManagerScorecard(employeeId);
        if (existing) {
            setFormState((prev) => ({
                ...prev,
                [rev.id]: mapScorecardToForm(existing)
            }));
            setIsEditing((prev) => ({ ...prev, [rev.id]: false }));
        } else {
            ensureFormState(rev.id);
            setIsEditing((prev) => ({ ...prev, [rev.id]: true }));
        }
        setExpandedRevId(nextId);
    };

    const togglePeerFeedback = async (reviewId) => {
        const shouldOpen = !peerFeedbackOpen[reviewId];
        setPeerFeedbackOpen((prev) => ({ ...prev, [reviewId]: shouldOpen }));
        if (!shouldOpen || peerFeedbackByReview[reviewId] || peerFeedbackLoading[reviewId]) return;

        setPeerFeedbackLoading((prev) => ({ ...prev, [reviewId]: true }));
        try {
            const response = await fetch(`${BASE}/fb/${reviewId}`, {
                headers: { "x-user": user.id }
            });
            const data = await response.json();
            setPeerFeedbackByReview((prev) => ({ ...prev, [reviewId]: data }));
        } finally {
            setPeerFeedbackLoading((prev) => ({ ...prev, [reviewId]: false }));
        }
    };

    return (
        <AppShell>
            <PageWrap max="max-w-3xl">
                <PageHeader
                    title="Manager Dashboard"
                    right={(
                        <SoftButton onClick={logout} className="flex items-center gap-2">
                            <FiLogOut />
                            Logout
                        </SoftButton>
                    )}
                />
                {loading ? (
                    <Card>
                        <p className="text-sm text-slate-500">Loading manager data...</p>
                    </Card>
                ) : (
                    <CommonGrid
                        header="Reviews"
                        items={reviews}
                        storageKey="manager-reviews-view"
                        defaultView="card"
                        exportFileName="Manager Reviews"
                        cardClassName="grid gap-5 sm:grid-cols-2"
                        empty={(
                            <Card>
                                <p className="text-center text-sm text-slate-500">No reviews assigned</p>
                            </Card>
                        )}
                        getKey={(rev) => rev.id}
                        columns={[
                            { key: "title", header: "Title", getValue: (rev) => rev.title },
                            {
                                key: "employee",
                                header: "Employee",
                                getValue: (rev) => {
                                    const employeeId = rev.employee_id ?? rev.empId ?? rev.emp_id;
                                    const e = emps.find((emp) => emp.id === employeeId);
                                    return e ? toTitleCaseName(e.name) : `Employee #${employeeId}`;
                                },
                                render: (rev) => {
                                    const employeeId = rev.employee_id ?? rev.empId ?? rev.emp_id;
                                    const emp = emps.find((e) => e.id === employeeId);
                                    const name = emp ? toTitleCaseName(emp.name) : `Employee #${employeeId}`;
                                    const avatarUrl =
                                        emp?.avatarUrl ??
                                        `https://i.pravatar.cc/100?u=${encodeURIComponent(String(employeeId))}`;
                                    return (
                                        <span className="inline-flex items-center gap-2">
                                            <Avatar src={avatarUrl} alt={name} size={24} />
                                            <span className="truncate">{name}</span>
                                        </span>
                                    );
                                }
                            },
                            {
                                key: "status",
                                header: "Status",
                                getValue: (rev) => {
                                    const employeeId = rev.employee_id ?? rev.empId ?? rev.emp_id;
                                    return hasManagerRating(employeeId) ? "Rated" : "Pending";
                                }
                            },
                            {
                                key: "open",
                                header: "Open",
                                exportable: false,
                                className: "whitespace-nowrap",
                                render: (rev) => {
                                    const isExpanded = expandedRevId === rev.id;
                                    return (
                                        <button
                                            type="button"
                                            onClick={() => openReviewForm(rev, isExpanded)}
                                            className="rounded-xl border border-violet-200 bg-violet-100/60 px-3 py-1.5 text-xs font-medium text-violet-700 transition hover:bg-violet-200/70"
                                        >
                                            {isExpanded ? "Close" : "Open"}
                                        </button>
                                    );
                                }
                            }
                        ]}
                        renderCard={(rev) => {
                            const employeeId = rev.employee_id ?? rev.empId ?? rev.emp_id;
                            const emp = emps.find((item) => item.id === employeeId);
                            const empName = emp ? toTitleCaseName(emp.name) : `Employee #${employeeId}`;
                            const avatarUrl =
                                emp?.avatarUrl ?? `https://i.pravatar.cc/100?u=${encodeURIComponent(String(employeeId))}`;
                            const isRated = hasManagerRating(employeeId);
                            const isExpanded = expandedRevId === rev.id;
                            const reviewForm = formState[rev.id] ?? getDefaultForm();
                            const isSubmitting = !!submittingByReview[rev.id];
                            const isSaved = !!savedByReview[rev.id];
                            const existingScorecard = getManagerScorecard(employeeId);
                            const canEditFields = !existingScorecard || !!isEditing[rev.id];
                            const feedbackOpen = !!peerFeedbackOpen[rev.id];
                            const feedbackLoading = !!peerFeedbackLoading[rev.id];
                            const feedbackItems = peerFeedbackByReview[rev.id] ?? [];

                            return (
                                <Card className="transition hover:border-violet-200">
                                    <div
                                        onClick={() => openReviewForm(rev, isExpanded)}
                                        className="mb-3 cursor-pointer"
                                    >
                                        <div className="mb-3 flex items-center justify-between gap-2">
                                            <h2 className="text-lg font-medium text-slate-800">{rev.title}</h2>
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                    isRated
                                                        ? "bg-emerald-100/80 text-emerald-500"
                                                        : "bg-amber-100/80 text-amber-500"
                                                }`}
                                            >
                                                {isRated ? "Rated" : "Pending"}
                                            </span>
                                        </div>

                                        <p className="text-sm text-slate-500">
                                            <span className="inline-flex items-center gap-2">
                                                <Avatar src={avatarUrl} alt={empName} size={28} />
                                                <span>
                                                    Reviewing:{" "}
                                                    <span className="font-medium text-slate-800">{empName}</span>
                                                </span>
                                            </span>
                                        </p>
                                    </div>

                                    {isExpanded && (
                                        <div className="mt-4 space-y-4 rounded-2xl border border-violet-100 bg-violet-50/40 p-4">
                                            <CommonEditableGrid
                                                rows={SCORE_PARAMS}
                                                getKey={(param) => param.key}
                                                columns={[
                                                    {
                                                        key: "metric",
                                                        header: "Metric",
                                                        render: (param) => (
                                                            <span className="text-sm font-medium text-slate-700">{param.label}</span>
                                                        )
                                                    },
                                                    {
                                                        key: "score",
                                                        header: "Score",
                                                        renderEdit: (param) => (
                                                            <Input
                                                                type="number"
                                                                min="1"
                                                                max="5"
                                                                step="1"
                                                                inputMode="numeric"
                                                                value={reviewForm[param.key]}
                                                                onChange={(e) =>
                                                                    updateFormField(
                                                                        rev.id,
                                                                        param.key,
                                                                        clampScore(e.target.value)
                                                                    )
                                                                }
                                                                disabled={!canEditFields}
                                                                className="max-w-24"
                                                            />
                                                        )
                                                    },
                                                    {
                                                        key: "value",
                                                        header: "",
                                                        className: "w-12 text-right font-semibold",
                                                        render: (param) => reviewForm[param.key]
                                                    }
                                                ]}
                                                tableWrapClassName="overflow-x-auto rounded-2xl border border-violet-100 bg-slate-50/60"
                                            />

                                            <textarea
                                                rows={3}
                                                placeholder="Add a comment..."
                                                className="w-full resize-none rounded-2xl border border-violet-100 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
                                                value={reviewForm.comment}
                                                onChange={(e) => updateFormField(rev.id, "comment", e.target.value)}
                                                disabled={!canEditFields}
                                            />

                                            <div className="flex items-center justify-between gap-3">
                                                {existingScorecard && !canEditFields && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsEditing((prev) => ({ ...prev, [rev.id]: true }))}
                                                        className="rounded-xl border border-violet-200 bg-violet-100/60 px-4 py-2 text-sm font-medium text-violet-700 transition hover:bg-violet-200/70"
                                                    >
                                                        Edit
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => submitRating(rev)}
                                                    disabled={isSubmitting || !canEditFields}
                                                    className="rounded-xl bg-violet-200 px-4 py-2 text-sm font-medium text-violet-800 transition hover:bg-violet-300 disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    {isSubmitting ? "Submitting..." : existingScorecard ? "Save Changes" : "Submit Rating"}
                                                </button>
                                                <span
                                                    className={`text-sm text-emerald-500 transition-opacity duration-300 ${
                                                        isSaved ? "opacity-100" : "opacity-0"
                                                    }`}
                                                >
                                                    Saved ✓
                                                </span>
                                            </div>

                                            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
                                                <button
                                                    type="button"
                                                    onClick={() => togglePeerFeedback(rev.id)}
                                                    className="text-sm font-medium text-slate-700 transition hover:text-slate-700"
                                                >
                                                    Peer Feedback {feedbackOpen ? "▲" : "▼"}
                                                </button>

                                                {feedbackOpen && (
                                                    <div className="mt-3 space-y-2">
                                                        {feedbackLoading && (
                                                            <p className="text-sm text-slate-500">Loading feedback…</p>
                                                        )}

                                                        {!feedbackLoading && feedbackItems.length === 0 && (
                                                            <p className="text-sm text-slate-500">No peer feedback submitted yet.</p>
                                                        )}

                                                        {!feedbackLoading && feedbackItems.map((fb) => (
                                                            <div
                                                                key={fb.id}
                                                                className="whitespace-pre-wrap rounded-2xl border border-violet-100 bg-violet-50/70 px-3 py-2 text-sm text-slate-700"
                                                            >
                                                                {fb.text}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            );
                        }}
                    />
                )}
            </PageWrap>
        </AppShell>
    );
}

export default Manager;
