const { validate } = require('../../../src/types/array');

it('should return true if the value is an empty Array', () => {
  expect(validate([])).toBe(true);
  expect(validate(new Array())).toBe(true);
});

it('should return true if the value is a non-empty Array', () => {
  expect(validate([1, 2, 3])).toBe(true);
});

it('should return false if the value is an empty object', () => {
  expect(validate({})).toBe(false);
  expect(validate(new Object())).toBe(false);
});

it('should return false if the value is a number', () => {
  expect(validate(0)).toBe(false);
  expect(validate(42)).toBe(false);
});

it('should return false if the value is a boolean', () => {
  expect(validate(true)).toBe(false);
  expect(validate(false)).toBe(false);
});

it('should return false if the value is a Date', () => {
  expect(validate(new Date())).toBe(false);
});

it('should return false if the value is a String', () => {
  expect(validate(new String())).toBe(false);
  expect(validate('')).toBe(false);
  expect(validate('[]')).toBe(false);
});
