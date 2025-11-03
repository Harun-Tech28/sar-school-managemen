module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@sar-school/shared': '../../packages/shared/src',
          },
        },
      ],
    ],
  };
};
