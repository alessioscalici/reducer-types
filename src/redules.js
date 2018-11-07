
const {
    TYPE_STRING,
    TYPE_NUMBER,
    TYPE_BOOLEAN,
    TYPE_OBJECT,
    TYPE_ARRAY,
} = require('./types/const');

const arrayType = require('./types/array');
const objectType = require('./types/object');
const numberType = require('./types/number');
const booleanType = require('./types/boolean');
const stringType = require('./types/string');



const {
    ACTION_TYPE_SET, ACTION_TYPE_MULTIACTION,
    set, multiAction,
} = require('./actions');




const ahEntry = (state, action) => {
  const { key, value } = action.payload;
  return (!state || state[key] === value) ? state : { ...state, [key]: value };
};
const ahRemove = (state, action) => {
  if (!state || !state.hasOwnProperty(action.payload.key)) {
    return state;
  }
  const { [action.payload.key]: val, ...res } = state;
  return res;
};




// ============ BINDING ============ //


const bindActionCreator = (targetId) => (actionCreator) => (...args) => {
    const action = actionCreator(...args);
    if (!action) return action;
    if (!action.meta) action.meta = {};
    action.meta.targetId = targetId;
    action.meta.reduxDebug = `${action.type}{${targetId}}`; // TODO: move descriptive text to action type
    return action;
};





// ============ TYPE CONFIG ============ //

const DEFAULT_CONFIG = {
  [TYPE_ARRAY]: arrayType,
  [TYPE_OBJECT]: objectType,
  [TYPE_BOOLEAN]: booleanType,
  [TYPE_NUMBER]: numberType,
  [TYPE_STRING]: stringType,
};


const mergeTypes = (...types) => types.reduce((acc, type) => {
  if (type.validate) {
    acc.validate = type.validate;
  }
  if (type.actionHandlers)
  acc.actionHandlers = Object.assign({}, acc.actionHandlers, type.actionHandlers);
  acc.actionCreators = Object.assign({}, acc.actionCreators, type.actionCreators);
  return acc;
}, { validate: () => true, actionHandlers: {}, actionCreators: {} });


const mergeConfigs = (...configs) => configs.reduce((accConfig, config) => {
  Object.keys(config).forEach((key) => {
    if (accConfig[key]) {
      accConfig[key] = mergeTypes(accConfig[key], config[key]);
    } else {
      accConfig[key] = config[key];
    }
  });
  return accConfig;
}, {});



const generateIsValidType = typeConfig => type => !!typeConfig[type];
const generateValidate = typeConfig => type => typeConfig[type].validate;
const generateHandleAction = typeConfig => type => (state, action) => {
    return typeConfig[type].actionHandlers[action.type] ?
        typeConfig[type].actionHandlers[action.type](state, action) :
        state;
};

// ((any -> boolean), ((A, FSA) -> A)) -> (A, FSA) -> A)
const generateDefaultReducer = (validate, handleAction) => (state, action) => {
    if (action.type === ACTION_TYPE_SET) {
        if (validate(action.payload.value)) {
            return action.payload.value;
        } else {
            // FIXME: effect!
            console.warn(`${action.meta.reduxDebug}: Value ${action.payload.value} is not a valid "${type}" value`);
        }
    }
    return handleAction(state, action);
};


const generateCreateReducer = (defaultReducer, initialValue) => targetId => (state = initialValue, action) => {

    if (!action) return state;

    if (action.type === ACTION_TYPE_MULTIACTION && action.payload.actionsMap[targetId]) {
        return action.payload.actionsMap[targetId].reduce(defaultReducer, state);
    }

    if (!action.meta || action.meta.targetId !== targetId) {
        return state;
    }

    return defaultReducer(state, action);
};

const createCustomCreateReducer = (typeConfig = DEFAULT_CONFIG) => {

    if (typeConfig !== DEFAULT_CONFIG) {
        typeConfig = mergeConfigs(DEFAULT_CONFIG, typeConfig);
    }

    const isValidType = generateIsValidType(typeConfig);
    const generateSpecificValidate = generateValidate(typeConfig);
    const generateSpecificHandleAction = generateHandleAction(typeConfig);

    return (type, initialValue = null) => {
        if (!isValidType(type)) {
            throw new Error(`Type "${type}" is not supported!`);
        }

        const validate = generateSpecificValidate(type);

        // check the type of the initial value
        if (!validate(initialValue)) {
            // FIXME: effects
            console.warn(`"${initialValue}" is not a valid value for type "${type}"`);
            initialValue = null;
        }

        const handleAction = generateSpecificHandleAction(type);
        const defaultReducer = generateDefaultReducer(validate, handleAction);

        return generateCreateReducer(defaultReducer, initialValue);
    };

};






// ============ UTILS ============ //

const generateBindActions = (typeConfig = DEFAULT_CONFIG) => type => targetId => {
    if (typeConfig !== DEFAULT_CONFIG) {
      typeConfig = mergeConfigs(DEFAULT_CONFIG, typeConfig);
    }
    if (typeConfig[type] && typeConfig[type].actionCreators) {
      const wrap = bindActionCreator(targetId);
      return Object.keys(typeConfig[type].actionCreators).reduce((acc, key) => {
          acc[key] = wrap(typeConfig[type].actionCreators[key]);
          return acc;
      }, { set: wrap(set) });
    }
    return {};
};

const generateTypeDescriptors = (typeConfig = DEFAULT_CONFIG) => {
  if (typeConfig !== DEFAULT_CONFIG) {
    typeConfig = mergeConfigs(DEFAULT_CONFIG, typeConfig);
  }
  return Object.keys(typeConfig).reduce((acc, type) => {
    acc[type] = initialValue => ({ type, initialValue, isLeaf: true });
    return acc;
  }, {});
};

module.exports = {

    bindActionCreator, // TODO: rename

    generateBindActions,
    generateTypeDescriptors,

    createCustomCreateReducer,
};
module.exports.default = module.exports;
