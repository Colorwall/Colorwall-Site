const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const crypto = require("node:crypto");
const ts = require("typescript");

function loadRoute(path, fetchMock) {
    const source = fs.readFileSync(path, "utf8");
    const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
    const exports = {};
    const context = {
        exports, require: (name) => name === "next/server" ? { NextResponse: { json: (body, options = {}) => ({ body, status: options.status ?? 200 }) } } : require(name),
        process: { env: { RAZORPAY_KEY_ID: "test_key", RAZORPAY_KEY_SECRET: "test_secret" } },
        fetch: fetchMock, crypto, Buffer,
    };
    vm.runInNewContext(code, context, { filename: path });
    return exports.POST;
}

test("order uses the selected currency, correct minor units and a valid receipt", async () => {
    let sent;
    const post = loadRoute("src/app/api/donate/order/route.ts", async (_url, options) => {
        sent = JSON.parse(options.body);
        return { ok: true, json: async () => ({ id: "order_test", amount: sent.amount, currency: sent.currency }) };
    });
    const result = await post({ json: async () => ({ amount: 1025, currency: "USD" }) });
    assert.equal(result.status, 200);
    assert.equal(sent.amount, 1025);
    assert.equal(sent.currency, "USD");
    assert.ok(sent.receipt.length <= 40);
    assert.equal(result.body.currency, "USD");
    const defaultResult = await post({ json: async () => ({ amount: 1000 }) });
    assert.equal(defaultResult.body.currency, "USD");
    assert.equal((await post({ json: async () => ({ amount: 1025, currency: "XYZ" }) })).status, 400);
    assert.equal((await post({ json: async () => ({ amount: 99, currency: "USD" }) })).status, 400);
});

test("verification accepts a valid signature and rejects a modified one", async () => {
    const post = loadRoute("src/app/api/donate/verify/route.ts");
    const order = "order_test";
    const payment = "pay_test";
    const signature = crypto.createHmac("sha256", "test_secret").update(`${order}|${payment}`).digest("hex");
    const request = (sig) => ({ json: async () => ({ razorpay_order_id: order, razorpay_payment_id: payment, razorpay_signature: sig }) });
    assert.equal((await post(request(signature))).body.verified, true);
    assert.equal((await post(request("0".repeat(64)))).body.verified, false);
});
