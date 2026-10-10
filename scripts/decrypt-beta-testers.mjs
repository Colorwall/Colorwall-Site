import fs from "fs";
import path from "path";
import crypto from "crypto";
import { MongoClient } from "mongodb";

// attempt to load environment variables from local env files if not set in process
function loadEnvFile(filename) {
    const filePath = path.resolve(process.cwd(), filename);
    if (!fs.existsSync(filePath)) return;
    const content = fs.readFileSync(filePath, "utf8");
    for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx === -1) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
        }
        if (!process.env[key]) {
            process.env[key] = val;
        }
    }
}

// load local environment configs
loadEnvFile(".env.local");
loadEnvFile(".env");

// retrieve runtime encryption key from environment secret
function getEncryptionKey() {
    const secret = process.env.ENCRYPTION_SECRET || process.env.NEXTAUTH_SECRET;
    if (!secret) {
        throw new Error(
            "missing runtime secret! please provide ENCRYPTION_SECRET or NEXTAUTH_SECRET via .env.local or shell environment."
        );
    }
    return crypto.createHash("sha256").update(secret).digest();
}

// decrypt aes 256 gcm ciphertext bundle back to plain email string
function decryptEmail(ciphertext, key) {
    try {
        const [ivHex, tagHex, dataHex] = ciphertext.split(":");
        if (!ivHex || !tagHex || !dataHex) return "[malformed ciphertext]";
        const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(ivHex, "hex"));
        decipher.setAuthTag(Buffer.from(tagHex, "hex"));
        const decrypted = Buffer.concat([decipher.update(Buffer.from(dataHex, "hex")), decipher.final()]);
        return decrypted.toString("utf8");
    } catch (err) {
        return `[decryption failed: ${err.message}]`;
    }
}

async function run() {
    console.log("==================================================");
    console.log("       Colorwall Beta Testers Decryption CLI      ");
    console.log("==================================================\n");

    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        console.error("error: MONGODB_URI is not set in environment or .env.local");
        process.exit(1);
    }

    let key;
    try {
        key = getEncryptionKey();
        console.log("runtime encryption key derived successfully.");
    } catch (keyErr) {
        console.error("key derivation error:", keyErr.message);
        process.exit(1);
    }

    const client = new MongoClient(mongoUri);
    try {
        console.log("connecting to mongodb...");
        await client.connect();
        const db = client.db("colorwall");
        const collection = db.collection("beta_testers");

        const records = await collection.find({}).sort({ createdAt: -1 }).toArray();
        console.log(`found ${records.length} registered early peeps in database.\n`);

        if (records.length === 0) {
            console.log("no beta records found to decrypt.");
            return;
        }

        const decryptedList = records.map((rec) => {
            const email = rec.encryptedEmail ? decryptEmail(rec.encryptedEmail, key) : "[no encrypted email]";
            return {
                testerId: rec.testerId || "[none]",
                email,
                tier: rec.tier || "early peeps",
                joinedAt: rec.createdAt || rec.updatedAt || "[unknown]",
                emailHash: rec.emailHash ? `${rec.emailHash.slice(0, 10)}...` : "[none]"
            };
        });

        // print table preview to terminal
        console.table(decryptedList.map(r => ({
            "Pass ID": r.testerId,
            "Decrypted Email": r.email,
            "Tier": r.tier,
            "Joined At": r.joinedAt
        })));

        // check for export command line flag
        const exportArg = process.argv.find(arg => arg.startsWith("--export="));
        if (exportArg) {
            const format = exportArg.split("=")[1].toLowerCase();
            if (format === "csv") {
                const csvHeader = "TesterId,Email,Tier,JoinedAt\n";
                const csvRows = decryptedList.map(r => `"${r.testerId}","${r.email}","${r.tier}","${r.joinedAt}"`).join("\n");
                const outPath = path.resolve(process.cwd(), "beta_testers_export.csv");
                fs.writeFileSync(outPath, csvHeader + csvRows, "utf8");
                console.log(`\nsuccessfully exported ${decryptedList.length} testers to: ${outPath}`);
            } else if (format === "json") {
                const outPath = path.resolve(process.cwd(), "beta_testers_export.json");
                fs.writeFileSync(outPath, JSON.stringify(decryptedList, null, 2), "utf8");
                console.log(`\nsuccessfully exported ${decryptedList.length} testers to: ${outPath}`);
            }
        } else {
            console.log("\ntip: pass --export=csv or --export=json to export the list directly.");
            console.log("example: pnpm run decrypt-testers --export=csv");
        }
    } catch (err) {
        console.error("execution error:", err.message);
    } finally {
        await client.close();
    }
}

run();
