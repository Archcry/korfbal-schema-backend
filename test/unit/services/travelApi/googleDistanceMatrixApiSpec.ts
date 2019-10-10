import * as sinon from 'sinon';
import * as fetch from 'node-fetch';
import { assert, expect } from 'chai';
import customSinonMatchers from '../../helpers/customSinonMatchers';
import GoogleDistanceMatrixApi from '../../../../src/services/travelApi/googleDistanceMatrixApi';
import TravelApi from '../../../../src/services/travelApi/travelApi';
import { travelResponseWithoutTraffic, travelResponseWithTraffic } from './exampleResponse';
import * as moment from 'moment';

describe('GoogleDistanceMatrixApi', () => {
  const sandbox = sinon.createSandbox();
  const apiUrl = '';
  const apiKey = '';

  // Some random values, don't worry about it
  const arrivalTime = moment().add(moment.duration(1, 'day')).unix();
  const travelDuration = 1621;
  const travelDistance = 22043;
  const extraTravelDuration = 300;
  const fromLocation = 'Breezandpad 13, 6843 JM Arnhem';
  const toLocation = 'Sportpark Tuilland Buurtweg 3 3941MC DOORN';

  let fetchStub: sinon.SinonStub;

  let subjectUnderTest: TravelApi;

  beforeEach(() => {
    fetchStub = sandbox.stub(fetch, 'default');

    fetchStub.onCall(0).returns(Promise.resolve({
      json: () => Promise.resolve(JSON.parse(travelResponseWithoutTraffic(travelDistance, travelDuration)))
    }));

    fetchStub.onCall(1).returns(Promise.resolve({
      json: () => Promise.resolve(JSON.parse(
        travelResponseWithTraffic(travelDistance, travelDuration, extraTravelDuration)
      ))
    }));

    subjectUnderTest = new GoogleDistanceMatrixApi(apiKey);
  });

  afterEach(() => sandbox.restore());

  it('should call fetch twice, once to get the departure time and once to get the actual info', async () => {
    await subjectUnderTest.getTravelInfo(fromLocation, toLocation, arrivalTime);

    assert(fetchStub.calledTwice);
  });

  it('should use the correct google matrix api url in order to fetch data', async () => {
    await subjectUnderTest.getTravelInfo(fromLocation, toLocation, arrivalTime);

    const matcher = customSinonMatchers.string.contains(apiUrl);
    assert(fetchStub.alwaysCalledWith(matcher), 'should be called with the correct url');
  });

  it('should include the api key in the request to the google distance matrix api', async () => {
    await subjectUnderTest.getTravelInfo(fromLocation, toLocation, arrivalTime);

    const matcher = customSinonMatchers.string.contains(`?key=${apiKey}`);
    assert(fetchStub.alwaysCalledWith(matcher), 'should call fetch with the api key');
  });

  it('should include the from location in the request to the google distance matrix api', async () => {
    await subjectUnderTest.getTravelInfo(fromLocation, toLocation, arrivalTime);

    const matcher = customSinonMatchers.string.contains('&origins=Marconistraat 18, 6902 PC Zevenaar, Netherlands');
    assert(fetchStub.alwaysCalledWith(matcher), 'all calls to the api should include the origin');
  });

  it('should include the to location in the request to the google distance matrix api', async () => {
    await subjectUnderTest.getTravelInfo(fromLocation, toLocation, arrivalTime);

    const matcher = customSinonMatchers.string.contains('&destinations=Kolonieweg 2, 6952 GX Dieren, Netherlands');
    assert(fetchStub.alwaysCalledWith(matcher), 'all calls to the api should include the destination');
  });

  it('should call fetch once with the arrival time as query parameter', async () => {
    await subjectUnderTest.getTravelInfo(fromLocation, toLocation, arrivalTime);

    const matcher = customSinonMatchers.string.contains(`&arrival_time=${arrivalTime}`);
    assert(fetchStub.firstCall.calledWith(matcher), 'the first call to the api should include the arrival time');
  });

  it('should call fetch once with a determined departuretime from the previous fetch call', async () => {
    const arrivalTimeInThePast = moment().subtract(moment.duration(1, 'day')).unix();

    await subjectUnderTest.getTravelInfo(fromLocation, toLocation, arrivalTimeInThePast);

    const expectedDepartureTime = moment().unix();
    const matcher = customSinonMatchers.string.contains(`&departure_time=${expectedDepartureTime}`);
    assert(fetchStub.secondCall.calledWith(matcher), 'api should\'ve been called with the calculated departureTime');
  });

  it('should call fetch once with departure time "now" when the determined departuretime is in the past', async () => {
    await subjectUnderTest.getTravelInfo(fromLocation, toLocation, arrivalTime);

    const expectedDepartureTime = arrivalTime - travelDuration;
    const matcher = customSinonMatchers.string.contains(`&departure_time=${expectedDepartureTime}`);
    assert(fetchStub.secondCall.calledWith(matcher), 'api should\'ve been called with the calculated departureTime');
  });

  it('should throw an error when something went wrong', async () => {
    const fetchError = 'fetch error';
    const expectedError = `Could not fetch travel information: ${fetchError}`;
    fetchStub.onCall(0).returns(Promise.reject(fetchError));

    try {
      await subjectUnderTest.getTravelInfo(fromLocation, toLocation, arrivalTime);

      assert(false, 'subjectUnderTest.getTravelInfo should throw an error');
    } catch (err) {
      expect(err.message).to.equal(expectedError);
    }
  });

  it('should send a response with the distance, duration aswell as the from and to location', async () => {
    const result = await subjectUnderTest.getTravelInfo(fromLocation, toLocation, arrivalTime);

    expect(result).to.deep.equal({
      fromLocation,
      toLocation,
      distance: travelDistance,
      duration: travelDuration + extraTravelDuration
    });
  });

  it('should use distance instead of distance_in_traffic when the latter is not present', async () => {
    fetchStub.onCall(1).returns(Promise.resolve({
      json: () => Promise.resolve(JSON.parse(travelResponseWithoutTraffic(travelDistance, travelDuration)))
    }));

    const result = await subjectUnderTest.getTravelInfo(fromLocation, toLocation, arrivalTime);

    expect(result).to.deep.equal({
      fromLocation,
      toLocation,
      distance: travelDistance,
      duration: travelDuration
    });
  });
});
