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
            </PageWrap>
        </AppShell>
    );
}

export default Emp;