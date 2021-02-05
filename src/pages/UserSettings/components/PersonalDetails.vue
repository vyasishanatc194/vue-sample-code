<template>
  <div class="personal-details-container">
    <!-- START: Personal Details Section -->
    <page-section
      :title="$t('userSettings.personalDetails.title')"
      :subTitle="$t('userSettings.personalDetails.subTitle')"
      :isAccordionOpen="true">
      <div slot="card-section" class="row q-col-gutter-x-md q-col-gutter-y-lg">
        <div class="col-12">
          <div class="profile-header">
            <div class="q-pa-md q-gutter-sm desktop-view">
              <!-- Image Cropper -->
              <croppa
                :class="!showProfileImage?
                'user-profile-image display-none': 'user-profile-image'"
                :placeholder-font-size="20"
                v-model="profilePictureObject"
                :width="100"
                :height="100"
                prevent-white-space
                :show-remove-button="false"
                :disable-drag-to-move="true"
                disable-click-to-choose
                :initial-image="personalDetails.ProfileImage"
                @file-size-exceed="handleCroppaFileSizeExceed"
                :file-size-limit="profilePictureMaxSizeInBytes"
                @init="onCroppaInit"
                @file-choose="handleCroppaFileChoose"
                @new-image-drawn="handleUploadedProfileImage">
              </croppa>
            </div>
            <div class="q-pa-md q-gutter-sm profile-image-center"
              v-if="isMobileView">
              <div class="profile-detail" v-if="showProfileImage">
                <div class="profile-image">
                  <div class="profile-image-border">
                    <img :src="personalDetails.ProfileImage"
                      alt="profile-image">
                  </div>
                  <label class="edit-label-icon"
                   @click="profilePictureObject.chooseFile()">
                    <uil-pen size="1rem" class="edit-icon" />
                  </label>
                </div>
              </div>
              <div class="remove-profile-image">
                <q-btn
                  color="primary"
                  class="block text-capitalize"
                  size="sm"
                  @click="profilePictureObject.chooseFile()"
                  v-if="!showProfileImage"
                  flat>
                  {{ $t('userSettings.personalDetails.profileImageUpload') }}
                </q-btn>
                <q-btn
                  color="negative"
                  class="block negative text-capitalize"
                  size="sm"
                  @click="handleRemoveProfileImageDialog"
                  v-if="showProfileImage"
                  flat>&nbsp;
                  {{ $t('userSettings.personalDetails.profileImageDelete') }}
                </q-btn>
              </div>
            </div>
            <div class="profile-btns" v-if="!isMobileView">
              <q-item class="q-pa-md q-gutter-y-sm">
                <!-- Profile Image Upload Button -->
                <q-item-section side>
                  <q-item-label>
                    <q-btn
                      color="primary"
                      class="block text-capitalize"
                      size="sm"
                      @click="profilePictureObject.chooseFile()"
                      flat>
                      {{ $t('userSettings.personalDetails.profileImageUpload') }}
                    </q-btn>
                  </q-item-label>
                </q-item-section>
                <!-- Profile Image Delete Button -->
                <q-item-section side v-if="showProfileImage">
                  <q-item-label>
                    <q-btn
                      color="negative"
                      class="block negative text-capitalize"
                      size="sm"
                      icon="far fa-trash-alt"
                      @click="handleRemoveProfileImageDialog"
                      flat>&nbsp;
                      {{ $t('userSettings.personalDetails.profileImageDelete') }}
                    </q-btn>
                  </q-item-label>
                </q-item-section>
              </q-item>
            </div>
          </div>
        </div>
        <div class="col-6 col-100">
          <input-box
            v-model="personalDetails.firstName"
            :placeholder="$t('userSettings.personalDetails.firstName')"
            :title="$t('userSettings.personalDetails.firstName')"
            @input="handleChangeFirstName"
          />

          <div v-if="$v.personalDetails.firstName.$error
            && !$v.personalDetails.firstName.required"
            class="error-validation">
            {{ $t("userSettings.personalDetails.firstNameRequired") }}
          </div>
          <div v-if="$v.personalDetails.firstName.$error
            && !$v.personalDetails.firstName.alpha"
            class="error-validation">
            {{ $t("userSettings.personalDetails.firstNameAlpha") }}
          </div>
        </div>
        <div class="col-6 col-100">
          <input-box
            v-model="personalDetails.lastName"
            :placeholder="$t('userSettings.personalDetails.lastName')"
            :title="$t('userSettings.personalDetails.lastName')"
            @input="handleChangeLastName"
          />

          <div v-if="$v.personalDetails.lastName.$error
            && !$v.personalDetails.lastName.required"
            class="error-validation">
            {{ $t("userSettings.personalDetails.lastNameRequired") }}
          </div>
          <div v-if="$v.personalDetails.lastName.$error
            && !$v.personalDetails.lastName.alpha"
            class="error-validation">
            {{ $t("userSettings.personalDetails.lastNameAlpha") }}
          </div>
        </div>
        <div class="col-6 col-100">
          <input-box
            v-model="personalDetails.email"
            :placeholder="$t('userSettings.personalDetails.email')"
            :title="$t('userSettings.personalDetails.email')"
            disable readonly />
        </div>
        <div class="col-6 col-100">
          <input-box
            v-model="personalDetails.title"
            :placeholder="$t('userSettings.personalDetails.personTitle')"
            :title="$t('userSettings.personalDetails.personTitle')"
            disable readonly />

          <div v-if="$v.personalDetails.title.$error
            && !$v.personalDetails.title.required"
            class="error-validation">
            {{ $t('userSettings.personalDetails.personTitleRequired') }}
          </div>
          <div v-if="$v.personalDetails.title.$error
            && !$v.personalDetails.title.alpha"
            class="error-validation">
            {{ $t('userSettings.personalDetails.personTitleAlpha') }}
          </div>
        </div>
        <div class="col-3 col-100">
          <select-box
            v-model="personalDetails.countryCode"
            :options="countryCodesOptions"
            :placeholder="$t('userSettings.personalDetails.countryCode')"
            :title="$t('userSettings.personalDetails.countryCode')"
            @input="handleChangePhoneNumber"
            class="field-label"
          />

          <div v-if="$v.personalDetails.countryCode.$error
            && !$v.personalDetails.countryCode.required"
            class="error-validation">
            {{ $t('userSettings.personalDetails.countryCodeRequired') }}
          </div>
        </div>
        <div class="col-3 col-100">
          <input-box
            v-model="personalDetails.areaCode"
            :placeholder="$t('userSettings.personalDetails.areaCode')"
            :title="$t('userSettings.personalDetails.areaCode')"
            @input="handleChangePhoneNumber"
            class="field-label"
          />

          <div v-if="$v.personalDetails.areaCode.$error
            && !$v.personalDetails.areaCode.required"
            class="error-validation">
            {{ $t('userSettings.personalDetails.areaCodeRequired') }}
          </div>

          <div v-if="$v.personalDetails.areaCode.$error
            && !$v.personalDetails.areaCode.isThreeDigitsAreaCodeValid"
            class="error-validation">
            {{ $t('userSettings.personalDetails.areaCodeInValid') }}
          </div>
        </div>
        <div class="col-6 col-100">
          <input-box
            v-model="personalDetails.phoneNumber"
            :placeholder="$t('userSettings.personalDetails.phoneNumber')"
            :title="$t('userSettings.personalDetails.phoneNumber')"
            @input="handleChangePhoneNumber"
            class="field-label"
          />

          <div v-if="$v.personalDetails.phoneNumber.$error
            && !$v.personalDetails.phoneNumber.required"
            class="error-validation">
            {{ $t('userSettings.personalDetails.phoneNumberRequired') }}
          </div>

          <div v-if="$v.personalDetails.phoneNumber.$error
            && !$v.personalDetails.phoneNumber.isSevenDigitsPhoneNumberValid"
            class="error-validation">
            {{ $t('userSettings.personalDetails.phoneNumberValid') }}
          </div>
        </div>
      </div>
    </page-section>
    <!-- END: Personal Details Section -->
    <!-- START Profile Photo Delete Confirm Dialog Box -->
    <q-dialog v-model="isRemoveProfilePhotoDialogOpen" persistent>
      <q-card class="remove-profile-image-dialog">
        <q-card-section class="row flex-center">
          <q-avatar color="negative" text-color="white">
            <uil-times-circle size="3rem" />
          </q-avatar>
        </q-card-section>
        <q-card-section class="row items-center">
          <span class="q-ml-sm warning-text">
            {{ $t('userSettings.personalDetails.removeProfileImageConfirmMessage') }}
          </span>
        </q-card-section>
        <q-card-actions align="center">
          <q-btn outline
            :label="$t('userSettings.personalDetails.cancelButton')"
            class="cancel-button"
            v-close-popup
          />
          <q-btn
            outline
            :label="$t('userSettings.personalDetails.removeButton')"
            color="negative"
            class="remove-button text-capitalize"
            @click="removeProfileImage"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <!-- END Profile Photo Delete Confirm Dialog Box -->
  </div>
</template>

<script>
import { UilPen, UilTimesCircle } from '@iconscout/vue-unicons';
import { required, alpha } from 'vuelidate/lib/validators';
import utilValidation from 'src/common/utils/validation';
import { PageSection } from 'src/common/components/PageSection';
import InputBox from 'src/common/components/InputBox';
import SelectBox from 'src/common/components/SelectBox';
import countryCodesAPI from 'src/api/country-codes';
import userSettingsAPI from 'src/api/user-settings';

export default {
  name: 'personal-details',
  components: {
    PageSection,
    InputBox,
    SelectBox,
    UilPen,
    UilTimesCircle,
  },
  inject: ['userInformation', 'loadProfileImageFromUserInformation'],
  data() {
    return {
      showProfileImage: false,
      personalDetails: {},
      profilePictureObject: {},
      profilePictureMaxSizeInBytes: utilValidation.profilePictureMaxSizeInBytes,
      countryCodes: [],
      isNewFileChosen: false,
      isFileSizeLimitExceed: false,
      isRemoveProfilePhotoDialogOpen: false,
    };
  },
  created() {
    this.initializeModels()
      .catch(this.$showErrorNotification);
  },
  validations() {
    const isSevenDigitsPhoneNumberValid = utilValidation.isSevenDigitsPhoneNumberValid();
    const isThreeDigitsAreaCodeValid = utilValidation.isThreeDigitsAreaCodeValid();
    const validations = {
      personalDetails: {
        firstName: {
          required,
          alpha,
        },
        lastName: {
          required,
          alpha,
        },
        title: {
          required,
        },
        countryCode: {
          value: {
            required,
          },
        },
        areaCode: {
          required,
          isThreeDigitsAreaCodeValid,
        },
        phoneNumber: {
          required,
          isSevenDigitsPhoneNumberValid,
        },
      },
    };
    return validations;
  },
  methods: {
    addClipPluginToProfileImage() {
      this.profilePictureObject.addClipPlugin((ctx, x, y, w, h) => {
        /*
          * ctx: canvas context
          * x: start point (top-left corner) x coordination
          * y: start point (top-left corner) y coordination
          * w: croppa width
          * h: croppa height
        */
        ctx.beginPath();
        ctx.arc(x + w / 2, y + h / 2, w / 2, 0, 2 * Math.PI, true);
        ctx.closePath();
      });
    },
    onCroppaInit() {
      this.addClipPluginToProfileImage();
    },
    isProfileImageGeneratedDataURLValid(url) {
      return (typeof url === 'string' || url.length > 0);
    },
    generateDataURISchemeFromImage() {
      const url = this.profilePictureObject.generateDataUrl();
      return url;
    },
    handleRemoveProfileImageDialog() {
      this.isRemoveProfilePhotoDialogOpen = true;
    },
    removeProfileImage() {
      userSettingsAPI.setProfileImage(null)
        .then(() => {
          this.profilePictureObject.remove();
          this.profilePictureObject.refresh();
          this.showProfileImage = false;
          this.isNewFileChosen = false;
          this.isFileSizeLimitExceed = false;
          this.personalDetails.ProfileImage = null;
          this.isRemoveProfilePhotoDialogOpen = false;
          this.loadProfileImageFromUserInformation();
          this.$showSuccessNotification(
            this.$t('userSettings.personalDetails.removeProfileImageMessage'),
          );
        });
    },
    handleCroppaFileSizeExceed() {
      this.isFileSizeLimitExceed = true;
      const failureMessage = this.$t('userSettings.personalDetails.profileImageSizeValidate', {
        size: this.getImageSizeByteToMb(this.profilePictureMaxSizeInBytes),
      });
      this.$showErrorNotification(failureMessage);
    },
    handleCroppaFileChoose() {
      this.isNewFileChosen = true;
      this.isFileSizeLimitExceed = false;
    },
    handleUploadedProfileImage() {
      if (this.isNewFileChosen === true && this.isFileSizeLimitExceed === false) {
        this.handleChangeProfileImage();
      }
    },
    getImageSizeByteToMb(byteSize) {
      return Math.ceil(byteSize / (1024 ** 2));
    },
    findCountryCodeOption(currentCountryCode) {
      return this.countryCodesOptions.find(code => code.value === currentCountryCode);
    },
    loadPersonalDetailsFromUserInformation() {
      const info = this.userInformation();
      return userSettingsAPI.getProfileImage(info.profile_photo_url)
        .then((response) => {
          const ProfileImage = response.data.data.profile_photo;
          this.personalDetails = {
            firstName: info.first_name,
            lastName: info.last_name,
            email: info.email,
            title: info.title,
            countryCode: this.findCountryCodeOption(info.phone_number_country_code),
            areaCode: info.phone_number_area_code,
            phoneNumber: info.phone_number,
            ProfileImage,
          };
          this.profilePictureObject.refresh();
          this.showProfileImage = true;
        })
        .catch((error) => {
          this.$showErrorNotification(error);
        });
    },
    loadCountryCodes() {
      return countryCodesAPI.getList()
        .then((response) => {
          this.countryCodes = response.data.data.country_codes;
        });
    },
    initializeModels() {
      return this.loadCountryCodes()
        .then(() => {
          this.loadPersonalDetailsFromUserInformation();
        });
    },
    validateFormElements(elements) {
      let elementsRef = elements;
      if (Array.isArray(elements) === false) {
        elementsRef = [elementsRef];
      }
      let valid = true;
      elementsRef.forEach((element) => {
        this.$v.personalDetails[element].$touch();
        if (valid === true) {
          valid = this.$v.personalDetails[element].$error === false;
        }
      });
      return valid;
    },
    handleChangeFirstName() {
      if (this.validateFormElements('firstName') === true) {
        userSettingsAPI.setFirstName(this.personalDetails.firstName)
          .then(() => this.$showSuccessNotification(
            this.$t('userSettings.personalDetails.firstNameChangedSuccessfully'),
          ))
          .catch(this.$showErrorNotification);
      }
    },
    handleChangeLastName() {
      if (this.validateFormElements('lastName') === true) {
        userSettingsAPI.setLastName(this.personalDetails.lastName)
          .then(() => this.$showSuccessNotification(
            this.$t('userSettings.personalDetails.lastNameChangedSuccessfully'),
          ))
          .catch(this.$showErrorNotification);
      }
    },
    handleChangePhoneNumber() {
      if (this.validateFormElements([
        'countryCode',
        'areaCode',
        'phoneNumber',
      ]) === true) {
        userSettingsAPI.setPhoneNumber({
          countryCode: this.personalDetails.countryCode.value,
          areaCode: this.personalDetails.areaCode,
          number: this.personalDetails.phoneNumber,
        })
          .then(() => this.$showSuccessNotification(
            this.$t('userSettings.personalDetails.phoneNumberChangedSuccessfully'),
          ))
          .catch(this.$showErrorNotification);
      }
    },
    handleChangeProfileImage() {
      return Promise.resolve()
        .then(() => {
          const imageDataUriScheme = this.generateDataURISchemeFromImage();
          if (this.isProfileImageGeneratedDataURLValid(imageDataUriScheme) === false) {
            throw new Error(this.$t('userSettings.personalDetails.noProfileImageSelected'));
          }
          userSettingsAPI.setProfileImage(imageDataUriScheme)
            .then(() => {
              this.showProfileImage = true;
              this.isNewFileChosen = false;
              this.personalDetails.ProfileImage = imageDataUriScheme;
              this.loadProfileImageFromUserInformation();
              this.$showSuccessNotification(
                this.$t('userSettings.personalDetails.profileImageChangedSuccessfully'),
              );
            });
        })
        .catch(this.$showErrorNotification);
    },
  },
  computed: {
    countryCodesOptions() {
      return this.countryCodes.map(countryCode => ({
        label: `+${countryCode}`,
        value: countryCode,
      }));
    },
    isMobileView() {
      return this.$q.screen.xs === true;
    },
  },
};
</script>

<style lang="stylus" scoped>
.remove-profile-image-dialog.q-card {
  .warning-text {
    color: $title-color;
    font-weight: 800;
    font-size: 1rem;
    text-align: center;
  }
  .cancel-button {
    color: $label-color;
    text-transform: capitalize;
  }
}
.personal-details-container {
  .error-validation {
    color: $negative;
    clear: both;
    font-size: 70%;
  }
  >>> .profile-header {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    flex-direction: row;
    .profile-image-center {
      margin-left: auto;
      margin-right: auto;
      display: block;
    }
  }
  >>> .user-profile-image {
    margin-left: 0rem;
    canvas {
      height: 3.125rem !important;
      width: 3.125rem !important;
    }
  }
  .display-none {
    display: none;
  }
  .field-label >>> label {
    display: inline-block;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: -0.375rem;
  }
  >>> .profile-detail {
    .profile-image {
      position: relative;
      .edit-label-icon {
        position: absolute;
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 100%;
        background: $link-color;
        border: 0.125rem solid $body-color;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
        right: -0.625rem;
        bottom: -0.3125rem;
        z-index: 10;
        cursor: pointer;
        .edit-icon {
          color: $body-color;
        }
      }
    }
    .profile-image-border {
      width: 6.25rem;
      height: 6.25rem;
      overflow: hidden;
      border-radius: 100%;
      display: flex;
      align-items: center;
      background-size: cover;
      z-index: 0;
      &::after {
        content: '';
        position: absolute;
        top: -0.3125rem;
        right: 0;
        margin: 0 auto;
        left: -0.3125rem;
        min-width: 6.875rem;
        max-width: 6.875rem;
        max-height: 6.875rem;
        min-height: 6.875rem;
        border-radius: 100%;
        z-index: 2;
        border: 0.0625rem solid $link-color;
      }
      img {
        width: 100%;
        height: auto;
        z-index: 10;
        position: relative;
      }
    }
  }
  >>> .desktop-view {
    visibility: inherit;
  }
  @media (max-width $breakpoint-sm-max) {
    >>> .desktop-view {
      display: none;
      visibility: hidden;
    }
  }
  @media (max-width: 767px) {
    .col-50 {
      width: 50%;
    }
    .col-100 {
      width: 100%;
    }
  }
  @media only screen and (min-device-width: 1024px) and (max-device-width: 1366px) \
    and (orientation: portrait) {
    .col-50 {
      width: 50%;
    }
    .col-100 {
      width: 100%;
    }
  }
}
</style>
