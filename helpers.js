const getUserByEmail = function(email, database) {
  let data = database;
  let user;
  for (const obj in data) {
    if (email === data[obj].email) {
      user = data[obj].id;
    }
  }
  return user;
};

module.exports = { getUserByEmail };