import * as sinon from 'sinon';
// import * as fetch from 'node-fetch';
// import { assert } from 'chai';

describe('GoogleDistanceMatrixApi', () => {
  const sandbox = sinon.createSandbox();
  // const apiUrl = 'https://maps.googleapis.com/maps/api';
  // const apiKey = 'AIzaSyBACMTtJB2ha-Ubr7-bDF1z80t2p09YbRA';

  // let fetchStub: sinon.SinonStub;

  beforeEach(() => {
    // fetchStub = sandbox.stub(fetch, 'default');
  });

  afterEach(() => sandbox.restore());

  it('should include the api key in the request to the google distance matrix api');

  it('should include the from location in the request to the google distance matrix api');

  it('should include the to location in the request to the google distance matrix api');

  it('should call fetch once with the arrival time as query parameter');

  it('should call fetch once with departure time, based on the previous result, as query parameter');

  it('should send a response with the distance, duration aswell as the from and to location');
});
