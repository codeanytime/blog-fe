import React, { useRef } from 'react';
import SunEditor from 'suneditor-react';
// Import SunEditor's CSS file first
import 'suneditor/dist/css/suneditor.min.css';
// Then import our custom CSS overrides
import '../styles/suneditor-custom.css';

interface EditorProps {
    initialContent?: string;
    onContentChange: (content: string) => void;
}

const Editor: React.FC<EditorProps> = ({ initialContent = '', onContentChange }) => {
    const editorRef = useRef<any>(null);

    const handleChange = (content: string) => {
        onContentChange(content);
    };

    const handleGetInstance = (sunEditor: any) => {
        editorRef.current = sunEditor;
    };

    return (
        <div className="editor-container">
            <div className="blog-editor">
                <SunEditor
                    setContents={initialContent}
                    onChange={handleChange}
                    getSunEditorInstance={handleGetInstance}
                    setOptions={{
                        buttonList: [
                            ['undo', 'redo'],
                            ['font', 'fontSize', 'formatBlock'],
                            ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
                            ['removeFormat'],
                            ['fontColor', 'hiliteColor', 'outdent', 'indent'],
                            ['align', 'horizontalRule', 'list', 'table'],
                            ['link', 'image', 'video'],
                            ['fullScreen', 'showBlocks', 'codeView'],
                        ],
                        defaultTag: 'p',
                        minHeight: '400px',
                        height: 'auto',
                        width: '100%',
                        placeholder: 'Nhập nội dung bài viết của bạn ở đây...',
                        videoFileInput: true,
                        videoUrlInput: true,
                        maxCharCount: 0,
                        charCounter: false,
                        lineHeights: [
                            { text: '1', value: 1 },
                            { text: '1.15', value: 1.15 },
                            { text: '1.5', value: 1.5 },
                            { text: '2', value: 2 }
                        ],
                        font: [
                            'Arial', 'Courier New', 'Georgia', 'Tahoma', 'Times New Roman', 'Verdana', 'Poppins'
                        ],
                        fontSize: [
                            10, 12, 14, 16, 18, 20, 22, 24, 28, 30, 36, 48, 60
                        ],
                        resizingBar: true
                    }}
                    defaultValue=""
                />
            </div>
        </div>
    );
};

export default Editor;