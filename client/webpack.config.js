module.exports = {
	entry: [
		// 'react-hot-loader/patch',
		'./src/index.js'
	],
	output: {
		path: __dirname,
		filename: './public/bundle.js',
		publicPath: '/'
	},
	resolve: {
		modules: [__dirname, 'node_modules'],
		alias: {
			Main: 'src/app/components/layouts/main.js',
			Header: 'src/app/components/layouts/header.js',
			Menu: 'src/app/components/layouts/menu.js',
			Content: 'src/app/components/layouts/content.js',
			Footer: 'src/app/components/layouts/footer.js'
		}
	},
	module: {
		loaders: [
			{
				loader: ['babel-loader'],
				// query: {
				// 	presets: ['react', 'es2015', 'stage-0']
				// },
				test: /\.js?$/,
				exclude: /node_module/,
				// options: {
					
				// 	cacheDirectory: true,
				// 	plugins: [
				// 		'react-hot-loader/babel'
				// 	]
				// },
			},
			{
				test: /\.scss$/,
				use: [{
					loader: "style-loader" // creates style nodes from JS strings
				}, {
					loader: "css-loader" // translates CSS into CommonJS
				}, {
					loader: "sass-loader" // compiles Sass to CSS
				}]
			},
			{
				test: /\.(png|jpg|eot|woff|woff2|ttf|svg)$/,
				include: /.*/, // Because styleguidist requires either include or exclude.
				loader: 'url?limit=8192',
			}
		],
	},
	devServer: {
		contentBase: "./src",
		stats: {
			colors: true,
			chunks: false
		},
		inline: true,
		port: 3000,
		hot: true
	},
};