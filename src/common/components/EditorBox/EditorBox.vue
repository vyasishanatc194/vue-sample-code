<template>
  <div class="editor-box">
    <label v-if="title">
      <strong>{{ title }}</strong>
    </label>
    <q-editor
      v-on="listeners"
      @input="input"
      v-bind="$attrs"
      :definitions="definitions"
      min-height="5rem"
      :toolbar="toolbar"
      @paste.native="evt => pasteCapture(evt)"
      @drop.native="evt => dropCapture(evt)"
    />
  </div>
</template>

<script>
export default {
  name: 'editor-box',
  inheritAttrs: false,
  data() {
    return {
      toolbar: [
        ['bold', 'italic', 'strike', 'underline', 'subscript',
          'superscript', 'left', 'center', 'right', 'justify',
          'token', 'hr', 'link', 'custom_btn', 'fullscreen',
          'quote', 'unordered', 'ordered', 'undo', 'redo', 'upload',
          {
            label: this.$q.lang.editor.formatting,
            icon: this.$q.iconSet.editor.formatting,
            list: 'no-icons',
            options: [
              'p',
              'h1',
              'h2',
              'h3',
              'h4',
              'h5',
              'h6',
              'code',
            ],
          },
        ],
      ],
      definitions: {
        upload: {
          tip: 'Upload Image',
          icon: 'image',
          handler: this.uploadIt,
        },
      },
    };
  },
  props: {
    title: {
      type: String,
      default: () => '',
    },
  },
  computed: {
    listeners() {
      const { input, ...listeners } = this.$listeners;
      return listeners;
    },
  },
  methods: {
    input(event) {
      this.$emit('input', event);
    },
    uploadIt() {
      // create an input file element to open file dialog
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.png, .jpg'; // file extensions allowed
      let file;
      input.onchange = () => {
        const files = Array.from(input.files);
        [file] = files;

        // lets load the file as dataUrl
        const reader = new FileReader();
        let dataUrl = '';
        reader.onloadend = () => {
          dataUrl = reader.result;
          document.execCommand('insertHTML', true, `<div><img src=${dataUrl} /></div>`);
        };
        reader.readAsDataURL(file);
      };
      input.click();
    },
    pasteCapture(event) {
      // TODO: Currently, Working in Firefox but not in Chrome -
      // needs look for solution Chrome.
      return event;
    },
    dropCapture(event) {
      // TODO: Currently, Working in Firefox but not in Chrome -
      // needs look for solution Chrome.
      return event;
    },
  },
};
</script>

<style lang="stylus">
</style>
