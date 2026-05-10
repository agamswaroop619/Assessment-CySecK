import { useEffect, useState } from "react";
import { FiUserPlus, FiTrash2, FiPlusCircle, FiLogOut, FiClipboard, FiList, FiX, FiMessageSquare, FiEdit2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import {
    AppShell,
    Card,
    Input,
    PageHeader,
    PageWrap,
    Pill,
    PrimaryButton,
    Select,
    SoftButton
} from "../components/ui";

const BASE = "http://localhost:7250";

const TABS = [
    { key: "employees", label: "Employees", icon: FiUserPlus },
    { key: "create",    label: "Create Review", icon: FiPlusCircle },
    { key: "reviews",   label: "Reviews", icon: FiList },
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

    // feedback modal
    const [selectedRev, setSelectedRev] = useState(null);
    const [feedback, setFeedback] = useState([]);
    const [fbLoading, setFbLoading] = useState(false);

    // edit emp popup
    const [editEmp, setEditEmp] = useState(null);
    const [editEmpName, setEditEmpName] = useState("");
    const [editEmpPin, setEditEmpPin] = useState("");

    // edit review popup
    const [editRev, setEditRev] = useState(null);
    const [editRevTitle, setEditRevTitle] = useState("");
    const [editRevEmpId, setEditRevEmpId] = useState("");
    const [editRevAssignIds, setEditRevAssignIds] = useState([]);

    // create review form
    const [name, setName] = useState("");
    const [title, setTitle] = useState("");
    const [empId, setEmpId] = useState("");
    const [assignIds, setAssignIds] = useState([]);

    const load = async () => {
        const e = await fetch(BASE + "/emps", { headers: { "x-user": user.id } });
        const r = await fetch(BASE + "/revs", { headers: { "x-user": user.id } });
        setEmps(await e.json());
        setRevs(await r.json());
    };

    useEffect(() => { load(); }, []);

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
        setEditEmpName(e.name);
        setEditEmpPin(String(e.pin));
    };
    const closeEditEmp = () => setEditEmp(null);
    const saveEmp = async () => {
        await fetch(`${BASE}/emps/${editEmp.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", "x-user": user.id },
            body: JSON.stringify({ name: editEmpName, pin: editEmpPin })
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
    const addEmp = async () => {
        if (!name) return;
        await fetch(BASE + "/emps", {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-user": user.id },
            body: JSON.stringify({ name })
        });
        setName("");
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

                <div className="mb-6 flex flex-wrap gap-2">
                    {TABS.map(({ key, label, icon: Icon }) => (
                        <Pill
                            key={key}
                            onClick={() => setTab(key)}
                            active={tab === key}
                            className="flex items-center gap-2"
                        >
                            <Icon size={14} />
                            {label}
                        </Pill>
                    ))}
                </div>

                {tab === "employees" && (
                    <Card>
                        <div className="mb-5 flex items-center gap-2">
                            <FiUserPlus />
                            <h2 className="text-lg font-medium text-slate-800">Employees</h2>
                        </div>

                        <div className="mb-5 flex gap-2">
                            <Input
                                placeholder="Enter employee name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && addEmp()}
                            />
                            <PrimaryButton onClick={addEmp} className="flex items-center gap-1 whitespace-nowrap">
                                <FiPlusCircle />
                                Add
                            </PrimaryButton>
                        </div>

                        <div className="space-y-2">
                            {emps.length === 0 && (
                                <p className="py-4 text-center text-sm text-slate-500">No employees yet</p>
                            )}
                            {emps.map((e) => (
                                <div
                                    key={e.id}
                                    className="flex items-center justify-between rounded-2xl border border-violet-100 bg-violet-50/40 px-3 py-2"
                                >
                                    <span className="text-sm text-slate-700">
                                        {e.name} <span className="text-slate-400">({e.pin})</span>
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <FiEdit2
                                            size={14}
                                            onClick={() => openEditEmp(e)}
                                            className="cursor-pointer text-slate-400 transition hover:text-violet-600"
                                        />
                                        <FiTrash2
                                            onClick={() => delEmp(e.id)}
                                            className="cursor-pointer text-slate-400 transition hover:text-rose-500"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
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
                                <option key={e.id} value={e.id}>{e.name}</option>
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
                                    {e.name}
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

                        <div className="space-y-3">
                            {revs.length === 0 && (
                                <p className="py-4 text-center text-sm text-slate-500">No reviews created yet</p>
                            )}
                            {revs.map((r) => (
                                <div
                                    key={r.id}
                                    onClick={() => openReview(r)}
                                    className="cursor-pointer rounded-2xl border border-violet-100 bg-violet-50/40 p-4 transition hover:bg-violet-50"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-medium text-slate-800">{r.title}</p>
                                            <p className="mt-1 text-sm text-slate-500">
                                                Employee: {emps.find(e => e.id === r.empId)?.name ?? r.empId}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-400">
                                                Assigned: {r.assignedTo.map(id => emps.find(e => e.id === id)?.name ?? id).join(", ") || "none"}
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
                            ))}
                        </div>
                    </Card>
                )}
            </PageWrap>

            {selectedRev && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-800/25 px-4"
                    onClick={closeReview}
                >
                    <Card className="w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="mb-5 flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800">{selectedRev.title}</h3>
                                <p className="mt-0.5 text-sm text-slate-500">
                                    Employee: {emps.find(e => e.id === selectedRev.empId)?.name ?? selectedRev.empId}
                                </p>
                            </div>
                            <button
                                onClick={closeReview}
                                className="ml-4 mt-0.5 cursor-pointer text-slate-400 transition hover:text-slate-700"
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
                                    <p className="mb-1 text-xs font-medium text-slate-500">
                                        {emps.find(e => e.id === f.fromId)?.name ?? `Employee #${f.fromId}`}
                                    </p>
                                    <p className="text-sm text-slate-700">{f.text}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}

            {editEmp && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-800/25 px-4"
                    onClick={closeEditEmp}
                >
                    <Card className="w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="mb-5 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-800">Edit Employee</h3>
                            <button onClick={closeEditEmp} className="cursor-pointer text-slate-400 transition hover:text-slate-700">
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
                            placeholder="PIN"
                            type="number"
                            value={editEmpPin}
                            onChange={(e) => setEditEmpPin(e.target.value)}
                        />

                        <PrimaryButton onClick={saveEmp} className="w-full">
                            Save
                        </PrimaryButton>
                    </Card>
                </div>
            )}

            {editRev && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-800/25 px-4"
                    onClick={closeEditRev}
                >
                    <Card className="w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="mb-5 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-800">Edit Review</h3>
                            <button onClick={closeEditRev} className="cursor-pointer text-slate-400 transition hover:text-slate-700">
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
                                <option key={e.id} value={e.id}>{e.name}</option>
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
                                    {e.name}
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