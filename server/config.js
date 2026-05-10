const config = {
    port: 7250,
    emps: [
        { id: 1, name: "admin", pin: "admin@123", role: "admin", dept: "admin" },
        { id: 2, name: "john doe", pin: "john@123", role: "manager", dept: "engineering" },
        { id: 3, name: "jane smith", pin: "jane@123", role: "hr", dept: "hr" },
        { id: 4, name: "mike ross", pin: "mike@123", role: "employee", dept: "engineering" },
        { id: 5, name: "emma stone", pin: "emma@123", role: "employee", dept: "engineering" }
    ],
    revs: [
        {
            id: 1,
            title: "Q1",
            empId: 2,
            assignedTo: [3]
        },
        {
            id: 2,
            title: "Q2",
            empId: 3,
            assignedTo: [2]
        },
        {
            id: 3,
            title: "Q3",
            empId: 4,
            assignedTo: [2]
        },
        {
            id: 4,
            title: "Q4",
            empId: 5,
            assignedTo: [2]
        }
    ]
};

export default config;
