import gplay from '../index.js';
import { assert } from 'chai';
import { assertValidUrl } from './common.js';

function assertValidOptional(value) {
  assert(
    typeof value === 'boolean' || value === 0 || value === 1,
    'optional must be boolean or 0/1'
  );
}


function assertValidDataSafetyObject () {
  return (entry) => {
    assert.isString(entry.data);
    assert.isString(entry.purpose);
    assert.isString(entry.type);
    assertValidOptional(entry.optional);
  };
}

describe('Data Safety method', () => {
  it('should return arrays of data shared, data collected, security practices and a privacy url', () =>
    gplay.datasafety({ appId: 'com.zhiliaoapp.musically' })
      .then((dataSafety) => {
        assert.isArray(dataSafety.sharedData);
        assert.isArray(dataSafety.collectedData);
        assert.isArray(dataSafety.securityPractices);
        assertValidUrl(dataSafety.privacyPolicyUrl);
      }));

  it('should return a valid shared and collected data object', () =>
    gplay.datasafety({ appId: 'com.zhiliaoapp.musically' })
      .then((dataSafety) => {
        dataSafety.sharedData.map(assertValidDataSafetyObject());
        dataSafety.collectedData.map(assertValidDataSafetyObject());
      }));

  it('should return a valid security practices object', () =>
    gplay.datasafety({ appId: 'com.zhiliaoapp.musically' })
      .then((dataSafety) => {
        dataSafety.securityPractices.forEach((practice) => {
          assert.isString(practice.practice);
          assert.isString(practice.description);
        });
      }));

  it('should return empty return for non existing app', () =>
    gplay.datasafety({ appId: 'app.foo.bar' })
      .then((dataSafety) => {
        assert.isEmpty(dataSafety.sharedData);
        assert.isEmpty(dataSafety.collectedData);
        assert.isEmpty(dataSafety.securityPractices);
        assert.isUndefined(dataSafety.privacyPolicyUrl);
      })
  );
});
