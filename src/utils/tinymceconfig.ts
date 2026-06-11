import type { RawEditorOptions } from 'tinymce'

export function createTinymceConfig(placeholder: string): RawEditorOptions {
  return {
    license_key: 'gpl',
    base_url: '/tinymce',
    suffix: '.min',
    height: 250,
    menubar: false,
    branding: false,
    resize: false,
    statusbar: false,
    plugins: ['lists', 'link', 'autolink', 'charmap', 'searchreplace', 'wordcount', 'emoticons', 'table'],
    toolbar:
      'bold italic underline strikethrough | ' +
      'forecolor backcolor | ' +
      'alignleft aligncenter alignright | ' +
      'bullist numlist | ' +
      'link table | ' +
      'removeformat',
    content_style: `
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-size: 13px;
        color: #374151;
        margin: 8px 12px;
        line-height: 1.5;
      }
    `,
    placeholder,
  }
}