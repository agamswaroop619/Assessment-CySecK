import { Router } from "express";
import checkAuth from "../middleware/checkAuth.js";
import store from "../store/dataStore.js";
import { genId, genPin } from "../utils/id.js";

const router = Router();

router.get("/emps", (req, res) => {
    checkAuth(req);
    res.json(store.emps);
});

router.post("/emps", (req, res) => {
    const user = checkAuth(req);
    if (!user) return res.status(401).send("no auth");

    const { name } = req.body;
    if (!name) return res.status(400).send("name req");

    const newEmp = {
        id: genId(),
        name,
        pin: genPin()
    };

    store.emps.push(newEmp);
    res.json(newEmp);
});

router.put("/emps/:id", (req, res) => {
    const user = checkAuth(req);
    if (!user) return res.status(401).send("no auth");

    const id = Number(req.params.id);
    const { name, pin } = req.body;
    const emp = store.emps.find(e => e.id === id);

    if (!emp) return res.status(404).send("not found");
    if (name) emp.name = name;
    if (pin) emp.pin = pin;

    res.json(emp);
});

router.delete("/emps/:id", (req, res) => {
    const user = checkAuth(req);
    if (!user) return res.status(401).send("no auth");

    const id = Number(req.params.id);
    store.emps = store.emps.filter(e => e.id !== id);

    res.send("deleted");
});

export default router;
