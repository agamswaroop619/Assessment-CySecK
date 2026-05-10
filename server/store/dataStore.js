import config from "../config.js";
import { normalizeStoredEmp } from "../utils/normalizeEmp.js";

const store = {
    emps: config.emps.map((e) => normalizeStoredEmp(e)),
    revs: config.revs.map(r => ({ ...r, assignedTo: [...r.assignedTo] })),
    fb: [],
    scorecards: []
};

export default store;
