const git = require('simple-git/promise')();

const remote = `https://${process.env.GITHUB_RELEASE_TOKEN}@github.com/BrightspaceUI/core`;
const branchName = 'travis-commit-experiment';

function commit() {

	git.addConfig('user.name', 'BrightspaceGitHubReader');
	git.addConfig('user.email', 'brightspacegithubreader@d2l.com');
	git.addConfig('push.default', 'simple');
	git.addConfig('remote.origin.fetch', 'refs/heads/*:refs/remotes/origin/*');

	console.log('Committing, tagging and pushing...');
	console.group();

	return git.fetch()
		.then(() => {
			return git.checkout(branchName);
		}).then(() => {
			return git.branch();
		}).then((data) => {
			if (data.current !== branchName) {
				process.exit(1);
			}
			console.log(`Checked out branch ${branchName}`);

			return git.add('*');
		}).then(() => {
			console.log('added, commiting...');
			const commitMessage = '[skip ci] test commit';
			return git.commit(commitMessage);
		}).then((status) => {
			console.log(status);
			console.log('Committed. Pushing...');
			return git.push(remote, branchName);
		});
}

commit()
	.then(() => {
		console.groupEnd();
		console.log('Committed successfully.');
		process.exit(0);
	}).catch((err) => {
		console.error(err);
		console.groupEnd();
		process.exit(1);
	});
