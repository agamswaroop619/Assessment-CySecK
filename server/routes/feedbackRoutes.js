import { Router } from "express";
import checkAuth from "../middleware/checkAuth.js";
import store from "../store/dataStore.js";
import { genId } from "../utils/id.js";

const router = Router();

router.get("/fb/:reviewId", (req, res) => {
    checkAuth(req);
    const reviewId = Number(req.params.reviewId);
    const data = store.fb.filter(f => f.reviewId === reviewId);
    res.json(data);
});

router.post("/fb", (req, res) => {
    const user = checkAuth(req);
    if (!user) return res.status(401).send("no auth");

    const { reviewId, fromId, text } = req.body;
    if (!reviewId || !fromId || !text) return res.status(400).send("missing");

    const already = store.fb.find(
        f => f.reviewId === reviewId && f.fromId === fromId
    );
    if (already) return res.status(400).send("already given");

    const newFb = {
        id: genId(),
        reviewId,
        fromId,
        text
    };

    store.fb.push(newFb);
    res.json(newFb);
});

export default router;
