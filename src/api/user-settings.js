import http from 'src/common/utils/http';

function request(verb, routeURL, requestParameters) {
  return http[verb](routeURL, requestParameters);
}

function get(routeURL, requestParameters) {
  return request('get', routeURL, requestParameters);
}

function put(routeURL, requestParameters) {
  return request('put', routeURL, requestParameters);
}

function setUserInformation(attributes) {
  return put('/api/v1/user/information/', attributes);
}

function getUserInformation() {
  return get('/api/v1/user/information/');
}

function setProfileImage(profileImage) {
  return setUserInformation({
    user_information: {
      profile_photo: profileImage,
    },
  });
}

function setFirstName(firstName) {
  return setUserInformation({
    user_information: {
      first_name: firstName,
    },
  });
}

function setLastName(lastName) {
  return setUserInformation({
    user_information: {
      last_name: lastName,
    },
  });
}

function setPhoneNumber({ countryCode, areaCode, number }) {
  return setUserInformation({
    user_information: {
      phone_number_country_code: countryCode,
      phone_number_area_code: areaCode,
      phone_number: number,
    },
  });
}

function setLocale(localeName) {
  return setUserInformation({
    user_information: {
      locale_name: localeName,
    },
  });
}

function setTimeZone(timeZone) {
  return setUserInformation({
    user_information: {
      time_zone: timeZone,
    },
  });
}

function setDisplayCorporateLogo(displayCorporateLogo) {
  return setUserInformation({
    user_information: {
      display_corporate_logo: displayCorporateLogo,
    },
  });
}

function setAlerts({ newIsEmailEnabled, newIsSMSEnabled }) {
  return setUserInformation({
    user_information: {
      alert_by_email: newIsEmailEnabled,
      alert_by_sms: newIsSMSEnabled,
    },
  });
}

function setNotifications({ newIsEmailEnabled, newIsSMSEnabled }) {
  return setUserInformation({
    user_information: {
      notification_by_email: newIsEmailEnabled,
      notification_by_sms: newIsSMSEnabled,
    },
  });
}

function setPassword(currentPassword, newPassword) {
  return setUserInformation({
    user_information: {
      password: {
        current: currentPassword,
        new: newPassword,
      },
    },
  });
}

function getUnits() {
  return get('/api/v1/user/units/');
}

function setUnits(units) {
  return put('/api/v1/user/units/', {
    units,
  });
}

function getProfileImage(profileImageRoute) {
  return get(profileImageRoute);
}

export default {
  getUserInformation,
  setProfileImage,
  setFirstName,
  setLastName,
  setPhoneNumber,
  setLocale,
  setTimeZone,
  setDisplayCorporateLogo,
  setAlerts,
  setNotifications,
  setPassword,
  getUnits,
  setUnits,
  getProfileImage,
};
