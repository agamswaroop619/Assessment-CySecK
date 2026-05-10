import { useEffect, useMemo, useState } from "react";
import { FiLogOut } from "react-icons/fi";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    LabelList,
    ResponsiveContainer,
    XAxis,
    YAxis
} from "recharts";
import { useNavigate } from "react-router-dom";
import { AppShell, Card, CommonGrid, PageHeader, PageWrap, SoftButton } from "../components/ui";
import { getChartTheme, getRatingColor } from "../theme/colors";

const BASE = "http://localhost:7250";
const PARAM_CONFIG = [
    { label: "Technical Skills", key: "technical_skills" },
    { label: "Communication", key: "communication" },
    { label: "Teamwork", key: "teamwork" },
    { label: "Leadership", key: "leadership" },
    { label: "Problem Solving", key: "problem_solving" },
    { label: "Ownership", key: "ownership" },
    { label: "Adaptability", key: "adaptability" },
    { label: "Delivery Quality", key: "delivery_quality" }
];
const PARAM_LABELS = PARAM_CONFIG.reduce((acc, item) => {
    acc[item.key] = item.label;
    return acc;
}, {});

function HR({ setUser }) {
    const navigate = useNavigate();
    let user = null;
    try {
        const data = localStorage.getItem("user");
        if (data) user = JSON.parse(data);
    } catch {
        user = null;
    }

    const [emps, setEmps] = useState([]);
    const [selectedDept, setSelectedDept] = useState("");
    const [deptSummary, setDeptSummary] = useState({});
    const [employeeGaps, setEmployeeGaps] = useState({});
    const [openComments, setOpenComments] = useState({});
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
            const res = await fetch(`${BASE}/emps`, { headers: { "x-user": user.id } });
            const data = await res.json();
            setEmps(data);
            setLoading(false);
        };
        load();
    }, []);

    useEffect(() => {
        const loadDeptAnalytics = async () => {
            if (!user?.id || !selectedDept) {
                setDeptSummary({});
                setEmployeeGaps({});
                return;
            }

            setLoading(true);
            const headers = { "x-user": user.id };
            const filteredEmployees = emps.filter((emp) => emp.dept === selectedDept);

            const summaryRes = await fetch(
                `${BASE}/scorecard/dept-summary?dept=${encodeURIComponent(selectedDept)}`,
                { headers }
            );
            const summaryData = await summaryRes.json();
            setDeptSummary(summaryData);

            const gapEntries = await Promise.all(
                filteredEmployees.map(async (emp) => {
                    const response = await fetch(`${BASE}/scorecard/gaps/${emp.id}`, { headers });
                    const data = await response.json();
                    return [emp.id, data];
                })
            );

            const gapsMap = {};
            gapEntries.forEach(([employeeId, data]) => {
                gapsMap[employeeId] = data;
            });
            setEmployeeGaps(gapsMap);
            setLoading(false);
        };

        loadDeptAnalytics();
    }, [selectedDept, emps]);

    const departments = useMemo(
        () => [...new Set(emps.map((e) => e.dept).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
        [emps]
    );
    const chartData = useMemo(() => {
        const averages = deptSummary?.averages ?? {};
        return PARAM_CONFIG.map((item) => ({
            name: item.label,
            value: Number(averages[item.key] ?? 0)
        }));
    }, [deptSummary]);
    const employeesInDept = useMemo(
        () => emps.filter((emp) => emp.dept === selectedDept),
        [emps, selectedDept]
    );

    const chartTheme = useMemo(() => getChartTheme(), []);
    const getBarColor = (avgValue) => getRatingColor(avgValue);

    const getGapLabel = (gapItem) => {
        const raw =
            gapItem.parameter ??
            gapItem.param ??
            gapItem.metric ??
            gapItem.key ??
            "";
        const normalized = String(raw).trim().toLowerCase().replace(/\s+/g, "_");
        return PARAM_LABELS[normalized] ?? raw ?? "Unknown";
    };

    const renderEmployeeGaps = (emp, view) => {
        const gaps = employeeGaps[emp.id]?.gaps ?? null;
        const improvementItems = Array.isArray(gaps)
            ? gaps.filter((item) => item.needs_improvement)
            : [];

        return (
            <div
                className={
                    view === "card"
                        ? "rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm"
                        : "rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                }
            >
                <div className="flex flex-wrap items-center gap-2">
                    <p className="mr-2 text-sm font-medium text-slate-800">{emp.name}</p>
                    {gaps === null ? (
                        <p className="text-xs text-slate-500">No ratings yet</p>
                    ) : improvementItems.length === 0 ? (
                        <p className="text-xs text-slate-500">No improvement flags</p>
                    ) : (
                        improvementItems.map((item, idx) => (
                            <span
                                key={`${emp.id}-${idx}`}
                                className="rounded-full bg-rose-100/80 px-2.5 py-1 text-xs font-medium text-rose-500"
                            >
                                {getGapLabel(item)}
                            </span>
                        ))
                    )}
                </div>

                <button
                    type="button"
                    onClick={() =>
                        setOpenComments((prev) => ({
                            ...prev,
                            [emp.id]: !prev[emp.id]
                        }))
                    }
                    className="mt-2 text-xs font-medium text-slate-600 transition hover:text-slate-700"
                >
                    {openComments[emp.id] ? "▼" : "▶"} Comments ({(employeeGaps[emp.id]?.comments ?? []).length})
                </button>

                {openComments[emp.id] && (
                    <div className="mt-2 space-y-2">
                        {(employeeGaps[emp.id]?.comments ?? []).length === 0 ? (
                            <p className="text-xs text-slate-500">No comments yet</p>
                        ) : (
                            (employeeGaps[emp.id]?.comments ?? []).map((comment, idx) => (
                                <div
                                    key={`${emp.id}-comment-${idx}`}
                                    className="whitespace-pre-wrap rounded-2xl border border-violet-100 bg-violet-50/60 px-3 py-3 text-sm text-slate-600"
                                >
                                    {typeof comment === "string" ? comment : comment?.text ?? ""}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <AppShell>
            <PageWrap max="max-w-3xl">
                <PageHeader
                    title="HR Dashboard"
                    right={(
                        <SoftButton onClick={logout} className="flex items-center gap-2">
                            <FiLogOut />
                            Logout
                        </SoftButton>
                    )}
                />
                <select
                    id="dept-filter"
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="mb-4 w-full rounded-2xl border border-violet-100 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
                >
                    <option value="" disabled>
                        Select a department
                    </option>
                    {departments.map((dept) => (
                        <option key={dept} value={dept}>
                            {dept}
                        </option>
                    ))}
                </select>
                <Card>
                    {!selectedDept ? (
                        <p className="text-sm text-slate-500">Select a department to view analytics</p>
                    ) : loading ? (
                        <p className="text-sm text-slate-500">Loading…</p>
                    ) : !deptSummary?.averages ? (
                        <p className="text-sm text-slate-500">No summary available for this department.</p>
                    ) : (
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-slate-700">
                                {selectedDept} Department Averages ({deptSummary.employee_count ?? 0} employees)
                            </h3>
                            <div className="h-[360px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 28, left: 12, bottom: 8 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                                        <XAxis type="number" domain={[0, 5]} tick={{ fill: chartTheme.xAxis, fontSize: 12 }} />
                                        <YAxis dataKey="name" type="category" width={130} tick={{ fill: chartTheme.yAxis, fontSize: 12 }} />
                                        <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                                            {chartData.map((entry) => (
                                                <Cell key={entry.name} fill={getBarColor(entry.value)} />
                                            ))}
                                            <LabelList
                                                dataKey="value"
                                                position="right"
                                                formatter={(value) => Number(value).toFixed(2)}
                                                fill={chartTheme.label}
                                                fontSize={12}
                                            />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <p className="text-xs text-slate-500">
                                Employee gap entries loaded: {Object.keys(employeeGaps).length}
                            </p>
                            <CommonGrid
                                header="Employees"
                                items={employeesInDept}
                                storageKey="hr-employee-gaps-view"
                                defaultView="list"
                                empty={<p className="py-2 text-sm text-slate-500">No employees found in this department.</p>}
                                getKey={(emp) => emp.id}
                                listClassName="space-y-2"
                                cardClassName="grid gap-3 sm:grid-cols-2"
                                renderRow={(emp) => renderEmployeeGaps(emp, "list")}
                                renderCard={(emp) => renderEmployeeGaps(emp, "card")}
                            />
                        </div>
                    )}
                </Card>
            </PageWrap>
        </AppShell>
    );
}

export default HR;
