import { useEffect, useState } from "react";
import { FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { AppShell, Card, PageHeader, PageWrap, SoftButton } from "../components/ui";

const BASE = "http://localhost:7250";

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
                <Card>
                    {loading ? (
                        <p className="text-sm text-slate-500">Loading manager data...</p>
                    ) : (
                        <div className="space-y-1 text-sm text-slate-600">
                            <p>Reviews loaded: {reviews.length}</p>
                            <p>Employees loaded: {emps.length}</p>
                            <p>Scorecards loaded: {Object.keys(scorecards).length}</p>
                        </div>
                    )}
                </Card>
            </PageWrap>
        </AppShell>
    );
}

export default Manager;
