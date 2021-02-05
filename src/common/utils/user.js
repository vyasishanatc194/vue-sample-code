// Export all functions of this module
export default {
  /**
   * Test if this user has one or more role
   *
   * @param {Object} userStore User store (vuex)
   * @param {Array} roles List of roles we want to know if the user has
   * @returns {Boolean} If true, use has at least one of these roles, else false.
   */
  hasRole(userStore, roles) {
    // Role should be a string or an array of roles to test
    let rolesRef = roles;
    if (
      !roles
      || !userStore.state.user
      || !userStore.state.user.roleName
      || typeof userStore.state.user.roleId !== 'number'
      || typeof userStore.state.user.roleName !== 'string'
    ) {
      // Invalid parameters
      return false;
    }
    if (Array.isArray(roles) === false) {
      if (typeof roles !== 'string') {
        return false;
      }
      rolesRef = [rolesRef];
    }

    // Test if the user role figure in the specified roles
    const roleListByName = userStore.getters['user/getRoleListByName'];
    const exists = rolesRef.find((p) => {
      // Get this role information
      const r = roleListByName[p];

      // A role is contains into another one if its ID is inferior to the other
      if (r && userStore.state.user.roleId <= r.id) {
        return true;
      }
      return false;
    });
    return typeof exists !== 'undefined';
  },

  /**
   * Extract database user full name
   *
   * @param {String} userRow Database user row
   * @returns Returns the user's fullname otherwise ?.
   */
  databaseUserToFullName(userRow) {
    return `${userRow.first_name} ${userRow.last_name}`;
  },
};
