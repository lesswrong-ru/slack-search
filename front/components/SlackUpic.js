import * as React from 'react';

const SlackUpic = ({ user }) => (
    <div className="slack-upic">
      <img src={user.profile.image_72} />
    </div>
);

export default SlackUpic;
