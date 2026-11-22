// automated test suite for razorpay donation routes
// validates order creation request handling, currency constraints, and hmac signature verification

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
    exports,
    require: (name) => {
      if (name === "next/server") {
        return {
          NextResponse: {
            json: (body, options = {}) => ({ body, status: options.status ?? 200 }),
          },
        };
      }
      return require(name);
    },
    process: {
      env: {
        RAZORPAY_KEY_ID: "test_key",
        RAZORPAY_KEY_SECRET: "test_secret",
      },
    },
    fetch: fetchMock,
    crypto,
    Buffer,
  };
  vm.runInNewContext(code, context, { filename: path });
  return exports.POST;
}

test("order route uses selected currency, validates minor units, and enforces receipt length", async () => {
  let sent;
  const post = loadRoute("src/app/api/donate/order/route.ts", async (_url, options) => {
    sent = JSON.parse(options.body);
    return {
      ok: true,
      json: async () => ({ id: "order_test", amount: sent.amount, currency: sent.currency }),
    };
  });

  const validResult = await post({ json: async () => ({ amount: 1025, currency: "USD" }) });
  assert.equal(validResult.status, 200);
  assert.equal(sent.amount, 1025);
  assert.equal(sent.currency, "USD");
  assert.ok(sent.receipt.length <= 40);
  assert.equal(validResult.body.currency, "USD");

  const invalidCurrencyResult = await post({ json: async () => ({ amount: 1025, currency: "XYZ" }) });
  assert.equal(invalidCurrencyResult.status, 400);

  const invalidAmountResult = await post({ json: async () => ({ amount: 99, currency: "USD" }) });
  assert.equal(invalidAmountResult.status, 400);
});

test("verify route accepts authentic hmac-sha256 signature and rejects forged signatures", async () => {
  const post = loadRoute("src/app/api/donate/verify/route.ts");
  const order = "order_test";
  const payment = "pay_test";
  const authenticSignature = crypto
    .createHmac("sha256", "test_secret")
    .update(`${order}|${payment}`)
    .digest("hex");

  const validReq = {
    json: async () => ({
      razorpay_order_id: order,
      razorpay_payment_id: payment,
      razorpay_signature: authenticSignature,
    }),
  };
  const validRes = await post(validReq);
  assert.equal(validRes.body.verified, true);

  const forgedReq = {
    json: async () => ({
      razorpay_order_id: order,
      razorpay_payment_id: payment,
      razorpay_signature: "0".repeat(64),
    }),
  };
  const forgedRes = await post(forgedReq);
  assert.equal(forgedRes.body.verified, false);
});
