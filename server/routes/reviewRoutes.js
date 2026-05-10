import { Router } from "express";
import checkAuth from "../middleware/checkAuth.js";
import store from "../store/dataStore.js";
import { toTitleCaseName } from "../utils/formatName.js";
import { genId } from "../utils/id.js";

const router = Router();

router.get("/revs", (req, res) => {
    checkAuth(req);
    res.json(store.revs);
});

router.post("/revs", (req, res) => {
    const user = checkAuth(req);
    if (!user) return res.status(401).send("no auth");

    const { title, empId, assignedTo } = req.body;
    if (!title || !empId) return res.status(400).send("missing");

    const newRev = {
        id: genId(),
        title,
        empId,
        assignedTo: assignedTo || []
    };

    store.revs.push(newRev);
    res.json(newRev);
});

router.put("/revs/:id", (req, res) => {
    const user = checkAuth(req);
    if (!user) return res.status(401).send("no auth");

    const id = Number(req.params.id);
    const { title, empId, assignedTo } = req.body;
    const rev = store.revs.find(r => r.id === id);

    if (!rev) return res.status(404).send("not found");
    if (title) rev.title = title;
    if (empId) rev.empId = Number(empId);
    if (assignedTo) rev.assignedTo = assignedTo;

    res.json(rev);
});

router.get("/my-revs/:empId", (req, res) => {
    const user = checkAuth(req);
    if (!user) return res.status(401).send("no auth");

    const empId = Number(req.params.empId);
    const data = store.revs
        .filter(r => r.assignedTo.includes(empId))
        .map(r => {
            const emp = store.emps.find(e => e.id === r.empId);
            return {
                ...r,
                empName: emp ? toTitleCaseName(emp.name) : "Unknown",
                empAvatarUrl: emp?.avatarUrl
            };
        });

    res.json(data);
});

export default router;
