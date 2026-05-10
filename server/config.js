const config = {
    port: 7250,
    emps: [
        { id: 1, name: "Admin", password: "admin@123", role: "admin", dept: "admin", avatarUrl: "https://i.pravatar.cc/100?u=admin-1" },
        { id: 2, name: "John Doe", password: "john@123", role: "manager", dept: "engineering", avatarUrl: "https://i.pravatar.cc/100?u=john-doe-2" },
        { id: 3, name: "Jane Smith", password: "jane@123", role: "hr", dept: "hr", avatarUrl: "https://i.pravatar.cc/100?u=jane-smith-3" },
        { id: 4, name: "Mike Ross", password: "mike@123", role: "employee", dept: "engineering", avatarUrl: "https://i.pravatar.cc/100?u=mike-ross-4" },
        { id: 5, name: "Emma Stone", password: "emma@123", role: "employee", dept: "engineering", avatarUrl: "https://i.pravatar.cc/100?u=emma-stone-5" }
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
