const express = require("express");

function startMockServer(port = 3001) {
  const app = express();
  app.use(express.json({ limit: "512kb" }));

  const users = new Map();
  const events = [];

  const ok = (data = {}) => ({
    statusCode: 1,
    statusString: "OK",
    data,
  });

  const fail = (message) => ({
    statusCode: 0,
    statusString: message,
  });

  app.post("/ISAPI/AccessControl/UserInfo/Record", (req, res) => {
    const userInfo = req.body?.UserInfo;
    if (!userInfo || !userInfo.employeeNo) {
      return res.status(400).json(fail("UserInfo.employeeNo is required"));
    }

    const key = String(userInfo.employeeNo);
    const stored = {
      ...userInfo,
      employeeNo: key,
      createdAt: new Date().toISOString(),
    };
    users.set(key, stored);

    return res.json(ok({ UserInfo: stored }));
  });

  app.put("/ISAPI/AccessControl/UserInfo/Modify", (req, res) => {
    const userInfo = req.body?.UserInfo;
    if (!userInfo || !userInfo.employeeNo) {
      return res.status(400).json(fail("UserInfo.employeeNo is required"));
    }

    const key = String(userInfo.employeeNo);
    if (!users.has(key)) {
      return res.status(404).json(fail("User not found"));
    }

    const updated = {
      ...users.get(key),
      ...userInfo,
      employeeNo: key,
      updatedAt: new Date().toISOString(),
    };
    users.set(key, updated);

    return res.json(ok({ UserInfo: updated }));
  });

  app.put("/ISAPI/AccessControl/UserInfo/Delete", (req, res) => {
    const userInfo = req.body?.UserInfo;
    const employeeNo = userInfo?.employeeNo;
    if (!employeeNo) {
      return res.status(400).json(fail("UserInfo.employeeNo is required"));
    }

    const key = String(employeeNo);
    if (!users.has(key)) {
      return res.status(404).json(fail("User not found"));
    }

    users.delete(key);
    return res.json(ok({ employeeNo: key }));
  });

  app.post("/ISAPI/AccessControl/AcsEvent", (req, res) => {
    const search = req.body?.SearchDescription || {};
    const limit = Number(search.maxResults || 100);
    const start = search.startTime ? new Date(search.startTime) : null;
    const end = search.endTime ? new Date(search.endTime) : null;

    let filtered = [...events];
    if (start) {
      filtered = filtered.filter(
        (event) => new Date(event.eventTime).getTime() >= start.getTime(),
      );
    }
    if (end) {
      filtered = filtered.filter(
        (event) => new Date(event.eventTime).getTime() <= end.getTime(),
      );
    }

    if (Number.isFinite(limit) && limit > 0) {
      filtered = filtered.slice(-limit);
    }

    return res.json(
      ok({
        total: filtered.length,
        AcsEvent: {
          InfoList: filtered,
        },
      }),
    );
  });

  app.post("/simulate-scan", (req, res) => {
    const employeeNo = req.body?.employeeNo;
    if (!employeeNo) {
      return res.status(400).json(fail("employeeNo is required"));
    }

    const user = users.get(String(employeeNo));
    if (!user) {
      return res.status(404).json(fail("User not found"));
    }

    const event = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      employeeNo: String(employeeNo),
      userName: user.name || "Unknown",
      eventTime: new Date().toISOString(),
      doorNo: 1,
      eventType: "fingerprint",
      result: "success",
    };
    events.push(event);

    return res.json(ok({ event }));
  });

  const server = app.listen(port, () => {
    console.log(`Mock Hikvision running on http://localhost:${port}`);
  });

  return server;
}

module.exports = startMockServer;
