import { useEffect, useState } from "react";
import { FiLogOut, FiUsers } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { getRatingColor } from "../theme/colors";
import {
    AppShell,
    Card,
    CommonGrid,
    PageHeader,
    PageWrap,
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

    const [myRatings, setMyRatings] = useState([]);

    const load = async () => {
        if (!user?.id) return;
        const scorecardRes = await fetch(`${BASE}/scorecard/${user.id}`, {
            headers: { "x-user": user.id }
        });
        const scorecardData = await scorecardRes.json();
        setMyRatings(Array.isArray(scorecardData) ? scorecardData : []);
    };

    useEffect(() => {
        queueMicrotask(() => {
            load();
        });
    }, []);

    return (
        <AppShell>
            <PageWrap max="max-w-6xl">
                <PageHeader
                    title="My Dashboard"
                    right={(
                        <div className="flex items-center gap-2">
                            <SoftButton
                                onClick={() => navigate("/employee/peer-review")}
                                className="flex items-center gap-2"
                            >
                                <FiUsers />
                                Peer Reviews
                            </SoftButton>
                            <SoftButton onClick={logout} className="flex items-center gap-2">
                                <FiLogOut />
                                Logout
                            </SoftButton>
                        </div>
                    )}
                />

                <CommonGrid
                    header="My Ratings"
                    items={myRatings}
                    storageKey="emp-ratings-view"
                    defaultView="card"
                    showTableView={false}
                    exportFileName="My Ratings"
                    cardClassName="grid grid-cols-1 gap-5"
                    empty={(
                        <Card>
                            <p className="text-center text-sm text-slate-500">No ratings received yet</p>
                        </Card>
                    )}
                    getKey={(entry) => entry.id}
                    columns={[
                        { key: "review", header: "Review", getValue: (entry) => `Review #${entry.review_id}` }
                    ]}
                    renderCard={(entry) => (
                        <div
                            key={entry.id}
                            className="rounded-xl border border-violet-100 bg-slate-50/90 p-5 shadow-sm"
                        >
                            <h3 className="mb-4 text-lg font-medium text-slate-800">
                                Review #{entry.review_id}
                            </h3>

                            <div className="space-y-3">
                                {RATING_PARAMS.map((param) => {
                                    const score = Number(entry[param.key] ?? 0);
                                    const width = `${Math.max(0, Math.min(5, score)) / 5 * 100}%`;
                                    const fillColor = getRatingColor(score);

                                    return (
                                        <div key={param.key} className="flex items-center gap-3">
                                            <span className="w-36 shrink-0 text-[12px] text-slate-500">
                                                {param.label}
                                            </span>
                                            <div className="flex flex-1 items-center gap-2">
                                                <div className="h-2 w-full rounded bg-violet-100/70">
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
                                <div className="rounded-md border border-violet-100 bg-violet-50/60 px-3 py-3 text-sm text-slate-700">
                                    {entry.comment ? (
                                        <p className="whitespace-pre-wrap">{entry.comment}</p>
                                    ) : (
                                        <p className="italic text-slate-500">No comment left.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                />
            </PageWrap>
        </AppShell>
    );
}

export default Emp;
