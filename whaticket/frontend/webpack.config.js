module.exports = {
  resolve: {
    fallback: {
      path: require.resolve("path-browserify"),
    },
    alias: {
      "pdfjs-dist": "pdfjs-dist/legacy/build/pdf"
    }
  },
};
