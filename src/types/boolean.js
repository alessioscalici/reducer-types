
const { PREFIX, TYPE_BOOLEAN } = require('./const');
const { ACTION_TYPE_SET, set } = require('../actions');


// action types
const ACTION_TYPE_AND = `${PREFIX}and`;
const ACTION_TYPE_OR = `${PREFIX}or`;
const ACTION_TYPE_XOR = `${PREFIX}xor`;
const ACTION_TYPE_NOT = `${PREFIX}not`;

// action creators
const and = value => ({ type: ACTION_TYPE_AND, payload: { value } });
const or = value => ({ type: ACTION_TYPE_OR, payload: { value } });
const xor = value => ({ type: ACTION_TYPE_XOR, payload: { value } });
const not = value => ({ type: ACTION_TYPE_NOT });

// action handlers
const ahSet = (state, action) => typeof action.payload.value === 'boolean' ? action.payload.value : null;

const ahAnd = (state, action) => (state === null ? state : state && action.payload.value);
const ahOr = (state, action) => (state === null ? state : state || action.payload.value);
const ahXor = (state, action) => (state === null ? state : (action.payload.value ? !state : state));
const ahNot = state => (state === null ? state : !state);


module.exports = {
    actionHandlers: {
      [ACTION_TYPE_SET]: ahSet,
      [ACTION_TYPE_AND]: ahAnd,
      [ACTION_TYPE_OR]: ahOr,
      [ACTION_TYPE_XOR]: ahXor,
      [ACTION_TYPE_NOT]: ahNot,
    },
    actionCreators: { set, and, or, xor, not },
    actionTypes: {
      ACTION_TYPE_SET,
      ACTION_TYPE_AND,
      ACTION_TYPE_OR,
      ACTION_TYPE_XOR,
      ACTION_TYPE_NOT,
    },
};