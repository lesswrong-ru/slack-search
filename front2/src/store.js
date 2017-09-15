import { observable } from 'mobx';

export class MainStore {
  users = observable.map({});

  async fetchUsers() {
    console.log('fetching users');
    const usersJson = await (await fetch('/archive-data/users.json')).json();
    const usersDict = {};
    usersJson.forEach(
      user => {
        usersDict[user.id] = user;
      }
    );
    console.log('updating users');
    this.users.replace(usersDict);
  }

  getUser(user_id) {
    let user = this.users.get(user_id);
    if (!user) {
      user = {
        name: 'UNKNOWN',
        profile: {
          image_72: '',
        },
      };
    }
    return user;
  }
}
