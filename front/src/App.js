import React from 'react';

import { BrowserRouter, Route } from 'react-router-dom';
import { observer, inject, Provider } from 'mobx-react';
import { MainStore } from './store';

import {
  SearchkitManager,
  SearchkitProvider,
  SearchBox,
  Hits,
  Pagination,
  Layout,
  LayoutBody,
  TopBar,
  NoHits,
  LayoutResults,
  SideBar,
  SortingSelector,
  HitsStats,
  QueryString,
  InputFilter,
  RefinementListFilter,
} from 'searchkit';

import { ArchiveChannelList, ArchiveChannelDates, ArchiveLog } from './archive';
import SlackSnippet from './components/SlackSnippet';

const searchkit = new SearchkitManager('/api/search');

const HitItem = inject('store')(
  observer(props => <SlackSnippet message={props.result._source} />)
);

const NoHide = ({ children }) => (
  <div className="no-hide-fix">
    {children}
  </div>
);

const SearchPage = () => (
  <SearchkitProvider searchkit={searchkit}>
    <Layout>
      <TopBar>
        <SearchBox
          searchOnChange={true}
          queryBuilder={QueryString}
          queryOptions={{ default_operator: 'AND' }}
          queryFields={['text']}
        />
      </TopBar>
      <LayoutBody>
        <SideBar>
          <NoHide>
            <InputFilter id="username" title="Username" searchOnChange={true} queryFields={["username"]} />
            <InputFilter id="channel" title="Channel" searchOnChange={true} queryFields={["channel"]} />
            <SortingSelector
              options={[
                {
                  label: 'Latest',
                  field: 'millits',
                  order: 'desc',
                  defaultOption: true,
                },
                { label: 'Relevance', field: '_score', order: 'desc' },
              ]}
            />
          </NoHide>
          <RefinementListFilter id="ch" title="Channel" field="channel" />
        </SideBar>
        <LayoutResults>
          <div style={{ marginLeft: 10 }}>
            <HitsStats />
          </div>
          <Hits hitsPerPage={50} itemComponent={HitItem} />
          <NoHits />
          <Pagination showNumbers={true} />
        </LayoutResults>
      </LayoutBody>
    </Layout>
  </SearchkitProvider>
);

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
