const axios = require("axios");
const { DEVICE_URL } = require("./deviceConfig");

const client = axios.create({
  baseURL: DEVICE_URL,
  timeout: 10000,
});

const unwrap = async (requestPromise) => {
  const { data } = await requestPromise;
  return data;
};

async function addUser(userData) {
  return unwrap(
    client.post("/ISAPI/AccessControl/UserInfo/Record", {
      UserInfo: userData,
    })
  );
}

async function editUser(userData) {
  return unwrap(
    client.put("/ISAPI/AccessControl/UserInfo/Modify", {
      UserInfo: userData,
    })
  );
}

async function deleteUser(employeeNo) {
  return unwrap(
    client.put("/ISAPI/AccessControl/UserInfo/Delete", {
      UserInfo: {
        employeeNo: String(employeeNo),
      },
    })
  );
}

async function renewMembership(userData) {
  return editUser(userData);
}

async function getAttendanceLogs(filters = {}) {
  return unwrap(
    client.post("/ISAPI/AccessControl/AcsEvent", {
      SearchDescription: {
        ...filters,
      },
    })
  );
}

async function simulateFingerprintScan(employeeNo) {
  return unwrap(
    client.post("/simulate-scan", {
      employeeNo: String(employeeNo),
    })
  );
}

module.exports = {
  addUser,
  editUser,
  deleteUser,
  renewMembership,
  getAttendanceLogs,
  simulateFingerprintScan,
};
