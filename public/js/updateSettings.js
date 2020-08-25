/* eslint-disable */

import { showAlert } from './alert';

//type is either 'password' or 'data'
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? '/api/v1/users/updateMyPassword'
        : '/api/v1/users/updateMe';

    const updatedUser = await axios({
      method: 'PATCH',
      url,
      data
    });
    if (updatedUser.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully`);
      location.reload(true);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
