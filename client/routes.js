//client/routes.js
import React from 'react';
import { Route, Switch } from 'react-router-dom';
import App from './components/App';
import CreateUser from './components/CreateUser';

export const Routes = () => (
    <Switch>
      <Route exact path='/' component={App} />
      <Route exact path='/createUser' component={CreateUser} />
    </Switch>
);

export default Routes;
