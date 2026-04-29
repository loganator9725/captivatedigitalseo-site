const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const fixturesDir = path.resolve(__dirname, '../content/fixtures');

const fixtureExpectations = {
  'invalid-case-study.json': {
    shouldPass: false,
    messages: [
      'Case study template requires at least two metrics',
      'Case study template requires at least two phases',
    ],
  },
  'invalid-contact.json': {
    shouldPass: false,
    messages: [
      "Contact form field 'submitLabel' is required",
      'Primary CTA href on /contact/ must be a site-relative path.',
    ],
  },
  'invalid-paths.json': {
    shouldPass: false,
    messages: ['Invalid path format on landing', 'Duplicate path detected: /about/'],
  },
  'valid-site.json': {
    shouldPass: true,
    messages: ['Validated 4 pages successfully.'],
  },
};

function run() {
  const fixtureFiles = fs.readdirSync(fixturesDir).filter((file) => file.endsWith('.json'));
  const failures = [];

  for (const fixtureFile of fixtureFiles) {
    const fixturePath = path.join(fixturesDir, fixtureFile);
    const expectation = fixtureExpectations[fixtureFile];
    const result = spawnSync(process.execPath, [path.resolve(__dirname, 'validateContent.js'), fixturePath], {
      encoding: 'utf8',
    });
    const combinedOutput = `${result.stdout}\n${result.stderr}`;

    if (!expectation) {
      failures.push(`${fixtureFile} is missing an expectation entry.`);
      continue;
    }

    if (expectation.shouldPass && result.status !== 0) {
      failures.push(`${fixtureFile} unexpectedly failed validation.`);
      continue;
    }

    if (!expectation.shouldPass && result.status === 0) {
      failures.push(`${fixtureFile} unexpectedly passed validation.`);
      continue;
    }

    for (const expectedMessage of expectation.messages) {
      if (!combinedOutput.includes(expectedMessage)) {
        failures.push(`${fixtureFile} did not report expected message: ${expectedMessage}`);
      }
    }
  }

  if (failures.length > 0) {
    for (const failure of failures) {
      console.error(failure);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`Validated ${fixtureFiles.length} content fixtures successfully.`);
}

run();