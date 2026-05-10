import { useEffect, useState } from "react";
import { FiArrowLeft, FiFileText, FiSend, FiUserPlus, FiCheckCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import {
    AppShell,
    Avatar,
    Card,
    PageHeader,
    PageWrap,
    PrimaryButton,
    SoftButton
} from "../components/ui";
import { toTitleCaseName } from "../utils/formatName";

const BASE = "http://localhost:7250";

function PeerReview({ setUser }) {
    const navigate = useNavigate();
    let user = null;
    try {
        const data = localStorage.getItem("user");
        if (data) user = JSON.parse(data);
    } catch {
        user = null;
    }

    const [tab, setTab] = useState("assign"); // "assign" | "review"
    const [allReviews, setAllReviews] = useState([]);
    const [emps, setEmps] = useState([]);
    const [feedbacks, setFeedbacks] = useState({});
    const [alreadyGiven, setAlreadyGiven] = useState({});
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState({});
    const [submitting, setSubmitting] = useState({});

    const load = async () => {
        if (!user?.id) { setLoading(false); return; }
        setLoading(true);
        try {
            const headers = { "x-user": user.id };
            const [revsRes, empsRes] = await Promise.all([
                fetch(`${BASE}/revs`, { headers }),
                fetch(`${BASE}/emps`, { headers })
            ]);
            const [revsData, empsData] = await Promise.all([
                revsRes.json(),
                empsRes.json()
            ]);
            setAllReviews(revsData);
            setEmps(empsData);

            // Check which assigned reviews already have feedback from this user
            const assigned = revsData.filter(r => r.assignedTo?.includes(user.id));
            const results = await Promise.all(
                assigned.map(r =>
                    fetch(`${BASE}/fb/${r.id}`, { headers })
                        .then(res => res.json())
                        .then(fbList => {
                            const mine = fbList.find(f => f.fromId === user.id);
                            return { reviewId: r.id, text: mine ? mine.text : null };
                        })
                )
            );
            const given = {};
            results.forEach(({ reviewId, text }) => {
                if (text !== null) given[reviewId] = text;
            });
            setAlreadyGiven(given);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        queueMicrotask(() => { load(); });
    }, []);

    const assignSelf = async (rev) => {
        if (assigning[rev.id]) return;
        setAssigning(prev => ({ ...prev, [rev.id]: true }));
        try {
            const newAssignedTo = [...(rev.assignedTo ?? []), user.id];
            const res = await fetch(`${BASE}/revs/${rev.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "x-user": user.id },
                body: JSON.stringify({ assignedTo: newAssignedTo })
            });
            const updated = await res.json();
            setAllReviews(prev => prev.map(r => r.id === updated.id ? updated : r));
        } finally {
            setAssigning(prev => ({ ...prev, [rev.id]: false }));
        }
    };

    const submitFeedback = async (id) => {
        if (!feedbacks[id] || submitting[id]) return;
        setSubmitting(prev => ({ ...prev, [id]: true }));
        try {
            await fetch(`${BASE}/fb`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-user": user.id },
                body: JSON.stringify({ reviewId: id, fromId: user.id, text: feedbacks[id] })
            });
            setAlreadyGiven(prev => ({ ...prev, [id]: feedbacks[id] }));
            setFeedbacks(prev => { const n = { ...prev }; delete n[id]; return n; });
        } finally {
            setSubmitting(prev => ({ ...prev, [id]: false }));
        }
    };

    const getEmp = (id) => emps.find(e => e.id === id);

    // Reviews where user is NOT the subject and NOT already assigned
    const availableReviews = allReviews.filter(
        r => r.empId !== user?.id && !(r.assignedTo ?? []).includes(user?.id)
    );

    // Reviews where user IS assigned
    const myAssignments = allReviews.filter(r => (r.assignedTo ?? []).includes(user?.id));

    const pendingCount = myAssignments.filter(r => alreadyGiven[r.id] === undefined).length;

    return (
        <AppShell>
            <PageWrap max="max-w-5xl">
                <PageHeader
                    title="Peer Reviews"
                    right={(
                        <SoftButton
                            onClick={() => navigate("/employee")}
                            className="flex items-center gap-2"
                        >
                            <FiArrowLeft />
                            Back to Dashboard
                        </SoftButton>
                    )}
                />

                {/* Tabs */}
                <div className="mb-6 flex gap-1 rounded-2xl border border-violet-100 bg-violet-50/40 p-1 w-fit">
                    <button
                        type="button"
                        onClick={() => setTab("assign")}
                        className={`rounded-xl px-5 py-2 text-sm font-medium transition ${
                            tab === "assign"
                                ? "bg-white text-violet-700 shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                        }`}
                    >
                        Assign Yourself
                        {availableReviews.length > 0 && (
                            <span className="ml-2 rounded-full bg-violet-100 px-2 py-0.5 text-xs text-violet-600">
                                {availableReviews.length}
                            </span>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => setTab("review")}
                        className={`rounded-xl px-5 py-2 text-sm font-medium transition ${
                            tab === "review"
                                ? "bg-white text-violet-700 shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                        }`}
                    >
                        My Assignments
                        {pendingCount > 0 && (
                            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-600">
                                {pendingCount} pending
                            </span>
                        )}
                    </button>
                </div>

                {loading ? (
                    <Card>
                        <p className="text-sm text-slate-500">Loading...</p>
                    </Card>
                ) : tab === "assign" ? (
                    /* ── Assign Yourself tab ── */
                    availableReviews.length === 0 ? (
                        <Card>
                            <p className="text-center text-sm text-slate-500">
                                No open reviews to join right now
                            </p>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {availableReviews.map(r => {
                                const subject = getEmp(r.empId);
                                const subjectName = subject
                                    ? toTitleCaseName(subject.name)
                                    : `Employee #${r.empId}`;
                                const avatarSrc =
                                    subject?.avatarUrl ||
                                    `https://i.pravatar.cc/100?u=${encodeURIComponent(String(r.empId))}`;
                                const isAssigning = !!assigning[r.id];

                                return (
                                    <Card key={r.id}>
                                        <div className="mb-3 flex items-center gap-2 text-slate-700">
                                            <FiFileText />
                                            <h2 className="text-lg font-medium">{r.title}</h2>
                                        </div>

                                        <p className="mb-1 text-sm text-slate-500">
                                            <span className="inline-flex items-center gap-2">
                                                <Avatar src={avatarSrc} alt={subjectName} size={26} />
                                                <span>
                                                    Subject:{" "}
                                                    <span className="font-medium text-slate-800">{subjectName}</span>
                                                </span>
                                            </span>
                                        </p>

                                        <p className="mb-4 text-xs text-slate-400">
                                            {(r.assignedTo ?? []).length} reviewer{(r.assignedTo ?? []).length !== 1 ? "s" : ""} assigned
                                        </p>

                                        <PrimaryButton
                                            onClick={() => assignSelf(r)}
                                            disabled={isAssigning}
                                            className="flex w-full items-center justify-center gap-2"
                                        >
                                            <FiUserPlus />
                                            {isAssigning ? "Joining..." : "Join as Reviewer"}
                                        </PrimaryButton>
                                    </Card>
                                );
                            })}
                        </div>
                    )
                ) : (
                    /* ── My Assignments tab ── */
                    myAssignments.length === 0 ? (
                        <Card>
                            <p className="text-center text-sm text-slate-500">
                                You haven&apos;t joined any reviews yet
                            </p>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {myAssignments.map(r => {
                                const subject = getEmp(r.empId);
                                const subjectName = subject
                                    ? toTitleCaseName(subject.name)
                                    : `Employee #${r.empId}`;
                                const avatarSrc =
                                    subject?.avatarUrl ||
                                    `https://i.pravatar.cc/100?u=${encodeURIComponent(String(r.empId))}`;
                                const isDone = alreadyGiven[r.id] !== undefined;
                                const isSubmitting = !!submitting[r.id];

                                return (
                                    <Card key={r.id}>
                                        <div className="mb-3 flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2 text-slate-700">
                                                <FiFileText />
                                                <h2 className="text-lg font-medium">{r.title}</h2>
                                            </div>
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                    isDone
                                                        ? "bg-emerald-100/80 text-emerald-500"
                                                        : "bg-amber-100/80 text-amber-500"
                                                }`}
                                            >
                                                {isDone ? "Submitted" : "Pending"}
                                            </span>
                                        </div>

                                        <p className="mb-4 text-sm text-slate-500">
                                            <span className="inline-flex items-center gap-2">
                                                <Avatar src={avatarSrc} alt={subjectName} size={28} />
                                                <span>
                                                    Reviewing:{" "}
                                                    <span className="font-medium text-slate-800">{subjectName}</span>
                                                </span>
                                            </span>
                                        </p>

                                        {isDone ? (
                                            <div className="flex items-start gap-2 whitespace-pre-wrap rounded-2xl border border-violet-100 bg-violet-50/60 px-3 py-3 text-sm text-slate-600">
                                                <FiCheckCircle className="mt-0.5 shrink-0 text-emerald-500" />
                                                {alreadyGiven[r.id]}
                                            </div>
                                        ) : (
                                            <>
                                                <textarea
                                                    placeholder="Write your feedback..."
                                                    className="mb-3 w-full resize-none rounded-2xl border border-violet-100 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
                                                    rows={4}
                                                    value={feedbacks[r.id] || ""}
                                                    onChange={(e) =>
                                                        setFeedbacks(prev => ({ ...prev, [r.id]: e.target.value }))
                                                    }
                                                />
                                                <PrimaryButton
                                                    onClick={() => submitFeedback(r.id)}
                                                    disabled={!feedbacks[r.id] || isSubmitting}
                                                    className="flex w-full items-center justify-center gap-2"
                                                >
                                                    <FiSend />
                                                    {isSubmitting ? "Submitting..." : "Submit Feedback"}
                                                </PrimaryButton>
                                            </>
                                        )}
                                    </Card>
                                );
                            })}
                        </div>
                    )
                )}
            </PageWrap>
        </AppShell>
    );
}

export default PeerReview;
