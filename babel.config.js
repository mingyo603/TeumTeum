module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module-resolver', {
        root: ['./'],
        alias: {
          '@': './',
          '@/components': './components',
          '@/screens': './screens',
          '@/storage': './storage',
          '@/utils': './utils',
          '@/context': './context',
        },
        extensions: ['.js','.jsx','.ts','.tsx','.json'],
      }],
      'react-native-reanimated/plugin', // ← 항상 맨 마지막
    ],
  };
};
