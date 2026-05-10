import { Router } from "express";
import store from "../store/dataStore.js";
import { toTitleCaseName } from "../utils/formatName.js";
import { genId } from "../utils/id.js";

const router = Router();

router.post("/login", (req, res) => {
    const { name, password } = req.body;
    const normalizedName = toTitleCaseName(name);
    const user = store.emps.find(
        e =>
            toTitleCaseName(e.name) === normalizedName &&
            (e.password === password || e.pin === password)
    );

    if (!user) {
        console.log("login fail:", name);
        return res.status(401).json({ error: "Invalid credentials" });
    }

    console.log("login:", user.name);
    res.json({
        id: user.id,
        name: toTitleCaseName(user.name),
        role: user.role,
        dept: user.dept,
        avatarUrl: user.avatarUrl
    });
});

router.post("/onboarding", (req, res) => {
    const { users } = req.body;
    if (!Array.isArray(users)) {
        return res.status(400).json({
            created: 0,
            failed: [{ row: 0, reason: "users must be an array" }]
        });
    }

    const allowedRoles = new Set(["admin", "hr", "manager", "employee"]);
    const failed = [];
    let created = 0;

    users.forEach((entry, index) => {
        const row = index + 1;
        if (!entry || typeof entry !== "object") {
            failed.push({ row, reason: "invalid user object" });
            return;
        }

        const password = entry.password ?? entry.pin;

        const { name, role, dept, avatarUrl } = entry;

        if (typeof name !== "string" || name.trim() === "") {
            failed.push({ row, reason: "name must be non-empty string" });
            return;
        }

        if (!Number.isInteger(password) || password < 100000 || password > 999999) {
            failed.push({ row, reason: "password must be 6-digit number" });
            return;
        }

        if (typeof role !== "string" || !allowedRoles.has(role)) {
            failed.push({ row, reason: "role must be admin|hr|manager|employee" });
            return;
        }

        if (typeof dept !== "string" || dept.trim() === "") {
            failed.push({ row, reason: "dept must be non-empty string" });
            return;
        }

        const id = genId();
        store.emps.push({
            id,
            name: toTitleCaseName(name),
            password,
            role,
            dept: dept.trim(),
            avatarUrl:
                typeof avatarUrl === "string" && avatarUrl.trim() !== ""
                    ? avatarUrl.trim()
                    : `https://i.pravatar.cc/100?u=${encodeURIComponent(String(id))}`
        });
        created += 1;
    });

    console.log("onboarding created:", created, "failed:", failed.length);
    res.json({ created, failed });
});

export default router;
