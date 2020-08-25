/* eslint-disable */

import { showAlert } from './alert';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login', //http://127.0.0.1:3000 we need it if we deploy our website and api in different url
      data: {
        email,
        password
      }
    });
    showAlert('success', 'logged in successfuly');
    location.assign('/');
  } catch (err) {
    showAlert('error', 'email or password is wrong');
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout'
    });
    showAlert('success', 'log out successfuly')
    location.reload(true);
  } catch (err) {
    showAlert('error', 'log out failed, try again!');
  }
};
