import React from 'react';

import styled from 'styled-components';

import { BrowserRouter, Route } from 'react-router-dom';
import { observer, Provider } from 'mobx-react';
import { MainStore } from './store';

import SearchPage from './pages/SearchPage';
import ChannelListPage from './pages/ChannelListPage';
import ChannelDatesPage from './pages/ChannelDatesPage';
import ChannelLogPage from './pages/ChannelLogPage';

const RootDiv = styled.div`
  background-color: #f4f4f4;

  font-family: 'Lato', sans-serif;
  font-variant-ligatures: common-ligatures;

  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;

  .sk-layout {
    font-family: 'Lato', sans-serif;
  }

  .sk-hits {
    margin-left: 15px;
  }

  * {
    box-sizing: border-box;
  }
`;

const App = observer(
  class App extends React.Component {
    state = {
      store: new MainStore(),
    };

    async componentWillMount() {
      await this.state.store.fetchUsers();
    }

    render() {
      return (
        <Provider store={this.state.store}>
          <BrowserRouter>
            <RootDiv>
              <Route exact path="/" component={SearchPage} />
              <Route exact path="/archive" component={ChannelListPage} />
              <Route
                exact
                path="/archive/:channel"
                component={ChannelDatesPage}
              />
              <Route
                exact
                path="/archive/:channel/:date"
                component={ChannelLogPage}
              />
            </RootDiv>
          </BrowserRouter>
        </Provider>
      );
    }
  }
);

export default App;
