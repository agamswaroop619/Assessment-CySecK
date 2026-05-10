import store from "../store/dataStore.js";

const checkAuth = (req) => {
    const userId = Number(req.headers["x-user"]);
    const user = store.emps.find(e => e.id === userId);

    if (!user) {
        console.log("auth fail");
        return null;
    }

    console.log("auth ok:", user.name);
    return user;
};

export default checkAuth;
