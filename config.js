exports.DATABASE_URL = process.env.DATABASE_URL ||
                      'mongodb://localhost/bag-check';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL ||
                      'mongodb://localhost/bag-check-test';
exports.PORT = process.env.PORT || 8080;
exports.TEST_PORT = process.env.PORT || 8000;