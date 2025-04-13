declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module 'suneditor/dist/css/suneditor.min.css' {
  const styles: any;
  export default styles;
}