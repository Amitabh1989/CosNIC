const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
console.log("Base URL is :", BASE_URL);

const apiEndpoints = {
    loginUser: `${BASE_URL}/user/login/`,
    getUsers: `${BASE_URL}/users`,
    getTestCases: `${BASE_URL}/testops/testcase/`,
    getTestCaseByID: (id) => `${BASE_URL}/testops/testcase`,
    createTest: `${BASE_URL}/tests/create`,
    updateTest: (id) => `${BASE_URL}/tests/${id}/update`,
    deleteTest: (id) => `${BASE_URL}/tests/${id}/delete`,
    // Add more endpoints as needed
    getUserVenvs: `${BASE_URL}/testops/user/venvs/`,
    getUserVenvsByID: (id) => `${BASE_URL}/testops/user/venvs/${id}`,
    // Config File APIS
    getSutClientYmlConfigFilesList: `${BASE_URL}/configuration/sutclientyml/`,
    // getSutClientYmlConfigFilesList: `/configuration/sutclientyml/`,
    getSutClientYmlConfigFileByID: (id) =>
        `${BASE_URL}/configuration/sutclientyml/${id}/`,
    saveSutClientYmlConfigFile: (id) =>
        `${BASE_URL}/configuration/sutclientyml/${id}/`,
};

export default apiEndpoints;
