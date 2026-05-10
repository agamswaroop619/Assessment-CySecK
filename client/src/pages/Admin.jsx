import { useEffect, useState } from "react";
import { FiUserPlus, FiTrash2, FiPlusCircle, FiLogOut, FiClipboard, FiList, FiX, FiMessageSquare, FiEdit2, FiUpload } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import {
    AppShell,
    AnimatedPanel,
    Avatar,
    BottomNav,
    Card,
    CommonGrid,
    Input,
    PageHeader,
    PageWrap,
    Pill,
    PrimaryButton,
    Select,
    SideNav,
    SoftButton
} from "../components/ui";
import {
    downloadOnboardingTemplate,
    ONBOARDING_ALLOWED_ROLES,
    parseOnboardingCsvText,
    parseOnboardingExcelFile
} from "../utils/onboarding";
import { toTitleCaseName } from "../utils/formatName";

function formatRole(role) {
    const r = (role ?? "employee").toString().trim().toLowerCase() || "employee";
    return r.charAt(0).toUpperCase() + r.slice(1);
}

const BASE = "http://localhost:7250";

function displayEmpPassword(emp) {
    if (!emp) return "";
    const v = emp.password ?? emp.pin;
    return v === undefined || v === null ? "" : String(v);
}

const TABS = [
    { key: "employees", label: "Employees", icon: FiUserPlus },
    { key: "create",    label: "Create Review", icon: FiPlusCircle },
    { key: "reviews",   label: "Reviews", icon: FiList },
    { key: "onboarding", label: "Onboarding", icon: FiUpload },
];

function Admin({ setUser }) {
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

    const [tab, setTab] = useState("employees");
    const [emps, setEmps] = useState([]);
    const [revs, setRevs] = useState([]);
    const getEmpById = (id) => emps.find((e) => e.id === id);

    // feedback modal
    const [selectedRev, setSelectedRev] = useState(null);
    const [feedback, setFeedback] = useState([]);
    const [fbLoading, setFbLoading] = useState(false);

    // add employee popup
    const [addEmpOpen, setAddEmpOpen] = useState(false);
    const [addEmpName, setAddEmpName] = useState("");
    const [addEmpPassword, setAddEmpPassword] = useState("");
    const [addEmpRole, setAddEmpRole] = useState("employee");

    // edit emp popup
    const [editEmp, setEditEmp] = useState(null);
    const [editEmpName, setEditEmpName] = useState("");
    const [editEmpPassword, setEditEmpPassword] = useState("");

    // edit review popup
    const [editRev, setEditRev] = useState(null);
    const [editRevTitle, setEditRevTitle] = useState("");
    const [editRevEmpId, setEditRevEmpId] = useState("");
    const [editRevAssignIds, setEditRevAssignIds] = useState([]);

    // create review form
    const [title, setTitle] = useState("");
    const [empId, setEmpId] = useState("");
    const [assignIds, setAssignIds] = useState([]);
    const [rawInput, setRawInput] = useState("");
    const [parsedRows, setParsedRows] = useState([]);
    const [onboardResult, setOnboardResult] = useState({});
    const [onboardFileError, setOnboardFileError] = useState("");

    const load = async () => {
        const e = await fetch(BASE + "/emps", { headers: { "x-user": user.id } });
        const r = await fetch(BASE + "/revs", { headers: { "x-user": user.id } });
        setEmps(await e.json());
        setRevs(await r.json());
    };

    useEffect(() => {
        queueMicrotask(() => {
            load();
        });
    }, []);

    // feedback modal
    const openReview = (rev) => {
        setSelectedRev(rev);
        setFbLoading(true);
        setFeedback([]);
        fetch(`${BASE}/fb/${rev.id}`, { headers: { "x-user": user.id } })
            .then(r => r.json())
            .then(data => { setFeedback(data); setFbLoading(false); });
    };
    const closeReview = () => { setSelectedRev(null); setFeedback([]); };

    // edit emp
    const openEditEmp = (e) => {
        setEditEmp(e);
        setEditEmpName(toTitleCaseName(e.name));
        setEditEmpPassword(displayEmpPassword(e));
    };
    const closeEditEmp = () => setEditEmp(null);
    const saveEmp = async () => {
        await fetch(`${BASE}/emps/${editEmp.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", "x-user": user.id },
            body: JSON.stringify({ name: editEmpName, password: editEmpPassword })
        });
        closeEditEmp();
        load();
    };

    // edit review
    const openEditRev = (r, e) => {
        e.stopPropagation();
        setEditRev(r);
        setEditRevTitle(r.title);
        setEditRevEmpId(String(r.empId));
        setEditRevAssignIds([...r.assignedTo]);
    };
    const closeEditRev = () => setEditRev(null);
    const saveRev = async () => {
        await fetch(`${BASE}/revs/${editRev.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", "x-user": user.id },
            body: JSON.stringify({ title: editRevTitle, empId: Number(editRevEmpId), assignedTo: editRevAssignIds })
        });
        closeEditRev();
        load();
    };
    const toggleEditAssign = (id) => {
        setEditRevAssignIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    // create emp / review
    const resetAddEmpForm = () => {
        setAddEmpName("");
        setAddEmpPassword("");
        setAddEmpRole("employee");
    };
    const closeAddEmp = () => {
        setAddEmpOpen(false);
        resetAddEmpForm();
    };
    const submitAddEmp = async () => {
        const trimmed = addEmpName.trim();
        if (!trimmed) return;
        await fetch(BASE + "/emps", {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-user": user.id },
            body: JSON.stringify({
                name: trimmed,
                role: addEmpRole,
                password: addEmpPassword.trim() === "" ? undefined : addEmpPassword.trim()
            })
        });
        closeAddEmp();
        load();
    };
    const delEmp = async (id) => {
        await fetch(BASE + "/emps/" + id, { method: "DELETE", headers: { "x-user": user.id } });
        load();
    };
    const addRev = async () => {
        if (!title || !empId) return;
        await fetch(BASE + "/revs", {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-user": user.id },
            body: JSON.stringify({ title, empId: Number(empId), assignedTo: assignIds })
        });
        setTitle(""); setEmpId(""); setAssignIds([]);
        load();
    };
    const toggleAssign = (id) => {
        setAssignIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };
    const parseOnboardingInput = () => {
        setParsedRows(parseOnboardingCsvText(rawInput));
        setOnboardResult({});
        setOnboardFileError("");
    };
    const uploadOnboardingFile = async (file) => {
        if (!file) return;
        setOnboardFileError("");
        try {
            const rows = await parseOnboardingExcelFile(file);
            setParsedRows(rows);
            setOnboardResult({});
        } catch {
            setOnboardFileError("Failed to read file. Please upload a valid .xlsx template.");
        }
    };
    const submitOnboardingRows = async () => {
        if (parsedRows.length === 0) return;
        const res = await fetch(`${BASE}/onboarding`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-user": user.id
            },
            body: JSON.stringify({ users: parsedRows })
        });

        const data = await res.json();
        if (!res.ok) {
            setOnboardResult({
                created: 0,
                failed: [{ row: "-", reason: data.error || "Onboarding failed" }]
            });
            return;
        }

        setOnboardResult(data);
        await load();
    };

    return (
        <AppShell>
            <PageWrap max="max-w-4xl">
                <PageHeader
                    title="Admin Dashboard"
                    right={(
                        <SoftButton onClick={logout} className="flex items-center gap-2">
                            <FiLogOut />
                            Logout
                        </SoftButton>
                    )}
                />
                <div className="pb-24 md:pb-0">
                    <div className="md:flex md:items-start md:gap-6">
                        <div className="hidden md:block md:w-64 md:shrink-0">
                            <SideNav items={TABS} activeKey={tab} onChange={setTab} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <AnimatedPanel activeKey={tab}>

                {tab === "employees" && (
                    <Card>
                        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2">
                                <FiUserPlus />
                                <h2 className="text-lg font-medium text-slate-800">Employees</h2>
                            </div>
                            <PrimaryButton
                                type="button"
                                onClick={() => setAddEmpOpen(true)}
                                className="flex w-full shrink-0 items-center justify-center gap-1 whitespace-nowrap sm:w-auto"
                            >
                                <FiPlusCircle />
                                Add
                            </PrimaryButton>
                        </div>

                        <CommonGrid
                            header="Employees"
                            items={emps}
                            storageKey="admin-employees-view"
                            defaultView="card"
                            exportFileName="Employees"
                            empty={<p className="py-4 text-center text-sm text-slate-500">No employees yet</p>}
                            getKey={(e) => e.id}
                            columns={[
                                {
                                    key: "name",
                                    header: "Employee",
                                    getValue: (e) => toTitleCaseName(e.name),
                                    render: (e) => (
                                        <span className="inline-flex items-center gap-2">
                                            <Avatar
                                                src={
                                                    e.avatarUrl ??
                                                    `https://i.pravatar.cc/100?u=${encodeURIComponent(String(e.id))}`
                                                }
                                                alt={toTitleCaseName(e.name)}
                                                size={24}
                                            />
                                            <span className="truncate">{toTitleCaseName(e.name)}</span>
                                        </span>
                                    )
                                },
                                {
                                    key: "role",
                                    header: "Role",
                                    getValue: (e) => formatRole(e.role),
                                    render: (e) => (
                                        <span className="text-slate-700">{formatRole(e.role)}</span>
                                    )
                                },
                                {
                                    key: "password",
                                    header: "Password",
                                    getValue: (e) => displayEmpPassword(e)
                                },
                                {
                                    key: "actions",
                                    header: "Actions",
                                    exportable: false,
                                    className: "whitespace-nowrap",
                                    render: (e) => (
                                        <div className="flex items-center gap-3">
                                            <FiEdit2
                                                size={16}
                                                onClick={() => openEditEmp(e)}
                                                className="cursor-pointer text-slate-400 transition hover:text-violet-500"
                                            />
                                            <FiTrash2
                                                size={16}
                                                onClick={() => delEmp(e.id)}
                                                className="cursor-pointer text-slate-400 transition hover:text-rose-400"
                                            />
                                        </div>
                                    )
                                }
                            ]}
                            renderCard={(e) => (
                                <div className="rounded-2xl border border-violet-100 bg-slate-50/90 p-4 shadow-sm">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <Avatar
                                                    src={
                                                        e.avatarUrl ??
                                                        `https://i.pravatar.cc/100?u=${encodeURIComponent(String(e.id))}`
                                                    }
                                                    alt={toTitleCaseName(e.name)}
                                                    size={32}
                                                />
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-medium text-slate-800">{toTitleCaseName(e.name)}</p>
                                                    <p className="mt-0.5 text-xs text-slate-500">
                                                        Role: {formatRole(e.role)}
                                                    </p>
                                                    <p className="mt-0.5 text-xs text-slate-500">
                                                        Password: {displayEmpPassword(e) || "—"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <FiEdit2
                                                size={16}
                                                onClick={() => openEditEmp(e)}
                                                className="cursor-pointer text-slate-400 transition hover:text-violet-500"
                                            />
                                            <FiTrash2
                                                size={16}
                                                onClick={() => delEmp(e.id)}
                                                className="cursor-pointer text-slate-400 transition hover:text-rose-400"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        />
                    </Card>
                )}

                {tab === "create" && (
                    <Card>
                        <div className="mb-5 flex items-center gap-2">
                            <FiClipboard />
                            <h2 className="text-lg font-medium text-slate-800">Create Review</h2>
                        </div>

                        <Input
                            className="mb-3"
                            placeholder="Review title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />

                        <Select
                            className="mb-4"
                            value={empId}
                            onChange={(e) => setEmpId(e.target.value)}
                        >
                            <option value="">Select employee being reviewed</option>
                            {emps.map((e) => (
                                <option key={e.id} value={e.id}>{toTitleCaseName(e.name)}</option>
                            ))}
                        </Select>

                        <p className="mb-2 text-sm text-slate-500">Assign reviewers</p>

                        <div className="mb-5 flex flex-wrap gap-2">
                            {emps.map((e) => (
                                <Pill
                                    key={e.id}
                                    onClick={() => toggleAssign(e.id)}
                                    active={assignIds.includes(e.id)}
                                >
                                    {toTitleCaseName(e.name)}
                                </Pill>
                            ))}
                        </div>

                        <PrimaryButton onClick={addRev} className="w-full">
                            Create Review
                        </PrimaryButton>
                    </Card>
                )}

                {tab === "reviews" && (
                    <Card>
                        <div className="mb-5 flex items-center gap-2">
                            <FiList />
                            <h2 className="text-lg font-medium text-slate-800">Reviews</h2>
                        </div>

                        <CommonGrid
                            header="Reviews"
                            items={revs}
                            storageKey="admin-reviews-view"
                            defaultView="card"
                            exportFileName="Reviews"
                            empty={<p className="py-4 text-center text-sm text-slate-500">No reviews created yet</p>}
                            getKey={(r) => r.id}
                            cardClassName="grid gap-3 sm:grid-cols-2"
                            columns={[
                                { key: "title", header: "Title", getValue: (r) => r.title },
                                {
                                    key: "employee",
                                    header: "Employee",
                                    getValue: (r) => {
                                        const emp = getEmpById(r.empId);
                                        return emp ? toTitleCaseName(emp.name) : r.empId;
                                    },
                                    render: (r) => {
                                        const emp = getEmpById(r.empId);
                                        const name = emp ? toTitleCaseName(emp.name) : String(r.empId);
                                        const avatarUrl =
                                            emp?.avatarUrl ??
                                            `https://i.pravatar.cc/100?u=${encodeURIComponent(String(r.empId))}`;
                                        return (
                                            <span className="inline-flex items-center gap-2">
                                                <Avatar src={avatarUrl} alt={name} size={24} />
                                                <span className="truncate">{name}</span>
                                            </span>
                                        );
                                    }
                                },
                                {
                                    key: "assigned",
                                    header: "Assigned",
                                    getValue: (r) =>
                                        r.assignedTo
                                            .map((id) => {
                                                const a = getEmpById(id);
                                                return a ? toTitleCaseName(a.name) : id;
                                            })
                                            .join(", ") || "none",
                                },
                                {
                                    key: "actions",
                                    header: "Actions",
                                    exportable: false,
                                    className: "whitespace-nowrap",
                                    render: (r) => (
                                        <SoftButton
                                            onClick={(e) => openEditRev(r, e)}
                                            className="flex items-center gap-1 px-3 py-1.5 text-xs"
                                        >
                                            <FiEdit2 size={11} />
                                            Edit
                                        </SoftButton>
                                    )
                                }
                            ]}
                            renderCard={(r) => (
                                <div
                                    onClick={() => openReview(r)}
                                    className="cursor-pointer rounded-2xl border border-violet-100 bg-violet-50/40 p-4 transition hover:bg-violet-50"
                                >
                                    {(() => {
                                        const emp = getEmpById(r.empId);
                                        const name = emp ? toTitleCaseName(emp.name) : String(r.empId);
                                        const avatarUrl =
                                            emp?.avatarUrl ??
                                            `https://i.pravatar.cc/100?u=${encodeURIComponent(String(r.empId))}`;
                                        return (
                                            <div className="mb-2 inline-flex items-center gap-2 text-sm text-slate-600">
                                                <Avatar src={avatarUrl} alt={name} size={28} />
                                                <span className="font-medium text-slate-800">{name}</span>
                                            </div>
                                        );
                                    })()}
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-medium text-slate-800">{r.title}</p>
                                            <p className="mt-1 text-sm text-slate-500">
                                                Employee:{" "}
                                                {getEmpById(r.empId)
                                                    ? toTitleCaseName(getEmpById(r.empId).name)
                                                    : r.empId}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-400">
                                                Assigned:{" "}
                                                {r.assignedTo
                                                    .map((id) => {
                                                        const a = getEmpById(id);
                                                        return a ? toTitleCaseName(a.name) : id;
                                                    })
                                                    .join(", ") || "none"}
                                            </p>
                                        </div>
                                        <SoftButton
                                            onClick={(e) => openEditRev(r, e)}
                                            className="ml-3 flex shrink-0 items-center gap-1 px-3 py-1.5 text-xs"
                                        >
                                            <FiEdit2 size={11} />
                                            Edit
                                        </SoftButton>
                                    </div>
                                    <p className="mt-2 text-xs text-slate-400">Click to view feedback</p>
                                </div>
                            )}
                        />
                    </Card>
                )}

                {tab === "onboarding" && (
                    <Card>
                        <div className="mb-5 flex items-center gap-2">
                            <FiUpload />
                            <h2 className="text-lg font-medium text-slate-800">Onboarding</h2>
                        </div>

                        <div className="mb-4 flex flex-wrap gap-2">
                            <SoftButton
                                type="button"
                                onClick={downloadOnboardingTemplate}
                                className="flex items-center gap-2"
                            >
                                Download template
                            </SoftButton>
                            <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-violet-200 bg-violet-100/70 px-4 py-2.5 text-sm font-medium text-violet-800 transition hover:bg-violet-200/80">
                                Upload Excel
                                <input
                                    type="file"
                                    accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        uploadOnboardingFile(file);
                                        e.target.value = "";
                                    }}
                                />
                            </label>
                        </div>

                        <textarea
                            rows={8}
                            placeholder="name,password,role,dept — one per line"
                            value={rawInput}
                            onChange={(e) => setRawInput(e.target.value)}
                            className="mb-4 w-full resize-y rounded-2xl border border-violet-100 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
                        />

                        <PrimaryButton onClick={parseOnboardingInput} className="mb-5">
                            Parse
                        </PrimaryButton>

                        {onboardFileError && (
                            <p className="mb-3 text-sm font-medium text-rose-500">
                                {onboardFileError}
                            </p>
                        )}

                        <div className="overflow-x-auto rounded-2xl border border-violet-100">
                            <table className="min-w-full divide-y divide-violet-100">
                                <thead className="bg-violet-50/40">
                                    <tr>
                                        <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Name</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Password</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Role</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Dept</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-violet-100 bg-slate-50/60">
                                    {parsedRows.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-3 py-4 text-center text-sm text-slate-500">
                                                No parsed rows yet
                                            </td>
                                        </tr>
                                    )}
                                    {parsedRows.map((row, index) => {
                                        const isRoleValid = ONBOARDING_ALLOWED_ROLES.includes(String(row.role ?? "").toLowerCase());
                                        const pwd = Number(row.password);
                                        const isPasswordValid = Number.isInteger(pwd) && pwd >= 100000 && pwd <= 999999;
                                        const isNameValid = String(row.name ?? "").trim().length > 0;
                                        const isDeptValid = String(row.dept ?? "").trim().length > 0;
                                        const isRowValid = isRoleValid && isPasswordValid && isNameValid && isDeptValid;
                                        return (
                                            <tr key={`${row.name}-${row.password}-${index}`} className={isRowValid ? "" : "bg-rose-50"}>
                                                <td className="px-3 py-2 text-sm text-slate-700">{toTitleCaseName(row.name)}</td>
                                                <td className="px-3 py-2 text-sm text-slate-700">{row.password}</td>
                                                <td className={`px-3 py-2 text-sm ${isRoleValid ? "text-slate-700" : "font-medium text-rose-500"}`}>
                                                    {row.role}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-slate-700">{row.dept}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <PrimaryButton
                            onClick={submitOnboardingRows}
                            disabled={parsedRows.length === 0}
                            className="mt-5"
                        >
                            Submit
                        </PrimaryButton>

                        {onboardResult.created !== undefined && (
                            <p className="mt-3 text-sm font-medium text-emerald-500">
                                {onboardResult.created} users created
                            </p>
                        )}

                        {Array.isArray(onboardResult.failed) && onboardResult.failed.length > 0 && (
                            <div className="mt-2 space-y-1">
                                {onboardResult.failed.map((failure, index) => (
                                    <p key={`${failure.row}-${index}`} className="text-sm text-rose-500">
                                        Row {failure.row}: {failure.reason}
                                    </p>
                                ))}
                            </div>
                        )}
                    </Card>
                )}
                            </AnimatedPanel>
                        </div>
                    </div>
                </div>
            </PageWrap>
            <BottomNav items={TABS} activeKey={tab} onChange={setTab} className="md:hidden" />

            {selectedRev && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-300/35 px-4"
                    onClick={closeReview}
                >
                    <Card className="w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="mb-5 flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800">{selectedRev.title}</h3>
                                <p className="mt-0.5 text-sm text-slate-500">
                                    Employee:{" "}
                                    {(() => {
                                        const se = emps.find((e) => e.id === selectedRev.empId);
                                        return se ? toTitleCaseName(se.name) : selectedRev.empId;
                                    })()}
                                </p>
                            </div>
                            <button
                                onClick={closeReview}
                                className="ml-4 mt-0.5 cursor-pointer text-slate-400 transition hover:text-slate-600"
                            >
                                <FiX size={18} />
                            </button>
                        </div>

                        <div className="max-h-72 space-y-3 overflow-y-auto">
                            {fbLoading && (
                                <p className="py-4 text-center text-sm text-slate-500">Loading...</p>
                            )}
                            {!fbLoading && feedback.length === 0 && (
                                <div className="flex flex-col items-center gap-2 py-6 text-slate-400">
                                    <FiMessageSquare size={24} />
                                    <p className="text-sm">No feedback submitted yet</p>
                                </div>
                            )}
                            {!fbLoading && feedback.map((f) => (
                                <div key={f.id} className="rounded-2xl border border-violet-100 bg-violet-50/40 p-3">
                                    <div className="mb-1 inline-flex items-center gap-2 text-xs font-medium text-slate-500">
                                        <Avatar
                                            src={
                                                getEmpById(f.fromId)?.avatarUrl ??
                                                `https://i.pravatar.cc/100?u=${encodeURIComponent(String(f.fromId))}`
                                            }
                                            alt={
                                                getEmpById(f.fromId)?.name
                                                    ? toTitleCaseName(getEmpById(f.fromId).name)
                                                    : `Employee #${f.fromId}`
                                            }
                                            size={22}
                                        />
                                        <span>
                                            {getEmpById(f.fromId)?.name
                                                ? toTitleCaseName(getEmpById(f.fromId).name)
                                                : `Employee #${f.fromId}`}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-700">{f.text}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}

            {addEmpOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-300/35 px-4"
                    onClick={closeAddEmp}
                >
                    <Card className="w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="mb-5 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-800">Add employee</h3>
                            <button
                                type="button"
                                onClick={closeAddEmp}
                                className="cursor-pointer text-slate-400 transition hover:text-slate-600"
                            >
                                <FiX size={18} />
                            </button>
                        </div>

                        <label className="mb-1.5 block text-xs font-medium text-slate-500">Name</label>
                        <Input
                            className="mb-4"
                            placeholder="Full name"
                            value={addEmpName}
                            onChange={(e) => setAddEmpName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && submitAddEmp()}
                        />

                        <label className="mb-1.5 block text-xs font-medium text-slate-500">Role</label>
                        <Select
                            className="mb-4"
                            value={addEmpRole}
                            onChange={(e) => setAddEmpRole(e.target.value)}
                        >
                            {ONBOARDING_ALLOWED_ROLES.map((r) => (
                                <option key={r} value={r}>
                                    {formatRole(r)}
                                </option>
                            ))}
                        </Select>

                        <label className="mb-1.5 block text-xs font-medium text-slate-500">
                            Password{" "}
                            <span className="font-normal text-slate-400">(optional)</span>
                        </label>
                        <Input
                            className="mb-5"
                            placeholder="Leave blank for auto-generated"
                            type="text"
                            autoComplete="new-password"
                            value={addEmpPassword}
                            onChange={(e) => setAddEmpPassword(e.target.value)}
                        />

                        <div className="flex flex-col gap-2">
                            <PrimaryButton type="button" onClick={submitAddEmp} className="w-full">
                                Create employee
                            </PrimaryButton>
                            <SoftButton type="button" onClick={closeAddEmp} className="w-full">
                                Cancel
                            </SoftButton>
                        </div>
                    </Card>
                </div>
            )}

            {editEmp && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-300/35 px-4"
                    onClick={closeEditEmp}
                >
                    <Card className="w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="mb-5 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-800">Edit Employee</h3>
                            <button onClick={closeEditEmp} className="cursor-pointer text-slate-400 transition hover:text-slate-600">
                                <FiX size={18} />
                            </button>
                        </div>

                        <Input
                            className="mb-3"
                            placeholder="Name"
                            value={editEmpName}
                            onChange={(e) => setEditEmpName(e.target.value)}
                        />
                        <Input
                            className="mb-5"
                            placeholder="Password"
                            type="text"
                            autoComplete="new-password"
                            value={editEmpPassword}
                            onChange={(e) => setEditEmpPassword(e.target.value)}
                        />

                        <PrimaryButton onClick={saveEmp} className="w-full">
                            Save
                        </PrimaryButton>
                    </Card>
                </div>
            )}

            {editRev && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-300/35 px-4"
                    onClick={closeEditRev}
                >
                    <Card className="w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="mb-5 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-800">Edit Review</h3>
                            <button onClick={closeEditRev} className="cursor-pointer text-slate-400 transition hover:text-slate-600">
                                <FiX size={18} />
                            </button>
                        </div>

                        <Input
                            className="mb-3"
                            placeholder="Review title"
                            value={editRevTitle}
                            onChange={(e) => setEditRevTitle(e.target.value)}
                        />

                        <Select
                            className="mb-4"
                            value={editRevEmpId}
                            onChange={(e) => setEditRevEmpId(e.target.value)}
                        >
                            <option value="">Select employee being reviewed</option>
                            {emps.map((e) => (
                                <option key={e.id} value={e.id}>{toTitleCaseName(e.name)}</option>
                            ))}
                        </Select>

                        <p className="mb-2 text-sm text-slate-500">Assign reviewers</p>

                        <div className="mb-5 flex flex-wrap gap-2">
                            {emps.map((e) => (
                                <Pill
                                    key={e.id}
                                    onClick={() => toggleEditAssign(e.id)}
                                    active={editRevAssignIds.includes(e.id)}
                                >
                                    {toTitleCaseName(e.name)}
                                </Pill>
                            ))}
                        </div>

                        <PrimaryButton onClick={saveRev} className="w-full">
                            Save
                        </PrimaryButton>
                    </Card>
                </div>
            )}
        </AppShell>
    );
}

export default Admin;
