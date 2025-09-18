
module.exports = {
  testEnvironment: 'jest-environment-jsdom', 
  transform: {
    "^.+\\.js$": "babel-jest",  
  },
  moduleNameMapper: {
    '\\.css$': 'identity-obj-proxy',  
  },
};
