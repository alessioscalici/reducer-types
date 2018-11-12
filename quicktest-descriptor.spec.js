const {
  createCustomCreateReducer,
  generateBindActions,
  generateTypeDescriptors,
} = require('./src/redules');

const {
  getTreeReducer,
  getActionsTree,
} = require('./src/treeDescriptorMethods');

const {
    TYPE_STRING,
    TYPE_NUMBER,
    TYPE_BOOLEAN,
    TYPE_OBJECT,
    TYPE_ARRAY,
} = require('./src/types/const');




// Generate actions tree

const TEST_CUSTOM_CONFIG = {
  [TYPE_STRING]: {
    actionHandlers: {
      CAPITALIZE: state => (state ? (state.charAt(0).toUpperCase() + state.slice(1)) : state),
    },
    actionCreators: {
      capitalize: () => ({ type: 'CAPITALIZE' }),
    },
  },
  user: {
    validate: user => (user === null || user.username && user.password),
    actionHandlers: {
      CHANGE_PASSWORD: (state, action) => ({ ...state, password: action.payload.newPassword })
    },
    actionCreators: {
      changePassword: newPassword => ({ type: 'CHANGE_PASSWORD', payload: { newPassword } })
    },
  },
};


const createReducer = createCustomCreateReducer(TEST_CUSTOM_CONFIG);
const bindActions = generateBindActions(TEST_CUSTOM_CONFIG);
const type = generateTypeDescriptors(TEST_CUSTOM_CONFIG);




const { compose } = require('./src/actions');
// import also type


// splitting descriptors
const usersDescriptor = {
  loading: type.boolean(true),
  curId: type.string(null),
  ids: type.array([]),
  byId: type.object({}),
};


const descriptor = {
  loading: type.boolean(true),
  articles: {
    curId: type.string(null),
    ids: type.array([]),
    byId: type.object({}),
  },
  users: usersDescriptor,

  customUser: type.user({ username: 'valid', password: 'is secret!' }),
};



const actions = getActionsTree(bindActions)(descriptor);
const reducer = getTreeReducer(createReducer)(descriptor);



const setLoading = actions.loading.set;
const addArticle = article => compose(
  actions.articles.ids.push(article.id),
  actions.articles.byId.entry(article.id, article),
  setLoading(false),
);

const addUserIds = () => compose(
  actions.users.ids.push(1),
  actions.users.ids.push(2),
  actions.users.ids.push(3),
);

// nesting composes
const doALotOfStuff = article => compose(
  addArticle(article),                       // composing another compose
  actions.articles.curId.set(article.id),
  addUserIds(),                         // composing another compose
  actions.articles.curId.capitalize(), // custom action on existing type (string)
  actions.customUser.changePassword('new password!'), // custom type action
);


let state;

state = reducer(state, doALotOfStuff({ id: 'pippo', text: 'hello!' }));

describe('produces the correct state', () => {
  it('produces the correct state', () => {
    expect(state.users.ids).toEqual([1, 2, 3]);
    expect(state.articles.ids).toEqual(['pippo']);
    expect(state.articles.byId.pippo).toEqual({ id: 'pippo', text: 'hello!' });
    expect(state.articles.curId).toEqual('Pippo');
    expect(state.customUser).toEqual({ username: 'valid', password: 'new password!' });
  });
});
