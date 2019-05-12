import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import rootReducer, { RootState } from './reducers';
import rootSaga from './sagas';

const initialData = {
  users: [] as string[],
  entities: {
    companies: {},
    users: {},
    roles: {}
  }
};

/**
 * @param {object} initialState
 * @param {boolean} options.isServer indicates whether it is a server side or client side
 * @param {Request} options.req NodeJS Request object (if any)
 * @param {boolean} options.debug User-defined debug mode param
 * @param {string} options.storeKey This key will be used to preserve store in global namespace for safe HMR
 */
const configureStore = (initialState: RootState = initialData) => {
  const sagaMiddleware = createSagaMiddleware();

  const store = createStore(
    rootReducer,
    initialState,
    applyMiddleware(sagaMiddleware)
  );

  // sagaTaskがないとされてしまうので一旦anyにする
  (store as any).sagaTask = sagaMiddleware.run(rootSaga);

  return store;
};
export default configureStore;
