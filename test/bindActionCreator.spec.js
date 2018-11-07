
const {
  bindActionCreator,
} = require('../src/redules');


const TARGET_ID = 'TARGET_ID';




describe('with an action creator which creates an action with no meta', () => {
  const originalActionCreator = () => ({
    type: 'do-something',
  });
  const actionCreator = bindActionCreator(TARGET_ID)(originalActionCreator);


  it('adds the meta to the action', () => {
    const action = actionCreator();
    expect(action).toEqual({
      type: 'do-something',
      meta: {
        targetId: TARGET_ID,
        reduxDebug: `do-something{${TARGET_ID}}`,
      },
    });
  });
});

describe('with an action creator which creates an action with meta', () => {
  const originalActionCreator = () => ({
    type: 'do-something',
    meta: {
      some: 'metadata',
    },
  });
  const actionCreator = bindActionCreator(TARGET_ID)(originalActionCreator);


  it('adds the targetId to the meta', () => {
    const action = actionCreator();

    expect(action).toEqual({
      type: 'do-something',
      meta: {
        some: 'metadata',
        targetId: TARGET_ID,
        reduxDebug: `do-something{${TARGET_ID}}`,
      },
    });
  });
});

describe('with an action creator which creates an action with meta and targetId', () => {
  const originalActionCreator = () => ({
    type: 'do-something',
    meta: {
      some: 'metadata',
      targetId: 'some-other-id',
    },
  });
  const actionCreator = bindActionCreator(TARGET_ID)(originalActionCreator);


  it('overwrites the targetId in the meta', () => {
    const action = actionCreator();

    expect(action).toEqual({
      type: 'do-something',
      meta: {
        some: 'metadata',
        targetId: TARGET_ID,
        reduxDebug: `do-something{${TARGET_ID}}`,
      },
    });
  });
});
