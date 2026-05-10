import { useEffect, useState } from "react";
import { FiFileText, FiSend, FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import {
    AppShell,
    Card,
    PageHeader,
    PageWrap,
    PrimaryButton,
    SoftButton
} from "../components/ui";

const BASE = "http://localhost:7250";
const RATING_PARAMS = [
    { key: "technical_skills", label: "Technical Skills" },
    { key: "communication", label: "Communication" },
    { key: "teamwork", label: "Teamwork" },
    { key: "leadership", label: "Leadership" },
    { key: "problem_solving", label: "Problem Solving" },
    { key: "ownership", label: "Ownership" },
    { key: "adaptability", label: "Adaptability" },
    { key: "delivery_quality", label: "Delivery Quality" }
];

function Emp({ setUser }) {
    const navigate = useNavigate();
    let user = null;
    try {
        const data = localStorage.getItem("user");
        if (data) user = JSON.parse(data);
    } catch {
        user = null;
    }

    const logout = () => {
        localStorage.removeItem("user");
        if (setUser) setUser(null);
        navigate("/");
    };

    const [reviews, setReviews] = useState([]);
    const [feedbacks, setFeedbacks] = useState({});       // draft text per reviewId
    const [alreadyGiven, setAlreadyGiven] = useState({}); // submittedText per reviewId (from server)
    const [myRatings, setMyRatings] = useState([]);

    const load = async () => {
        const res = await fetch(`${BASE}/my-revs/${user.id}`, {
            headers: { "x-user": user.id }
        });
        const data = await res.json();
        setReviews(data);

        // For each review, check if this user already submitted feedback
        const results = await Promise.all(
            data.map(r =>
                fetch(`${BASE}/fb/${r.id}`, { headers: { "x-user": user.id } })
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

        const scorecardRes = await fetch(`${BASE}/scorecard/${user.id}`, {
            headers: { "x-user": user.id }
        });
        const scorecardData = await scorecardRes.json();
        setMyRatings(Array.isArray(scorecardData) ? scorecardData : []);
    };

    useEffect(() => { load(); }, []);

    const submitFeedback = async (id) => {
        if (!feedbacks[id]) return;

        await fetch(BASE + "/fb", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-user": user.id
            },
            body: JSON.stringify({
                reviewId: id,
                fromId: user.id,
                text: feedbacks[id]
            })
        });

        // Move draft into alreadyGiven so it renders as submitted
        setAlreadyGiven(prev => ({ ...prev, [id]: feedbacks[id] }));
    };

    return (
        <AppShell>
            <PageWrap max="max-w-3xl">
                <PageHeader
                    title="My Reviews"
                    right={(
                        <SoftButton onClick={logout} className="flex items-center gap-2">
                            <FiLogOut />
                            Logout
                        </SoftButton>
                    )}
                />

                <div className="space-y-5">
                    {reviews.length === 0 && (
                        <Card>
                            <p className="text-center text-sm text-slate-500">No reviews assigned yet</p>
                        </Card>
                    )}

                    {reviews.map((r) => {
                        const isDone = alreadyGiven[r.id] !== undefined;

                        return (
                            <Card key={r.id}>
                                <div className="mb-3 flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 text-slate-700">
                                        <FiFileText />
                                        <h2 className="text-lg font-medium">{r.title}</h2>
                                    </div>
                                    {isDone && (
                                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                                            Submitted
                                        </span>
                                    )}
                                </div>

                                <p className="mb-4 text-sm text-slate-500">
                                    Reviewing: <span className="font-medium text-slate-800">{r.empName}</span>
                                </p>

                                {isDone ? (
                                    <div className="whitespace-pre-wrap rounded-2xl border border-violet-100 bg-violet-50/60 px-3 py-3 text-sm text-slate-600">
                                        {alreadyGiven[r.id]}
                                    </div>
                                ) : (
                                    <>
                                        <textarea
                                            placeholder="Write your feedback..."
                                            className="mb-3 w-full resize-none rounded-2xl border border-violet-100 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
                                            rows={3}
                                            value={feedbacks[r.id] || ""}
                                            onChange={(e) =>
                                                setFeedbacks({
                                                    ...feedbacks,
                                                    [r.id]: e.target.value
                                                })
                                            }
                                        />
                                        <PrimaryButton
                                            onClick={() => submitFeedback(r.id)}
                                            className="flex w-full items-center justify-center gap-2"
                                        >
                                            <FiSend />
                                            Submit Feedback
                                        </PrimaryButton>
                                    </>
                                )}
                            </Card>
                        );
                    })}
                </div>

                <h2 className="mt-10 mb-6 text-3xl font-semibold tracking-tight text-slate-800">
                    My Ratings
                </h2>

                {myRatings.length === 0 ? (
                    <p className="text-center text-sm text-slate-500">No ratings received yet</p>
                ) : (
                    <div className="space-y-5">
                        {myRatings.map((entry) => (
                            <div
                                key={entry.id}
                                className="rounded-xl border border-gray-100 bg-white p-5 shadow-md"
                            >
                                <h3 className="mb-4 text-lg font-medium text-slate-800">
                                    Review #{entry.review_id}
                                </h3>

                                <div className="space-y-3">
                                    {RATING_PARAMS.map((param) => {
                                        const score = Number(entry[param.key] ?? 0);
                                        const width = `${Math.max(0, Math.min(5, score)) / 5 * 100}%`;
                                        const fillColor = score >= 4 ? "#16a34a" : score >= 3 ? "#f59e0b" : "#ef4444";

                                        return (
                                            <div key={param.key} className="flex items-center gap-3">
                                                <span className="w-36 shrink-0 text-[12px] text-gray-500">
                                                    {param.label}
                                                </span>
                                                <div className="flex flex-1 items-center gap-2">
                                                    <div className="h-2 w-full rounded bg-gray-100">
                                                        <div
                                                            className="h-2 rounded"
                                                            style={{ width, backgroundColor: fillColor }}
                                                        />
                                                    </div>
                                                    <span className="w-6 text-right text-sm text-slate-700">
                                                        {score}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-5">
                                    <p className="mb-2 text-sm font-medium text-slate-700">Manager&apos;s Comment</p>
                                    <div className="rounded-md border border-gray-100 bg-gray-50 px-3 py-3 text-sm text-gray-700">
                                        {entry.comment ? (
                                            <p className="whitespace-pre-wrap">{entry.comment}</p>
                                        ) : (
                                            <p className="italic text-gray-500">No comment left.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </PageWrap>
        </AppShell>
    );
}

export default Emp;