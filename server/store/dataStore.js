import config from "../config.js";

const store = {
    emps: config.emps.map(e => ({ ...e })),
    revs: config.revs.map(r => ({ ...r, assignedTo: [...r.assignedTo] })),
    fb: [],
    scorecards: []
};

export default store;
