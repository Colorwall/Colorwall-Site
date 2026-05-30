const fs = require('fs');
const { MongoClient } = require('mongodb');

async function importFeedback() {
    console.log("Loading env vars...");
    const env = fs.readFileSync('.env.local', 'utf8');
    const getVar = (name) => {
        const line = env.split('\n').find(l => l.startsWith(name + '='));
        return line ? line.substring(name.length + 1).trim().replace(/^['"]|['"]$/g, '') : null;
    };
    
    const mongoUri = getVar('MONGODB_URI');
    const ghToken = getVar('GITHUB_TOKEN');
    const ghOwner = getVar('GITHUB_OWNER');
    const ghRepo = getVar('GITHUB_REPO'); 
    
    if (!mongoUri || !ghToken || !ghOwner || !ghRepo) {
        console.error("Missing env vars!");
        return;
    }
    
    console.log("Connecting to MongoDB...");
    const client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db('ColorWall');
    
    const feedbackDocs = await db.collection('feedback').find().sort({ createdAt: 1 }).toArray();
    console.log(`Found ${feedbackDocs.length} feedback items to migrate.`);
    
    for (const doc of feedbackDocs) {
        // Skip if already migrated (optional, but good if we run it multiple times)
        if (doc.migratedToGithub) continue;
        
        console.log(`Migrating feedback from ${doc.username}...`);
        let body = `<!-- META_START\n${JSON.stringify({
            source: doc.source || 'Web',
            appVersion: doc.appVersion,
            createdAt: doc.createdAt
        }, null, 2)}\nMETA_END -->\n\n`;
        
        body += `**Source:** ${doc.source || 'Web'}\n`;
        if (doc.appVersion) body += `**App Version:** ${doc.appVersion}\n`;
        body += `**Original Date:** ${doc.createdAt}\n\n`;
        body += `${doc.text || ''}\n\n`;
        
        if (doc.images && doc.images.length > 0) {
            body += `### Attached Images\n`;
            for (const img of doc.images) {
                body += `![](${img})\n`;
            }
        }
        
        const labels = doc.labels || ['feedback', doc.source || 'Web'];
        
        // 1. Create the issue
        const res = await fetch(`https://api.github.com/repos/${ghOwner}/${ghRepo}/issues`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ghToken}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: `Feedback from ${doc.username || 'Anonymous'}`,
                body,
                labels
            })
        });
        
        if (!res.ok) {
            console.error(`Failed to create issue for ${doc._id}: ${await res.text()}`);
            continue;
        }
        
        const issue = await res.json();
        console.log(`Created issue #${issue.number} for ${doc._id}`);
        
        // 2. Add replies as comments
        if (doc.replies && doc.replies.length > 0) {
            for (const reply of doc.replies) {
                const commentBody = `**Reply from ${reply.username}** on ${reply.createdAt}:\n\n${reply.text}`;
                await fetch(`https://api.github.com/repos/${ghOwner}/${ghRepo}/issues/${issue.number}/comments`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${ghToken}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ body: commentBody })
                });
                console.log(`  Added reply comment to issue #${issue.number}`);
            }
        }
        
        // Mark as migrated
        await db.collection('feedback').updateOne({ _id: doc._id }, { $set: { migratedToGithub: true, githubIssueUrl: issue.html_url } });
        
        // Rate limit protection
        await new Promise(r => setTimeout(r, 1500));
    }
    
    console.log("Migration complete!");
    await client.close();
}

importFeedback().catch(console.error);
