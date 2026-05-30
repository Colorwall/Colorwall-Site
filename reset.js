const fs = require('fs');
const { MongoClient } = require('mongodb');

async function reset() {
    const env = fs.readFileSync('.env.local', 'utf8');
    const getVar = (name) => {
        const line = env.split('\n').find(l => l.startsWith(name + '='));
        return line ? line.substring(name.length + 1).trim().replace(/^['"]|['"]$/g, '') : null;
    };
    
    const ghToken = getVar('GITHUB_TOKEN');
    const ghOwner = getVar('GITHUB_OWNER');
    const ghRepo = getVar('GITHUB_REPO');
    const mongoUri = getVar('MONGODB_URI');
    
    console.log('Fetching issues to delete...');
    const res = await fetch(`https://api.github.com/repos/${ghOwner}/${ghRepo}/issues?state=all&per_page=100`, {
        headers: { 'Authorization': `Bearer ${ghToken}`, 'Accept': 'application/vnd.github.v3+json' }
    });
    
    const issues = await res.json();
    for (const issue of issues) {
        if (!issue.pull_request) {
            console.log(`Closing issue #${issue.number}...`);
            await fetch(`https://api.github.com/repos/${ghOwner}/${ghRepo}/issues/${issue.number}`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${ghToken}`, 'Accept': 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
                body: JSON.stringify({ state: 'closed' })
            });
        }
    }
    
    console.log('Resetting MongoDB flags...');
    const client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db('ColorWall');
    await db.collection('feedback').updateMany({}, { $unset: { migratedToGithub: '', githubIssueUrl: '' } });
    await client.close();
    console.log('Done!');
}
reset().catch(console.error);
