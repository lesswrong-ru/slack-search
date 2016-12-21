import * as React from 'react';
import * as ReactDOM from 'react-dom';

import moment from 'moment';

import {
  SearchkitManager, SearchkitProvider, SearchBox, Hits,
  Layout, LayoutBody, TopBar, NoHits, LayoutResults, SideBar, SortingSelector
} from 'searchkit';

const searchkit = new SearchkitManager('/');

const HitItem = (props) => {
  const message = props.result._source;
  const ts = moment(parseFloat(message.ts) * 1000);
  const now = moment();
  const date = (ts.year() === now.year() ? ts.format('MMM Do') : ts.format('YYYY MMM Do'));

  return (
    <div className='message'>
      <div className='message-context'>
        <div className='message-channel'>
           #{message.channel}
        </div>
        <div className='message-date'>
          {date}
        </div>
      </div>
      <div className='message-main'>
        <div className='message-author'>
          {message.user}
        </div>
        <div className='message-text'>
          {message.text}
        </div>
      </div>
    </div>
  );
};


ReactDOM.render((
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
), document.getElementById('root'));
