import { Router } from "express";
import checkAuth from "../middleware/checkAuth.js";
import store from "../store/dataStore.js";
import { toTitleCaseName } from "../utils/formatName.js";
import { normalizeStoredEmp } from "../utils/normalizeEmp.js";
import { genId, genPassword } from "../utils/id.js";

const router = Router();

router.get("/emps", (req, res) => {
    checkAuth(req);
    for (const e of store.emps) {
        const missingPassword =
            e.password === undefined ||
            e.password === null ||
            String(e.password).trim() === "";
        const hasLegacyPin =
            e.pin !== undefined && e.pin !== null && String(e.pin).trim() !== "";
        if (missingPassword && hasLegacyPin) {
            e.password = e.pin;
        }
        if (Object.prototype.hasOwnProperty.call(e, "pin")) {
            delete e.pin;
        }
    }
    res.json(store.emps.map((e) => normalizeStoredEmp(e)));
});

router.post("/emps", (req, res) => {
    const user = checkAuth(req);
    if (!user) return res.status(401).send("no auth");

    const { name, avatarUrl } = req.body;
    if (!name) return res.status(400).send("name req");

    const newEmp = {
        id: genId(),
        name: toTitleCaseName(name),
        password: genPassword()
    };

    newEmp.avatarUrl =
        typeof avatarUrl === "string" && avatarUrl.trim() !== ""
            ? avatarUrl.trim()
            : `https://i.pravatar.cc/100?u=${encodeURIComponent(String(newEmp.id))}`;

    store.emps.push(newEmp);
    res.json(normalizeStoredEmp(newEmp));
});

router.put("/emps/:id", (req, res) => {
    const user = checkAuth(req);
    if (!user) return res.status(401).send("no auth");

    const id = Number(req.params.id);
    const { name, password, avatarUrl } = req.body;
    const emp = store.emps.find(e => e.id === id);

    if (!emp) return res.status(404).send("not found");
    if (name) emp.name = toTitleCaseName(name);
    if (password !== undefined && password !== null && String(password).trim() !== "") {
        emp.password = password;
        if (Object.prototype.hasOwnProperty.call(emp, "pin")) delete emp.pin;
    }
    if (typeof avatarUrl === "string" && avatarUrl.trim() !== "") emp.avatarUrl = avatarUrl.trim();

    res.json(normalizeStoredEmp(emp));
});

router.delete("/emps/:id", (req, res) => {
    const user = checkAuth(req);
    if (!user) return res.status(401).send("no auth");

    const id = Number(req.params.id);
    store.emps = store.emps.filter(e => e.id !== id);

    res.send("deleted");
});

export default router;
