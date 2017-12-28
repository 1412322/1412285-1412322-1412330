module.exports = {
	entry: './app/index.jsx',
	output: {
		path: __dirname,
		filename: './public/bundle.js',
		publicPath: '/'
	},
	resolve: {
		modules: [__dirname, 'node_modules'],
		alias: {
			Main: 'app/components/layouts/main.js',
			Header: 'app/components/layouts/header.js',
			Menu: 'app/components/layouts/menu.js',
			Content: 'app/components/layouts/content.js',
			Footer: 'app/components/layouts/footer.js'
		}
	},
	module: {
		loaders: [
			{
				loader: 'babel-loader',
				query: {
					presets: ['react', 'es2015', 'stage-0']
				},
				test: /\.jsx?$/,
				exclude: /node_module/
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
};