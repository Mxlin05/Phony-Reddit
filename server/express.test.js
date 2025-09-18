
const { TextEncoder, TextDecoder } = require('util');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
const app = require('./server.js');
const mongoose = require('mongoose');

describe('Server', () => {
  let server;
  
  beforeAll(done => {server = app.listen(8000, done)});
  
  afterAll(async () => {
    await server.close();
    await mongoose.disconnect();
  });
  
  test('server is listening on port 8000', () => {
    expect(server.address().port).toBe(8000);
  });
});
