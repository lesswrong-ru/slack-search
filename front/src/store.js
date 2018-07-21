import { observable } from 'mobx';

export class MainStore {
  users = observable.map({});

  async setUsers(usersList) {
    const usersDict = {};
    usersList.forEach(
      user => {
        usersDict[user.id] = user;
      }
    );
    this.users.replace(usersDict);
  }

  async fetchUsers() {
    const usersJson = await (await fetch('/api/archive/users.json')).json();
    this.setUsers(usersJson);
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
