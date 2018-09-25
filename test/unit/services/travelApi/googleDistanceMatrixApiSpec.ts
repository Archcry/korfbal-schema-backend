import * as sinon from 'sinon';
import * as fetch from 'node-fetch';
import { assert, expect } from 'chai';
import customSinonMatchers from '../../helpers/customSinonMatchers';
import GoogleDistanceMatrixApi from '../../../../src/services/travelApi/googleDistanceMatrixApi';
import TravelApi from '../../../../src/services/travelApi/travelApi';
import { travelResponseWithoutTraffic, travelResponseWithTraffic } from './exampleResponse';

describe('GoogleDistanceMatrixApi', () => {
  const sandbox = sinon.createSandbox();
  const apiUrl = 'https://maps.googleapis.com/maps/api/distancematrix/json';
  const apiKey = 'AIzaSyBACMTtJB2ha-Ubr7-bDF1z80t2p09YbRA';
  const travelTime = 1621;

  let fetchStub: sinon.SinonStub;

  let subjectUnderTest: TravelApi;

  beforeEach(() => {
    fetchStub = sandbox.stub(fetch, 'default');

    fetchStub.onCall(0).returns(Promise.resolve({
      json: () => Promise.resolve(JSON.parse(travelResponseWithoutTraffic(22043, travelTime)))
    }));
    fetchStub.onCall(1).returns(Promise.resolve({
      json: () => Promise.resolve(JSON.parse(travelResponseWithTraffic(22043, travelTime)))
    }));

    subjectUnderTest = new GoogleDistanceMatrixApi(apiKey);
  });

  afterEach(() => sandbox.restore());

  it('should call fetch twice, once to get the departure time and once to get the actual info', async () => {
    await subjectUnderTest.getTravelInfo(createLocation('Zevenaar'), createLocation('Arnhem'), 10256);

    assert(fetchStub.calledTwice);
  });

  it('should use the correct google matrix api url in order to fetch data', async () => {
    await (subjectUnderTest.getTravelInfo(createLocation('Zevenaar'), createLocation('Arnhem'), 10256));

    const matcher = customSinonMatchers.string.contains(apiUrl);
    assert(fetchStub.alwaysCalledWith(matcher), 'should be called with the correct url');
  });

  it('should include the api key in the request to the google distance matrix api', async () => {
    await subjectUnderTest.getTravelInfo(createLocation('Zevenaar'), createLocation('Arnhem'), 10256);

    const matcher = customSinonMatchers.string.contains(apiKey);
    assert(fetchStub.alwaysCalledWith(matcher), 'should call fetch with the api key');
  });

  it('should include the from location in the request to the google distance matrix api', async () => {
    await subjectUnderTest.getTravelInfo(
      createLocation('Zevenaar', 'Marconistraat 18', '6902 PC', 'Netherlands'),
      createLocation('Arnhem'),
      10256
    );

    const matcher = customSinonMatchers.string.contains('origins=Marconistraat 18, 6902 PC Zevenaar, Netherlands');
    assert(fetchStub.alwaysCalledWith(matcher), 'all calls to the api should include the origin');
  });

  it('should include the to location in the request to the google distance matrix api', async () => {
    await subjectUnderTest.getTravelInfo(
      createLocation('Arnhem'),
      createLocation('Dieren', 'Kolonieweg 2', '6952 GX', 'Netherlands'),
      10256
    );

    const matcher = customSinonMatchers.string.contains('destinations=Kolonieweg 2, 6952 GX Dieren, Netherlands');
    assert(fetchStub.alwaysCalledWith(matcher), 'all calls to the api should include the destination');
  });

  it('should call fetch once with the arrival time as query parameter', async () => {
    const arrivalTime = 16468466;
    await subjectUnderTest.getTravelInfo(
      createLocation('Arnhem'),
      createLocation('Dieren', 'Kolonieweg 2', '6952 GX', 'Netherlands'),
      arrivalTime
    );

    const matcher = customSinonMatchers.string.contains(`arrival_time=${arrivalTime}`);
    assert(fetchStub.firstCall.calledWith(matcher), 'the first call to the api should include the arrival time');
  });

  it('should call fetch once with departure time, based on the previous result, as query parameter', async () => {
    const arrivalTime = 16468466;

    await subjectUnderTest.getTravelInfo(
      createLocation('Arnhem'),
      createLocation('Dieren', 'Kolonieweg 2', '6952 GX', 'Netherlands'),
      arrivalTime
    );

    const expectedDepartureTime = arrivalTime - travelTime;
    const matcher = customSinonMatchers.string.contains(`departure_time=${expectedDepartureTime}`);
    assert(fetchStub.secondCall.calledWith(matcher), 'api should\'ve been called with the calculated departureTime');
  });

  it('should send a response with the distance, duration aswell as the from and to location', async () => {
    const arrivalTime = 514754164;

    const result = await subjectUnderTest.getTravelInfo(
      createLocation('Arnhem'),
      createLocation('Dieren', 'Kolonieweg 2', '6952 GX', 'Netherlands'),
      arrivalTime
    );

    expect(result);
    assert(false, 'Not implemented');
  });
});

const createLocation = (city: string, address = '', zipCode = '', country = '') => ({
  address,
  zipCode,
  city,
  country
});
