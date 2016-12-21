import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Router, Route, browserHistory } from 'react-router';

import {
  SearchkitManager, SearchkitProvider, SearchBox, Hits,
  Layout, LayoutBody, TopBar, NoHits, LayoutResults, SideBar, SortingSelector
} from 'searchkit';

import { ArchiveChannelList, ArchiveChannelDates, ArchiveLog } from './archive';
import SlackMessage from './components/SlackMessage';

const searchkit = new SearchkitManager('/');

const HitItem = props => <SlackMessage {...props.result._source} />;

const SearchPage = () => (
  <SearchkitProvider searchkit={searchkit}>
    <Layout>
      <TopBar>
        <SearchBox
          searchOnChange={true}
        />
      </TopBar>
      <LayoutBody>
        <SideBar>
          <SortingSelector options={[
            {label: 'Latest', field: 'millits', order: 'desc', defaultOption: true},
            {label: 'Relevance', field: '_score', order: 'desc'},
          ]} />
        </SideBar>
        <LayoutResults>
          <Hits
        hitsPerPage={50}
        itemComponent={HitItem}
          />
          <NoHits />
        </LayoutResults>
      </LayoutBody>
    </Layout>
  </SearchkitProvider>
);

ReactDOM.render((
  <Router history={browserHistory}>
    <Route path="/" component={SearchPage} />
    <Route path="/archive" component={ArchiveChannelList} />
    <Route path="/archive/:channel" component={ArchiveChannelDates} />
    <Route path="/archive/:channel/:date" component={ArchiveLog} />
  </Router>
), document.getElementById('root'));
