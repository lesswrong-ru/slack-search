import React from 'react';

import { BrowserRouter, Route } from 'react-router-dom';
import { observer, Provider } from 'mobx-react';
import { MainStore } from './store';

import { ArchiveChannelList, ArchiveChannelDates, ArchiveLog } from './archive';
import SearchPage from './SearchPage';

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
            <div class="slack-root">
              <Route exact path="/" component={SearchPage} />
              <Route exact path="/archive" component={ArchiveChannelList} />
              <Route
                exact
                path="/archive/:channel"
                component={ArchiveChannelDates}
              />
              <Route
                exact
                path="/archive/:channel/:date"
                component={ArchiveLog}
              />
            </div>
          </BrowserRouter>
        </Provider>
      );
    }
  }
);

export default App;
