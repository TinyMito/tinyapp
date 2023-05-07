const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  aJ48lW: {
    id:       "aJ48lW",
    email:    "123@example.com",
    password: "$2a$10$Ez8ugewmBaLv7cgL1ktNR.swYD4PjVWy1MAvqspdhSd/6L4SJE/hq" // 123123
  },
  k255h2: {
    id:       "k255h2",
    email:    "789@example.com",
    password: "$2a$10$5T7.e/u5dfIjgSwu/LQpAuHrWU6OQ33m6KHjQr9sLfZFKJ7yx1G96" // 789789
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("789@example.com", testUsers)
    const expectedUserID = "k255h2";
    assert.strictEqual(user, expectedUserID);
  });
  it('should return a user with valid email', function() {
    const user = getUserByEmail("missing@example.com", testUsers)
    const expectedUserID = undefined;
    assert.strictEqual(user, expectedUserID);
  });
});
