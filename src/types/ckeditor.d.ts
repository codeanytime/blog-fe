declare module '@ckeditor/ckeditor5-build-classic' {
  const ClassicEditor: any;
  export = ClassicEditor;
}

declare module '@ckeditor/ckeditor5-react' {
  import { ComponentType, ReactElement } from 'react';
  import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
  
  export interface CKEditorProps {
    disabled?: boolean;
    editor: typeof ClassicEditor;
    data?: string;
    id?: string;
    config?: object;
    onReady?: (editor: any) => void;
    onChange?: (event: any, editor: any) => void;
    onBlur?: (event: any, editor: any) => void;
    onFocus?: (event: any, editor: any) => void;
    onError?: (event: any, editor: any) => void;
  }
  
  export const CKEditor: ComponentType<CKEditorProps>;
}