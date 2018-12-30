/* global process */
import { createStore, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";

import rootReducer, {loadUserData} from "./reducers/index";
import { authMode } from "./utils";

const middleware = [thunk];

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(rootReducer, composeEnhancers(applyMiddleware(...middleware)));

if (store.getState().auth.token || authMode() !== "db") {
  loadUserData(store.dispatch);
}

export default store;
