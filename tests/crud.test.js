import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import jwt from "jsonwebtoken";
import User from "../src/models/users.js";
import Machine from "../src/models/machine.js";
import Report from "../src/models/report.js";
import machineRouter from "../src/routes/machineRouter.js";
import reportRouter from "../src/routes/reportRouter.js";
import profileRouter from "../src/routes/profileRouter.js";
import {errorHandler} from "../src/middlewares/errorHandler.js";

// Tests HTTP avec les appels MongoDB simules.
test("machines, signalements et profil : parcours et regles metier", async () => {
    const originals = [];
    const mock = (model, method, value) => {
        originals.push([model, method, model[method]]);
        model[method] = value;
    };
    const userId = "507f1f77bcf86cd799439011";
    const machineId = "507f1f77bcf86cd799439012";
    const reportId = "507f1f77bcf86cd799439013";
    const user = {_id : userId, name : "Test", email : "test@example.com", tokenVersion : 0};
    let machine;
    let report;
    const query = value => ({
        populate(){return this}, sort(){return Promise.resolve(value)},
        then(resolve, reject){return Promise.resolve(value).then(resolve, reject)}
    });
    mock(User, "findById", () => ({select : async () => user}));
    mock(User, "findOne", async ({email}) => email === "used@example.com" ? {_id : "other"} : null);
    mock(User, "findByIdAndUpdate", (id, update) => {
        assert.equal(id, userId);
        Object.assign(user, update.$set);
        return {select : async () => user};
    });
    mock(Machine, "findOne", async filter => {
        if(!machine || filter.reference !== machine.reference) return null;
        if(filter._id?.$ne === machine._id) return null;
        return machine;
    });
    mock(Machine, "findById", async id => machine?._id === id ? machine : null);
    mock(Machine, "find", async filter => {
        return machine && Object.entries(filter).every(([key, value]) => machine[key] === value) ? [machine] : [];
    });
    mock(Machine, "create", async data => {
        machine = {...data, _id : machineId, save : async () => machine};
        return machine;
    });
    mock(Machine, "deleteOne", async () => {machine = null; return {deletedCount : 1}});
    mock(Report, "exists", async () => !!report);
    mock(Report, "create", async data => {
        report = {...data, _id : reportId, resolutionNote : "", resolvedAt : null, save : async () => report};
        return report;
    });
    mock(Report, "findById", id => query(report?._id === id ? report : null));
    mock(Report, "find", filter => query(
        report && Object.entries(filter).every(([key, value]) => report[key] === value) ? [report] : []
    ));
    const secret = "crud-test-only";
    const previousSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = secret;
    const token = jwt.sign({sub : userId, tokenVersion : 0}, secret);
    const app = express();
    app.use(express.json());
    app.use("/api/machines", machineRouter);
    app.use("/api/reports", reportRouter);
    app.use("/api/profile", profileRouter);
    app.use(errorHandler);
    const server = app.listen(0, "127.0.0.1");
    await new Promise(resolve => server.once("listening", resolve));
    const base = "http://127.0.0.1:" + server.address().port;
    const call = async (method, path, body, authenticated = true) => {
        const response = await fetch(base + path, {
            method, headers : {
                "Content-Type" : "application/json",
                ...(authenticated ? {Authorization : "Bearer " + token} : {})
            },
            body : body === undefined ? undefined : JSON.stringify(body)
        });
        return {status : response.status, body : await response.json()};
    };
    try{
        assert.equal((await call("GET", "/api/reports", undefined, false)).status, 401);
        assert.equal((await call("POST", "/api/machines", {reference:"M1",name:" ",workshop:"A"})).status, 400);
        assert.equal((await call("POST", "/api/machines", {reference:"M1",name:"Machine",workshop:"A"})).status, 201);
        assert.equal((await call("POST", "/api/machines", {reference:"M1",name:"Machine",workshop:"A"})).status, 409);
        assert.equal((await call("GET", "/api/machines/M1")).body.machine._id, machineId);
        assert.equal((await call("GET", "/api/machines?workshop=B")).body.machines.length, 0);
        assert.equal((await call("GET", "/api/machines?status=unknown")).status, 400);
        assert.equal((await call("PATCH", "/api/machines/M1", {})).status, 400);
        assert.equal((await call("PATCH", "/api/machines/M1", {name:123})).status, 400);
        assert.equal((await call("PATCH", "/api/machines/M1", {reference:" "})).status, 400);
        assert.equal((await call("PATCH", "/api/machines/M1", {workshop:" "})).status, 400);
        assert.equal((await call("PATCH", "/api/machines/M1", {status:"unknown"})).status, 400);
        assert.equal((await call("PATCH", "/api/machines/M1", {name:"New machine",workshop:"B",reference:"M1"})).status, 200);
        assert.equal(machine.name, "New machine");
        assert.equal(machine.workshop, "B");
        assert.equal((await call("PATCH", "/api/machines/M1", {status:"maintenance"})).status, 200);
        assert.equal((await call("DELETE", "/api/machines/M1")).status, 200);
        await call("POST", "/api/machines", {reference:"M1",name:"Machine",workshop:"A"});
        assert.equal((await call("POST", "/api/reports", {description:"Panne"})).status, 400);
        assert.equal((await call("POST", "/api/reports", {reference:" ",description:"Panne"})).status, 400);
        assert.equal((await call("POST", "/api/reports", {reference:123,description:"Panne"})).status, 400);
        assert.equal((await call("POST", "/api/reports", {reference:"M1",description:" "})).status, 400);
        assert.equal((await call("POST", "/api/reports", {reference:"UNKNOWN",description:"Panne"})).status, 404);
        const created = await call("POST", "/api/reports", {reference:" M1 ",description:"Panne",reportedBy:"other"});
        assert.equal(created.status, 201);
        assert.equal(created.body.report.machine, machineId);
        assert.equal(created.body.report.reportedBy, userId);
        assert.equal((await call("GET", "/api/reports/" + reportId)).status, 200);
        assert.equal((await call("GET", "/api/reports/bad")).status, 400);
        assert.equal((await call("GET", "/api/reports?status=unknown")).status, 400);
        assert.equal((await call("GET", "/api/reports?reference=M1")).body.reports.length, 1);
        assert.equal((await call("GET", "/api/reports?reference=UNKNOWN")).status, 404);
        assert.equal((await call("GET", "/api/reports?reference=")).status, 400);
        await call("PATCH", "/api/machines/M1", {reference:"M2"});
        assert.equal((await call("GET", "/api/reports?reference=M2")).body.reports.length, 1);
        assert.equal((await call("GET", "/api/reports?reference=M1")).status, 404);
        await call("PATCH", "/api/machines/M2", {reference:"M1"});
        assert.equal((await call("PATCH", "/api/reports/" + reportId, {status:"resolved"})).status, 400);
        assert.equal((await call("PATCH", "/api/reports/" + reportId, {status:"in_progress"})).status, 200);
        assert.equal((await call("PATCH", "/api/reports/" + reportId, {status:"open"})).status, 409);
        const resolved = await call("PATCH", "/api/reports/" + reportId, {status:"resolved",resolutionNote:"Piece remplacee"});
        assert.equal(resolved.status, 200);
        assert.ok(resolved.body.report.resolvedAt);
        const date = resolved.body.report.resolvedAt;
        const edited = await call("PATCH", "/api/reports/" + reportId, {description:"Panne corrigee",resolvedAt:"fake"});
        assert.equal(edited.body.report.resolvedAt, date);
        assert.equal((await call("PATCH", "/api/reports/" + reportId, {resolutionNote:" "})).status, 400);
        assert.equal((await call("PATCH", "/api/reports/" + reportId, {status:"in_progress"})).status, 409);
        assert.equal((await call("GET", "/api/machines/M1/reports")).body.reports.length, 1);
        assert.equal((await call("DELETE", "/api/machines/M1")).status, 409);
        assert.equal((await call("PATCH", "/api/profile", {email:"used@example.com"})).status, 409);
        assert.equal((await call("PATCH", "/api/profile", {})).status, 400);
        const profile = await call("PATCH", "/api/profile", {name:"New",email:"NEW@example.com",tokenVersion:99});
        assert.equal(profile.status, 200);
        assert.equal(profile.body.user_update.email, "new@example.com");
        assert.equal(user.tokenVersion, 0);
        assert.ok(!("password" in profile.body.user_update));
    }finally{
        server.closeAllConnections();
        await new Promise(resolve => server.close(resolve));
        for(const [model, method, original] of originals) model[method] = original;
        if(previousSecret === undefined) delete process.env.JWT_SECRET;
        else process.env.JWT_SECRET = previousSecret;
    }
});

test("modele signalement : description, statut et note de resolution", async () => {
    const base = {machine:"507f1f77bcf86cd799439012",reportedBy:"507f1f77bcf86cd799439011",description:"Panne"};
    assert.equal(new Report(base).status, "open");
    await assert.rejects(new Report({...base, description:" "}).validate());
    await assert.rejects(new Report({...base, status:"unknown"}).validate());
    await assert.rejects(new Report({...base, status:"resolved"}).validate());
    await new Report({...base, status:"resolved",resolutionNote:"Reparee",resolvedAt:new Date()}).validate();
});
