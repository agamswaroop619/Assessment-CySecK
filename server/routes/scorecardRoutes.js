import { Router } from "express";
import checkAuth from "../middleware/checkAuth.js";
import store from "../store/dataStore.js";
import { genId } from "../utils/id.js";

const router = Router();

const metrics = [
    "technical_skills",
    "communication",
    "teamwork",
    "leadership",
    "problem_solving",
    "ownership",
    "adaptability",
    "delivery_quality"
];

router.post("/scorecard", (req, res) => {
    const user = checkAuth(req);
    if (!user) return res.status(401).send("no auth");

    const {
        review_id,
        employee_id,
        reviewer_id,
        technical_skills,
        communication,
        teamwork,
        leadership,
        problem_solving,
        ownership,
        adaptability,
        delivery_quality,
        comment
    } = req.body;

    const requiredIds = [review_id, employee_id, reviewer_id];
    if (requiredIds.some(v => v === undefined || v === null)) {
        return res.status(400).send("missing");
    }

    const scores = [
        technical_skills,
        communication,
        teamwork,
        leadership,
        problem_solving,
        ownership,
        adaptability,
        delivery_quality
    ];

    const invalidScore = scores.some(s => !Number.isInteger(s) || s < 1 || s > 5);
    if (invalidScore) return res.status(400).send("scores must be integers 1-5");

    const newScorecard = {
        id: genId(),
        review_id,
        employee_id,
        reviewer_id,
        technical_skills,
        communication,
        teamwork,
        leadership,
        problem_solving,
        ownership,
        adaptability,
        delivery_quality,
        comment: comment ?? ""
    };

    store.scorecards.push(newScorecard);
    console.log("scorecard added:", newScorecard.id);
    res.json(newScorecard);
});

router.get("/scorecard/dept-summary", (req, res) => {
    const { dept } = req.query;
    const deptEmployees = store.emps.filter(e => e.dept === dept);
    const employeeIds = new Set(deptEmployees.map(e => e.id));
    const deptScorecards = store.scorecards.filter(s => employeeIds.has(s.employee_id));
    const count = deptScorecards.length;

    const averages = {};
    metrics.forEach(metric => {
        const total = deptScorecards.reduce((sum, s) => sum + (s[metric] ?? 0), 0);
        averages[metric] = count === 0 ? 0 : total / count;
    });

    res.json({
        dept: dept ?? "",
        employee_count: deptEmployees.length,
        averages
    });
});

router.get("/scorecard/:employee_id", (req, res) => {
    const employeeId = Number(req.params.employee_id);
    const data = store.scorecards.filter(s => s.employee_id === employeeId);
    res.json(data);
});

router.put("/scorecard/:id", (req, res) => {
    const id = Number(req.params.id);
    const scorecard = store.scorecards.find(s => s.id === id);
    if (!scorecard) return res.status(404).send("not found");

    const {
        review_id,
        employee_id,
        reviewer_id,
        technical_skills,
        communication,
        teamwork,
        leadership,
        problem_solving,
        ownership,
        adaptability,
        delivery_quality,
        comment
    } = req.body;

    if (review_id !== undefined) scorecard.review_id = review_id;
    if (employee_id !== undefined) scorecard.employee_id = employee_id;
    if (reviewer_id !== undefined) scorecard.reviewer_id = reviewer_id;
    if (technical_skills !== undefined) scorecard.technical_skills = technical_skills;
    if (communication !== undefined) scorecard.communication = communication;
    if (teamwork !== undefined) scorecard.teamwork = teamwork;
    if (leadership !== undefined) scorecard.leadership = leadership;
    if (problem_solving !== undefined) scorecard.problem_solving = problem_solving;
    if (ownership !== undefined) scorecard.ownership = ownership;
    if (adaptability !== undefined) scorecard.adaptability = adaptability;
    if (delivery_quality !== undefined) scorecard.delivery_quality = delivery_quality;
    if (comment !== undefined) scorecard.comment = comment;

    res.json(scorecard);
});

router.get("/scorecard/gaps/:employee_id", (req, res) => {
    const employeeId = Number(req.params.employee_id);
    const employeeScorecards = store.scorecards.filter(s => s.employee_id === employeeId);
    const count = employeeScorecards.length;

    const gaps = metrics
        .map(param => {
            const total = employeeScorecards.reduce((sum, s) => sum + (s[param] ?? 0), 0);
            const avg = count === 0 ? 0 : total / count;
            return {
                param,
                avg,
                needs_improvement: avg < 3.0
            };
        })
        .sort((a, b) => a.avg - b.avg);

    const comments = employeeScorecards
        .map(s => s.comment)
        .filter(c => typeof c === "string" && c.trim() !== "");

    res.json({ gaps, comments });
});

export default router;
